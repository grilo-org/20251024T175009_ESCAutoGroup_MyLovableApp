import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Testing Tekmetric API connection...')
    
    const clientId = Deno.env.get('TEKMETRIC_CLIENT_ID')
    const clientSecret = Deno.env.get('TEKMETRIC_CLIENT_SECRET')
    
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing credentials',
          clientId: clientId ? 'Present' : 'Missing',
          clientSecret: clientSecret ? 'Present' : 'Missing'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Test authentication
    const credentials = btoa(`${clientId}:${clientSecret}`)
    console.log('Testing with clientId:', clientId.substring(0, 8) + '...')
    
    const authResponse = await fetch('https://api.tekmetric.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })

    const authResult = await authResponse.text()
    console.log('Auth response status:', authResponse.status)
    console.log('Auth response:', authResult)

    if (!authResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          status: authResponse.status,
          response: authResult,
          credentials: 'Client ID: ' + clientId.substring(0, 8) + '... Client Secret: ' + clientSecret.substring(0, 8) + '...'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = JSON.parse(authResult)
    
    // Test API call with token
    const testApiResponse = await fetch('https://api.tekmetric.com/api/v1/shops', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      }
    })

    const apiResult = await testApiResponse.text()
    console.log('API test status:', testApiResponse.status)
    console.log('API test response:', apiResult)

    return new Response(
      JSON.stringify({ 
        authStatus: authResponse.status,
        tokenReceived: !!tokenData.access_token,
        tokenScope: tokenData.scope,
        apiTestStatus: testApiResponse.status,
        apiTestResponse: testApiResponse.ok ? JSON.parse(apiResult) : apiResult,
        success: authResponse.ok && testApiResponse.ok
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in test:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})