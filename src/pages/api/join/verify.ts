// src/pages/api/join/verify.ts
import type { APIRoute } from 'astro';
import Airtable from 'airtable';
import { decryptState } from '../../../utils/crypto';

export const prerender = false;

// Initialize Airtable Base safely using AIRTABLE_PAT or AIRTABLE_API_KEY
const airtableApiKey =
  import.meta.env.AIRTABLE_PAT ||
  process.env.AIRTABLE_PAT ||
  import.meta.env.AIRTABLE_API_KEY ||
  process.env.AIRTABLE_API_KEY;

const airtableBaseId =
  import.meta.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appZCQu0sXqoY8hx0';

const tableName =
  import.meta.env.AIRTABLE_TABLE_NAME ||
  process.env.AIRTABLE_TABLE_NAME ||
  'tblJcwEC9U7IGIWiB';

const base =
  airtableApiKey && airtableBaseId
    ? new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId)
    : null;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    let payload: Record<string, any> = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const formData = await request.formData();
      payload = {
        code: formData.get('code')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        docusignEnabled: formData.get('docusignEnabled') || formData.get('docusign'),
      };
    }

    const cleanCode = String(payload.code || '').trim();

    // 1. Validate 4-digit format
    if (!/^\d{4}$/.test(cleanCode)) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Please enter a valid 4-digit verification code.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Decrypt Session Cookie to retrieve form data & verify code match
    const cookieData = cookies.get('v_state')?.value;
    let sessionData: Record<string, any> = {};

    if (!cookieData) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Verification session expired. Please request a new code.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const decrypted = decryptState(cookieData);
    if (!decrypted) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Invalid verification session. Please request a new code.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    sessionData = decrypted;

    // Check code match against decrypted session code
    const sessionCode = String(sessionData.code || '').trim();
    if (sessionCode !== cleanCode) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Invalid verification code. Please check your email and try again.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check code expiration (15 min timer)
    if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Verification code has expired. Please request a new code.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isDocuSign =
      payload.docusignEnabled === true ||
      payload.docusignEnabled === 'true' ||
      payload.docusignEnabled === 'Yes';

    // 3. AIRTABLE RECORD INSERTION (MATCHING EXACT TABLE COLUMNS)
    if (base) {
      try {
        const airtableFields: Record<string, any> = {
          'Company Name': sessionData.companyName || '',
          'Partner POC Name': sessionData.contactName || '',
          'Partner POC email': sessionData.email || payload.email || '',
          'Allowed Domains': sessionData.allowedDomains || '',
          'Docusign Enabled': isDocuSign ? 'Yes' : 'No',
        };

        await base(tableName).create([{ fields: airtableFields }]);
        console.log('✅ Airtable agreement record created successfully.');
      } catch (airtableError) {
        console.error('❌ AIRTABLE WRITE ERROR:', airtableError);
      }
    } else {
      console.warn('⚠️ Airtable credentials missing in .env — skipping record creation.');
    }

    // Clear session cookie upon successful verification
    cookies.delete('v_state', { path: '/' });

    // 4. RETURN SUCCESS MESSAGE (NO REDIRECT)
    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'Your request has been successfully submitted, you will be receiving an email with the Membership Agreement, please follow the instructions in that email.',
        redirectUrl: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in verify.ts:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Internal server error while verifying code.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

