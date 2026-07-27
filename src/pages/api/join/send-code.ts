import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { JoinFormSchema, formatJoinPayload } from './security';
import { encryptState } from '../../../utils/crypto';

export const prerender = false;

// Fallback environment variable check (Astro import.meta vs Node process.env)
const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const rawData = await request.json();

    // 1. RUN SECURITY & BLOCKLIST VALIDATION via Zod Schema
    const result = JoinFormSchema.safeParse(rawData);

    if (!result.success) {
      // Extract formatted error messages from Zod validation
      const formattedErrors = result.error.flatten().fieldErrors;
      const firstErrorMessage =
        result.error.errors[0]?.message || 'Invalid form submission.';

      return new Response(
        JSON.stringify({
          status: 'error',
          message: firstErrorMessage,
          errors: formattedErrors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // -------------------------------------------------------------
    // ALL SECURITY CHECKS PASSED -> FORMAT PAYLOAD & GENERATE CODE
    // -------------------------------------------------------------
    const validatedData = result.data;
    const formattedPayload = formatJoinPayload(validatedData);

    // Generate random 4-digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');

    // 2. DISPATCH EMAIL VIA RESEND
    const fromAddress = import.meta.env.RESEND_FROM_EMAIL || 'CoreCollective <noreply@corecollective.dev>';

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: fromAddress,
      to: [validatedData.contactEmail],
      subject: 'Your CoreCollective Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">CoreCollective Email Verification</h2>
          <p style="color: #334155; font-size: 15px;">Use the following 4-digit verification code to complete your corporate membership application:</p>
          <div style="background-color: #f1f5f9; text-align: center; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 6px; color: #0284c7;">${verificationCode}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">This code will expire in 15 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('❌ RESEND DISPATCH ERROR:', emailError);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: emailError.message || 'Failed to send verification code email.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. SET ENCRYPTED COOKIE STATE WITH FULL METADATA (Valid for 15 minutes)
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const encryptedState = encryptState({
      code: verificationCode,
      email: validatedData.contactEmail,
      companyName: validatedData.companyName,
      contactName: validatedData.contactName,
      allowedDomains: validatedData.allowedDomains,
      docusignSignatoryEmail: validatedData.docusignSignatoryEmail,
      expiresAt,
    });

    cookies.set('v_state', encryptedState, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
    });

    // 4. FIRE MAKE.COM WEBHOOK IF CONFIGURATION IS PRESENT
    const webhookUrl = import.meta.env.MAKE_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formattedPayload,
          verification_code: verificationCode,
        }),
      }).catch((err) => console.error('Make Webhook Non-blocking Error:', err));
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'Verification code sent successfully.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Error in send-code.ts:', err);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Server error processing request.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

