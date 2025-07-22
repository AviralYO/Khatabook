import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    
    console.log('New user created:', record.id)
    console.log('User metadata:', record.raw_user_meta_data)

    // Insert into store_owners table using service role (bypasses RLS)
    const { error } = await supabaseClient
      .from('store_owners')
      .insert({
        id: record.id,
        email: record.email,
        store_name: record.raw_user_meta_data?.store_name || '',
        owner_name: record.raw_user_meta_data?.owner_name || '',
        phone: record.raw_user_meta_data?.phone || '',
        address: record.raw_user_meta_data?.address || '',
      })

    if (error) {
      console.error('Error inserting store owner:', error)
      throw error
    }

    console.log('Store owner profile created successfully')

    return new Response(
      JSON.stringify({ message: 'Store owner profile created' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})