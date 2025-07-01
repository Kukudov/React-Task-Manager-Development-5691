import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  type: 'reminder' | 'due_now' | 'overdue' | 'daily_digest' | 'test'
  to: string
  subject: string
  html: string
  taskId?: string
  notificationId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests FIRST
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    console.log('📧 Processing email request...')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    const requestBody = await req.json()
    const { type, to, subject, html }: EmailRequest = requestBody
    
    console.log(`📧 Sending ${type} email to: ${to}`)
    console.log(`📧 Subject: ${subject}`)

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey && resendApiKey !== 'your-resend-api-key') {
      console.log('📧 Using Resend API for email delivery...')
      
      try {
        // Send email via Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Daily Tasks <noreply@dailytasks.app>',
            to: [to],
            subject: subject,
            html: html,
          }),
        })

        const emailResult = await emailResponse.json()

        if (emailResponse.ok) {
          console.log('✅ Email sent successfully via Resend:', emailResult.id)
          
          return new Response(
            JSON.stringify({
              success: true,
              emailId: emailResult.id,
              provider: 'resend'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        } else {
          console.error('❌ Resend API error:', emailResult)
          throw new Error(`Resend API error: ${emailResult.message || 'Unknown error'}`)
        }
      } catch (resendError) {
        console.error('Resend API failed, falling back to mock:', resendError)
        // Fall through to mock response
      }
    }
    
    // Mock response (for demo or when Resend fails)
    console.log('⚠️ Using mock email service (no Resend API key or API failed)')
    
    const mockEmailId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('📧 Mock email details:')
    console.log('  - To:', to)
    console.log('  - Subject:', subject)
    console.log('  - Type:', type)
    console.log('  - Mock ID:', mockEmailId)
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    return new Response(
      JSON.stringify({
        success: true,
        emailId: mockEmailId,
        message: 'Email processed successfully (demo mode)',
        provider: 'mock'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('❌ Error in send-email function:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})