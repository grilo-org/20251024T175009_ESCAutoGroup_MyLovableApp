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
        p_accessed_by: 'sync-aging-wip'
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
        last_accessed_by: 'sync-aging-wip',
        access_count: 0 // Reset count on refresh
      })

    // Log token refresh for security audit
    await supabase.rpc('audit_token_access', {
      p_token_id: 1,
      p_action: 'refreshed',
      p_accessed_by: 'sync-aging-wip'
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

function calculateAgingBucket(createdDate: string): string {
  const created = new Date(createdDate)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff <= 30) return '0-30 days'
  if (daysDiff <= 60) return '31-60 days'
  if (daysDiff <= 90) return '61-90 days'
  return '90+ days'
}

async function processAgingWIPData(shops: any[], token: string) {
  const agingData = []
  
  for (const shop of shops) {
    console.log(`Processing WIP for shop: ${shop.name} (ID: ${shop.id})`)
    
    try {
      // Get Work-in-Progress repair orders ONLY
      // This ensures that when invoices are posted (status changes to 3=Posted or 5=Closed),
      // they automatically drop off the aging WIP list
      const wipOrders = await fetchTekmetricData('repair-orders', token, {
        shop: shop.id,
        repairOrderStatusId: [2], // ONLY Work-in-Progress status (excludes Posted/Closed)
        size: 100
      })
      
      console.log(`Found ${wipOrders.content?.length || 0} active WIP orders for shop ${shop.name}`)
      
      // Process each WIP order
      if (wipOrders.content) {
        for (const ro of wipOrders.content) {
          const agingBucket = calculateAgingBucket(ro.createdDate)
          const daysSinceCreated = Math.floor((new Date().getTime() - new Date(ro.createdDate).getTime()) / (1000 * 60 * 60 * 24))
          
          // Get customer info
          let customerName = 'Unknown Customer'
          if (ro.customerId) {
            try {
              const customer = await fetchTekmetricData(`customers/${ro.customerId}`, token)
              customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
            } catch (error) {
              console.error(`Error fetching customer ${ro.customerId}:`, error)
            }
          }
          
          // Get vehicle info
          let vehicleInfo = 'Unknown Vehicle'
          if (ro.vehicleId) {
            try {
              const vehicle = await fetchTekmetricData(`vehicles/${ro.vehicleId}`, token)
              vehicleInfo = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim()
            } catch (error) {
              console.error(`Error fetching vehicle ${ro.vehicleId}:`, error)
            }
          }
          
          // Get payment information for deposits (only for non-posted repair orders)
          let depositAmount = 0
          if (ro.repairOrderStatusId !== 3) { // Not posted/completed
            try {
              const payments = await fetchTekmetricData(`repair-orders/${ro.id}/payments`, token)
              if (payments && payments.length > 0) {
                // Sum all payments as deposits for open repair orders
                depositAmount = Math.round(payments.reduce((sum: number, payment: any) => {
                  return sum + (payment.amountpaid || 0)
                }, 0) / 100) // Convert from cents
              }
            } catch (error) {
              console.error(`Error fetching payments for RO ${ro.id}:`, error)
            }
          }
          
          agingData.push({
            shop_id: shop.id,
            shop_name: shop.name,
            repair_order_id: ro.id,
            repair_order_number: ro.repairOrderNumber,
            customer_name: customerName,
            vehicle_info: vehicleInfo,
            created_date: ro.createdDate,
            days_since_created: daysSinceCreated,
            aging_bucket: agingBucket,
            total_sales: Math.round((ro.totalSales || 0) / 100), // Convert from cents
            labor_sales: Math.round((ro.laborSales || 0) / 100),
            parts_sales: Math.round((ro.partsSales || 0) / 100),
            sublet_sales: Math.round((ro.subletSales || 0) / 100),
            deposit_amount: depositAmount, // Add deposit amount to data
            status: ro.repairOrderStatus?.name || 'Work In Progress',
            label: ro.repairOrderLabel?.name || '',
            custom_label: ro.repairOrderCustomLabel?.name || '',
            technician_id: ro.technicianId,
            service_writer_id: ro.serviceWriterId,
          })
        }
      }
    } catch (error) {
      console.error(`Error processing WIP for shop ${shop.name}:`, error)
    }
  }
  
  return agingData
}

async function storeAgingWIPInDB(agingData: any[]) {
  console.log(`🔄 AGING WIP DATABASE UPDATE STARTING`)
  console.log(`📊 Processing ${agingData.length} WIP records for storage`)
  
  // Clear existing aging WIP data (full refresh to ensure posted invoices are removed)
  console.log(`🗑️ Clearing existing aging WIP data to remove posted invoices...`)
  const { error: deleteError } = await supabase
    .from('aging_wip')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
  
  if (deleteError) {
    console.error('❌ Error clearing aging WIP data:', deleteError)
    throw deleteError
  }
  
  // Insert fresh WIP data in batches
  console.log(`✅ Existing data cleared. Inserting fresh WIP data...`)
  const batchSize = 100
  for (let i = 0; i < agingData.length; i += batchSize) {
    const batch = agingData.slice(i, i + batchSize)
    const { error } = await supabase
      .from('aging_wip')
      .insert(batch)
    
    if (error) {
      console.error('❌ Error inserting aging WIP data batch:', error)
      throw error
    }
    
    console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(agingData.length/batchSize)}`)
  }
  
  console.log(`🎉 Stored ${agingData.length} aging WIP records in database`)
  console.log(`📝 Posted invoices have been removed from aging WIP list`)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting aging WIP sync...')
    
    // Get valid token
    const token = await getValidToken()
    
    // Get list of shops
    const shops = await fetchTekmetricData('shops', token)
    console.log(`Found ${shops.length} shops`)
    
    // Process aging WIP data
    const agingData = await processAgingWIPData(shops, token)
    
    // Store data in database
    await storeAgingWIPInDB(agingData)
    
    // Also cache for backward compatibility
    await cacheData('aging-wip', agingData, 30) // Cache for 30 minutes
    
    console.log(`Successfully synced aging WIP data for ${agingData.length} orders`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        syncedOrders: agingData.length,
        shops: shops.length,
        data: agingData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sync-aging-wip:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})