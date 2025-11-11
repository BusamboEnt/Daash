// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  walletAddress: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the notification payload
    const payload: NotificationPayload = await req.json()
    const { walletAddress, title, body, data = {} } = payload

    if (!walletAddress || !title || !body) {
      throw new Error('Missing required fields: walletAddress, title, body')
    }

    // Get FCM tokens for this wallet address
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('push_tokens')
      .select('fcm_token, platform')
      .eq('wallet_address', walletAddress)

    if (tokensError) {
      throw new Error(`Failed to fetch FCM tokens: ${tokensError.message}`)
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No FCM tokens found for wallet address',
          sent: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // Get Firebase Admin credentials from environment
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID')
    const firebasePrivateKey = Deno.env.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n')
    const firebaseClientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL')

    if (!firebaseProjectId || !firebasePrivateKey || !firebaseClientEmail) {
      throw new Error('Firebase Admin credentials not configured')
    }

    // Send notifications to all tokens
    const results = await Promise.allSettled(
      tokens.map(async (tokenData) => {
        // Send notification using Firebase Admin SDK
        // Note: You'll need to implement the actual Firebase Admin SDK integration
        // This is a placeholder showing the structure

        const notification = {
          notification: {
            title,
            body,
          },
          data: {
            ...data,
            wallet_address: walletAddress,
          },
          token: tokenData.fcm_token,
        }

        // TODO: Implement actual Firebase Admin SDK call here
        // For now, this is a placeholder
        console.log('Would send notification:', notification)

        return {
          success: true,
          token: tokenData.fcm_token.substring(0, 20) + '...',
          platform: tokenData.platform
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications sent`,
        sent: successful,
        failed,
        total: tokens.length,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: (r as PromiseRejectedResult).reason })
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

/* To invoke this function locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-push-notification' \
    --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"walletAddress":"GXXXXX","title":"Payment Received","body":"+10.5 XLM","data":{"type":"transaction_received"}}'

*/
