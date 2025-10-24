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
    const clientId = Deno.env.get('TEKMETRIC_CLIENT_ID')
    const clientSecret = Deno.env.get('TEKMETRIC_CLIENT_SECRET')
    
    console.log('Client ID exists:', !!clientId)
    console.log('Client ID length:', clientId?.length || 0)
    console.log('Client Secret exists:', !!clientSecret)
    console.log('Client Secret length:', clientSecret?.length || 0)
    
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing credentials',
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Test the authentication
    const credentials = btoa(`${clientId}:${clientSecret}`)
    console.log('Credentials encoded, attempting auth...')
    
    const response = await fetch('https://api.tekmetric.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('Response body:', responseText)

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          status: response.status,
          statusText: response.statusText,
          responseBody: responseText
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    try {
      const tokenData = JSON.parse(responseText)
      return new Response(
        JSON.stringify({ 
          success: true,
          hasToken: !!tokenData.access_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in,
          scope: tokenData.scope
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON response',
          responseBody: responseText
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in debug-auth:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})