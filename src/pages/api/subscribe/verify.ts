import type { APIRoute } from 'astro';
import { decryptState } from '../../../utils/crypto';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { userInputCode } = await request.json();
    const cookieData = cookies.get('v_state')?.value;

    if (!cookieData) {
      return new Response(JSON.stringify({ error: 'Session expired. Please request a new verification code.' }), { status: 400 });
    }

    // Decrypt state parameters safely
    const state = decryptState(cookieData);
    if (!state) {
      return new Response(JSON.stringify({ error: 'Tampered or invalid token verification session.' }), { status: 400 });
    }

    // Evaluate matching rules and timers
    if (state.code !== userInputCode.trim()) {
      return new Response(JSON.stringify({ error: 'The code you entered is incorrect. Please try again.' }), { status: 400 });
    }
    if (Date.now() > state.expiresAt) {
      return new Response(JSON.stringify({ error: 'Verification code expired. Please request a new code.' }), { status: 400 });
    }

    // --- VERIFICATION SECURED! Proceeding to hand off to Causeway list 14 ---
    const authString = Buffer.from(`${import.meta.env.CAUSEWAY_AUTH_USER}:${import.meta.env.CAUSEWAY_AUTH_PASS}`).toString('base64');
    
    const response = await fetch(`${import.meta.env.CAUSEWAY_BASE_URL}/mailingList/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify({ 
        email: state.email,
        list_id: 14 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Causeway subscription error: ${errorText}` }), { status: response.status });
    }

    // Success clean up: Delete code cookie state out of user browser
    cookies.delete('v_state', { path: '/' });
    return new Response(JSON.stringify({ message: 'Successfully verified and subscribed!' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Verification Server Error' }), { status: 500 });
  }
};

