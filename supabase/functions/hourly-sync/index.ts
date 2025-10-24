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

async function logSyncStart() {
  const { data, error } = await supabase
    .from('tekmetric_sync_logs')
    .insert({
      status: 'in_progress',
      sync_started_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error logging sync start:', error)
    return null
  }
  
  return data.id
}

async function logSyncComplete(syncId: string, successCount: number, errorCount: number, errors: any[] = []) {
  await supabase
    .from('tekmetric_sync_logs')
    .update({
      status: errorCount > 0 ? 'completed_with_errors' : 'completed',
      sync_completed_at: new Date().toISOString(),
      success_count: successCount,
      error_count: errorCount,
      errors: errors.length > 0 ? errors : null
    })
    .eq('id', syncId)
}

async function invokeSyncFunction(functionName: string) {
  try {
    console.log(`Invoking ${functionName}...`)
    
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`${functionName} failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log(`${functionName} completed successfully:`, result)
    return { success: true, result }

  } catch (error) {
    console.error(`Error in ${functionName}:`, error)
    return { success: false, error: error.message }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  let syncId: string | null = null
  const errors: any[] = []
  let successCount = 0

  try {
    console.log('Starting hourly Tekmetric sync...')
    
    // Log sync start
    syncId = await logSyncStart()
    
    // Sync historical data
    const historicalResult = await invokeSyncFunction('sync-historical-data')
    if (historicalResult.success) {
      successCount++
    } else {
      errors.push({ function: 'sync-historical-data', error: historicalResult.error })
    }
    
    // Sync aging WIP data
    const wipResult = await invokeSyncFunction('sync-aging-wip')
    if (wipResult.success) {
      successCount++
    } else {
      errors.push({ function: 'sync-aging-wip', error: wipResult.error })
    }
    
    // Log completion
    if (syncId) {
      await logSyncComplete(syncId, successCount, errors.length, errors)
    }
    
    const summary = {
      success: true,
      syncId,
      successCount,
      errorCount: errors.length,
      errors,
      timestamp: new Date().toISOString()
    }
    
    console.log('Hourly sync completed:', summary)
    
    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in hourly-sync:', error)
    
    // Log error
    if (syncId) {
      await logSyncComplete(syncId, successCount, 1, [{ error: error.message }])
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})