import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { encryptState } from '../../../utils/crypto';

export const prerender = false;

// Initialize Resend using your secure system environment variable
const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    // 1. Generate random 4-digit code and set 5-minute expiration
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; 

    // 2. Blast code out through your Resend integration account
    await resend.emails.send({
      from: 'CoreCollective Announcements <noreply@corecollective.dev>',
      to: email,
      subject: 'Your 4-Digit Subscription Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Confirm your mailing list subscription</h2>
          <p>Please enter the following 4-digit code into your website browser window to finish joining our announcements mailing list:</p>
          <h1 style="background: #f4f4f5; padding: 15px; display: inline-block; letter-spacing: 5px; border-radius: 5px; margin: 10px 0;">${code}</h1>
          <p style="color: #666; font-size: 13px;">This verification code will expire in 5 minutes.</p>
        </div>
      `
    });

    // 3. Encrypt verification metadata and set an HTTP-only browser cookie
    const encryptedCookieValue = encryptState(email, code, expiresAt);
    cookies.set('v_state', encryptedCookieValue, {
      httpOnly: true,
      secure: true,
      maxAge: 300, // 5 minutes
      path: '/'
    });

    return new Response(JSON.stringify({ message: 'Code successfully dispatched!' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to send verification code email.' }), { status: 500 });
  }
};

