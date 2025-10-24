import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

async function getValidToken() {
  try {
    // Check if we have a valid cached token
    const { data: tokenData } = await supabase
      .from('tekmetric_tokens')
      .select('*')
      .eq('id', 1)
      .single()

    if (tokenData && new Date(tokenData.expires_at) > new Date()) {
      console.log('Using cached token')
      
      // Log token access for security audit
      await supabase.rpc('audit_token_access', {
        p_token_id: tokenData.id,
        p_action: 'accessed',
        p_accessed_by: 'sync-historical-data'
      })
      
      return tokenData.access_token
    }

    console.log('Getting new token...')
    // Get new token
    const authResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/tekmetric-auth`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      }
    })

    if (!authResponse.ok) {
      throw new Error('Failed to get access token')
    }

    const authData = await authResponse.json()
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    // Store the token with security tracking
    await supabase
      .from('tekmetric_tokens')
      .upsert({
        id: 1,
        access_token: authData.access_token,
        expires_at: expiresAt.toISOString(),
        last_accessed_at: new Date().toISOString(),
        last_accessed_by: 'sync-historical-data',
        access_count: 0 // Reset count on refresh
      })

    // Log token refresh for security audit
    await supabase.rpc('audit_token_access', {
      p_token_id: 1,
      p_action: 'refreshed',
      p_accessed_by: 'sync-historical-data'
    })

    return authData.access_token
  } catch (error) {
    console.error('Error getting token:', error)
    throw error
  }
}

async function fetchTekmetricData(endpoint: string, token: string, params: Record<string, any> = {}) {
  const url = new URL(`https://shop.tekmetric.com/api/v1/${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString())
    }
  })

  console.log(`Fetching: ${url.toString()}`)

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    console.error(`API request failed: ${response.status} ${response.statusText}`)
    const errorText = await response.text()
    console.error('Error response:', errorText)
    throw new Error(`API request failed: ${response.status}`)
  }

  return await response.json()
}

async function cacheData(endpoint: string, data: any, cacheDurationMinutes: number = 60) {
  const expiresAt = new Date(Date.now() + cacheDurationMinutes * 60000)
  
  await supabase
    .from('tekmetric_cache')
    .upsert({
      endpoint,
      data,
      expires_at: expiresAt.toISOString()
    })
}

async function processHistoricalData(shops: any[], token: string) {
  const historicalData = []
  
  for (const shop of shops) {
    console.log(`Processing shop: ${shop.name} (ID: ${shop.id})`)
    
    try {
      // Reduce scope to prevent timeouts - only get last 1 year + current year
      const currentYear = new Date().getFullYear()
      const years = [currentYear, currentYear - 1] // Reduced from 3 years to 2 years
      
      for (const year of years) {
        // Get data for each month of the year
        for (let month = 1; month <= 12; month++) {
          const startDate = new Date(year, month - 1, 1).toISOString()
          const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()
          
          console.log(`Fetching data for ${shop.name} - ${year}-${month.toString().padStart(2, '0')}`)
          
          // Use smaller page size and implement pagination to handle API limits
          let allRepairOrders = []
          let page = 0
          let hasMoreData = true
          
          while (hasMoreData) {
            try {
              const repairOrders = await fetchTekmetricData('repair-orders', token, {
                shop: shop.id,
                start: startDate,
                end: endDate,
                repairOrderStatusId: [3, 5], // Complete and Posted
                size: 25, // Smaller page size to avoid rate limits
                page: page
              })
              
              if (repairOrders.content && repairOrders.content.length > 0) {
                allRepairOrders = allRepairOrders.concat(repairOrders.content)
                hasMoreData = repairOrders.content.length === 25 // Continue if we got a full page
                page++
                
                // Add delay between requests to respect rate limits
                if (hasMoreData) {
                  await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay
                }
              } else {
                hasMoreData = false
              }
            } catch (pageError) {
              console.error(`Error fetching page ${page} for ${shop.name}:`, pageError)
              hasMoreData = false
            }
          }
          
          console.log(`Fetched ${allRepairOrders.length} repair orders for ${shop.name} - ${year}-${month.toString().padStart(2, '0')}`)
          
          // Process the repair orders to calculate metrics
          let partsGross = 0, laborGross = 0, subletGross = 0
          let partsProfit = 0, laborProfit = 0, subletProfit = 0
          let carCount = 0, laborHours = 0, partsPiecesSold = 0
          
          for (const ro of allRepairOrders) {
            carCount++
            partsGross += ro.partsSales || 0
            laborGross += ro.laborSales || 0
            subletGross += ro.subletSales || 0
            
            // Estimate profit margins (these would need to be calculated from actual cost data)
            partsProfit += (ro.partsSales || 0) * 0.33 // Assume 33% margin
            laborProfit += (ro.laborSales || 0) * 0.68 // Assume 68% margin
            subletProfit += (ro.subletSales || 0) * 0.10 // Assume 10% margin
            
            // Count labor hours and parts from jobs
            if (ro.jobs) {
              for (const job of ro.jobs) {
                laborHours += job.laborHours || 0
                if (job.parts) {
                  partsPiecesSold += job.parts.length
                }
              }
            }
          }
          
          const totalGross = partsGross + laborGross + subletGross
          const totalProfit = partsProfit + laborProfit + subletProfit
          
          const monthData = {
            shop_id: shop.id,
            shop_name: shop.name,
            year,
            month,
            period: `${year}-${month.toString().padStart(2, '0')}`,
            parts_gross: Math.round(partsGross / 100), // Convert from cents to dollars
            parts_profit: Math.round(partsProfit / 100),
            parts_margin: partsGross > 0 ? (partsProfit / partsGross) * 100 : 0,
            parts_pieces_sold: partsPiecesSold,
            parts_avg_ticket: partsPiecesSold > 0 ? Math.round(partsGross / partsPiecesSold / 100) : 0,
            labor_gross: Math.round(laborGross / 100),
            labor_profit: Math.round(laborProfit / 100),
            labor_margin: laborGross > 0 ? (laborProfit / laborGross) * 100 : 0,
            labor_hours: laborHours,
            labor_avg_hour: laborHours > 0 ? Math.round(laborGross / laborHours / 100) : 0,
            sublet_gross: Math.round(subletGross / 100),
            sublet_profit: Math.round(subletProfit / 100),
            sublet_margin: subletGross > 0 ? (subletProfit / subletGross) * 100 : 0,
            total_gross: Math.round(totalGross / 100),
            total_profit: Math.round(totalProfit / 100),
            total_margin: totalGross > 0 ? (totalProfit / totalGross) * 100 : 0,
            car_count: carCount,
            avg_ro: carCount > 0 ? Math.round(totalGross / carCount / 100) : 0,
          }
          
          historicalData.push(monthData)
          
          // Add delay between months to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 250))
        }
      }
    } catch (error) {
      console.error(`Error processing shop ${shop.name}:`, error)
    }
  }
  
  return historicalData
}

