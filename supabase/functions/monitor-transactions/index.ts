// Stellar Transaction Monitor
// This function polls the Stellar Horizon API for new transactions
// and sends push notifications when transactions are detected

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STELLAR_HORIZON_URL = 'https://horizon-testnet.stellar.org'
const LAST_TRANSACTION_KEY = '@last_transaction_cursor'

interface MonitorRequest {
  walletAddress: string;
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

    // Get the wallet address to monitor
    const { walletAddress }: MonitorRequest = await req.json()

    if (!walletAddress) {
      throw new Error('walletAddress is required')
    }

    // Get last processed transaction cursor from storage
    // In production, you'd store this in a database table
    let lastCursor: string | null = null

    // Fetch recent transactions for this wallet
    const transactionsUrl = `${STELLAR_HORIZON_URL}/accounts/${walletAddress}/transactions?order=desc&limit=10`

    const response = await fetch(transactionsUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`)
    }

    const transactionsData = await response.json()
    const transactions = transactionsData._embedded?.records || []

    if (transactions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No transactions found',
          newTransactions: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Filter for new transactions (since last cursor)
    const newTransactions = lastCursor
      ? transactions.filter((tx: any) => tx.paging_token > lastCursor)
      : [transactions[0]] // If no cursor, only process the latest transaction

    if (newTransactions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No new transactions',
          newTransactions: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Process each new transaction
    const notifications = []

    for (const tx of newTransactions) {
      // Get transaction operations to determine if it's a payment
      const opsUrl = `${STELLAR_HORIZON_URL}/transactions/${tx.id}/operations`
      const opsResponse = await fetch(opsUrl)

      if (!opsResponse.ok) continue

      const opsData = await opsResponse.json()
      const operations = opsData._embedded?.records || []

      // Look for payment operations
      for (const op of operations) {
        if (op.type === 'payment' && op.to === walletAddress) {
          // This is a payment TO the user
          notifications.push({
            walletAddress,
            title: 'Payment Received',
            body: `+${op.amount} ${op.asset_code || 'XLM'}`,
            data: {
              type: 'transaction_received',
              amount: op.amount,
              asset: op.asset_code || 'XLM',
              from: op.from,
              transaction_hash: tx.hash,
            }
          })
        } else if (op.type === 'payment' && op.from === walletAddress) {
          // This is a payment FROM the user
          notifications.push({
            walletAddress,
            title: 'Payment Sent',
            body: `-${op.amount} ${op.asset_code || 'XLM'}`,
            data: {
              type: 'transaction_sent',
              amount: op.amount,
              asset: op.asset_code || 'XLM',
              to: op.to,
              transaction_hash: tx.hash,
            }
          })
        }
      }
    }

    // Send notifications
    const notificationResults = []
    for (const notification of notifications) {
      try {
        // Call the send-push-notification function
        const sendResponse = await supabaseClient.functions.invoke('send-push-notification', {
          body: notification
        })

        notificationResults.push({
          success: sendResponse.error === null,
          notification: notification.title,
        })
      } catch (error) {
        console.error('Failed to send notification:', error)
        notificationResults.push({
          success: false,
          notification: notification.title,
          error: error.message
        })
      }
    }

    // Update last cursor (in production, store this in database)
    // For now, just log it
    if (newTransactions.length > 0) {
      console.log('Last processed cursor:', newTransactions[0].paging_token)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Transaction monitoring completed',
        newTransactions: newTransactions.length,
        notificationsSent: notificationResults.filter(r => r.success).length,
        results: notificationResults
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

  1. Run `supabase start`
  2. Deploy both functions:
     - supabase functions deploy send-push-notification
     - supabase functions deploy monitor-transactions
  3. Set up a cron job or periodic trigger to call this function every 30 seconds:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/monitor-transactions' \
    --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"walletAddress":"GXXXXX"}'

  For production, use Supabase Edge Functions Cron:
  https://supabase.com/docs/guides/functions/schedule-functions

*/
