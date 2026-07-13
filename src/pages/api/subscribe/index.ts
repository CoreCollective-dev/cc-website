import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const email = data.email;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    const baseUrl = import.meta.env.CAUSEWAY_BASE_URL;
    const user = import.meta.env.CAUSEWAY_AUTH_USER;
    const pass = import.meta.env.CAUSEWAY_AUTH_PASS;

    const authString = Buffer.from(`${user}:${pass}`).toString('base64');
    const targetUrl = `${baseUrl}/mailingList/subscribe`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      // Hardcoded directly to your independent list ID discovered via the UI URL
      body: JSON.stringify({ 
        email: email,
        list_id: 14 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Causeway error: ${errorText}` }), { status: response.status });
    }

    return new Response(JSON.stringify({ message: 'Successfully subscribed!' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