async function storeHistoricalDataInDB(historicalData: any[]) {
  if (!historicalData || historicalData.length === 0) {
    console.log('No historical data to store')
    return
  }

  console.log(`Preparing to store ${historicalData.length} historical performance records`)
  
  // Record sync start time for audit trail
  const syncStartTime = new Date().toISOString()
  
  // DEDICATED HISTORICAL PERFORMANCE DATABASE STORAGE
  // This table is ONLY updated during sync operations from Tekmetric
  // It serves as the single source of truth for historical performance data
  
  try {
    // Step 1: Clear existing historical data (full refresh approach)
    console.log('Clearing existing historical performance data...')
    const { error: deleteError } = await supabase
      .from('historical_performance')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
    
    if (deleteError) {
      console.error('Error clearing historical data:', deleteError)
      throw deleteError
    }
    
    // Step 2: Insert fresh historical data in batches
    console.log('Inserting fresh historical performance data...')
    const batchSize = 50 // Optimized batch size for reliability
    let totalInserted = 0
    
    for (let i = 0; i < historicalData.length; i += batchSize) {
      const batch = historicalData.slice(i, i + batchSize)
      const batchNumber = Math.floor(i/batchSize) + 1
      const totalBatches = Math.ceil(historicalData.length/batchSize)
      
      console.log(`Inserting batch ${batchNumber}/${totalBatches} (${batch.length} records)`)
      
      // Add sync metadata to each record
      const batchWithMetadata = batch.map(record => ({
        ...record,
        // Ensure all required fields have defaults
        created_at: syncStartTime,
        updated_at: syncStartTime
      }))
      
      const { error, data } = await supabase
        .from('historical_performance')
        .insert(batchWithMetadata)
        .select('id')
      
      if (error) {
        console.error(`Error inserting batch ${batchNumber}:`, error)
        console.error('Failed batch data sample:', JSON.stringify(batchWithMetadata[0], null, 2))
        throw error
      }
      
      totalInserted += batchWithMetadata.length
      console.log(`✅ Batch ${batchNumber} completed: ${batchWithMetadata.length} records`)
      
      // Add delay between batches to prevent overload
      if (i + batchSize < historicalData.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`🎉 Successfully stored ${totalInserted} historical performance records`)
    console.log(`📊 Historical performance database updated at: ${syncStartTime}`)
    
    return { success: true, recordsStored: totalInserted, syncTime: syncStartTime }
    
  } catch (error) {
    console.error('❌ Failed to store historical performance data:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting historical data sync...')
    
    // Get valid token
    const token = await getValidToken()
    
    // Get list of shops
    const shops = await fetchTekmetricData('shops', token)
    console.log(`Found ${shops.length} shops`)
    
    // Process historical data
    const historicalData = await processHistoricalData(shops, token)
    
    // Store data in dedicated historical performance database
    const storeResult = await storeHistoricalDataInDB(historicalData)
    
    // Also cache for backward compatibility
    await cacheData('historical-performance', historicalData, 60) // Cache for 1 hour
    
    // Log successful sync operation
    console.log(`🎉 HISTORICAL PERFORMANCE SYNC COMPLETED`)
    console.log(`📊 Periods synced: ${historicalData.length}`)
    console.log(`🏪 Shops processed: ${shops.length}`)
    console.log(`⏰ Sync time: ${storeResult.syncTime}`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Historical performance data successfully synced to dedicated database',
        syncedPeriods: historicalData.length,
        shops: shops.length,
        recordsStored: storeResult.recordsStored,
        syncTime: storeResult.syncTime,
        dataSource: 'tekmetric_api',
        storageLocation: 'historical_performance_table'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sync-historical-data:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})