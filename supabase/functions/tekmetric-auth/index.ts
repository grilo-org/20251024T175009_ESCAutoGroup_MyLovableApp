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
    
    if (!clientId || !clientSecret) {
      console.error('Missing Tekmetric credentials')
      return new Response(
        JSON.stringify({ error: 'Missing Tekmetric credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Encode credentials for Basic Auth
    const credentials = btoa(`${clientId}:${clientSecret}`)
    
    console.log('Requesting Tekmetric access token...')
    
    const response = await fetch('https://shop.tekmetric.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      console.error('Failed to get access token:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Tekmetric' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await response.json()
    console.log('Successfully obtained access token, scope:', tokenData.scope)

    return new Response(
      JSON.stringify(tokenData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in tekmetric-auth:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})