import { supabase } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
    console.log('Testing Supabase connection...')

    // Test 1: Check environment variables
    const envCheck = {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }

    console.log('Environment check:', envCheck)

    // Test 2: Try with anon key
    const { data: anonData, error: anonError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

    console.log('Anon key test:', { data: anonData, error: anonError })

    // Test 3: Try with service role
    const { data: adminData, error: adminError } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1)

    console.log('Service role test:', { data: adminData, error: adminError })

    return Response.json({
        envCheck,
        anonTest: { data: anonData, error: anonError?.message },
        adminTest: { data: adminData, error: adminError?.message }
    })
}