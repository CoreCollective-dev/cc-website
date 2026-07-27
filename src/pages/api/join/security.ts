// src/pages/api/join/security.ts
import { z } from 'zod';

// ============================================================================
// 1. US / GLOBAL PUBLIC FREEMAIL PROVIDERS
// ============================================================================
export const BLOCKED_GLOBAL_FREEMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'passport.com',
  'aol.com',
  'aim.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'pm.me',
  'zoho.com',
  'zohomail.com',
  'fastmail.com',
  'fastmail.fm',
  'hushmail.com',
  'tutanota.com',
  'tutamail.com',
  'tuta.io',
  'lycos.com',
  'inbox.com',
]);

// ============================================================================
// 2. ASIA & PACIFIC REGIONAL FREEMAIL / WEBMAIL PROVIDERS
// ============================================================================
export const BLOCKED_ASIA_FREEMAIL_DOMAINS = new Set([
  // China / East Asia Major Webmail
  'qq.com',
  '163.com',
  '126.com',
  'yeah.net',
  'sina.com',
  'sina.cn',
  'sohu.com',
  'tom.com',
  'aliyun.com',
  'foxmail.com',
  '21cn.com',
  '188.com',
  'baidu.com',
  // Japan / Korea Major Webmail
  'yahoo.co.jp',
  'naver.com',
  'daum.net',
  'hanmail.net',
  'nate.com',
  'docomo.ne.jp',
  'ezweb.ne.jp',
  'softbank.ne.jp',
  // India / Southeast Asia Freemail
  'rediffmail.com',
  'sify.com',
  'indiatimes.com',
]);

// ============================================================================
// 3. EUROPEAN REGIONAL FREEMAIL / WEBMAIL PROVIDERS
// ============================================================================
export const BLOCKED_EU_FREEMAIL_DOMAINS = new Set([
  // Germany / DACH Region
  'gmx.de',
  'gmx.net',
  'gmx.at',
  'gmx.ch',
  'gmx.com',
  'web.de',
  't-online.de',
  'freenet.de',
  'arcor.de',
  'posteo.de',
  // France
  'orange.fr',
  'wanadoo.fr',
  'free.fr',
  'laposte.net',
  'sfr.fr',
  'neuf.fr',
  // UK
  'yahoo.co.uk',
  'hotmail.co.uk',
  'outlook.co.uk',
  'btinternet.com',
  'virginmedia.com',
  'sky.com',
  'talktalk.net',
  // Italy / Spain / Netherlands
  'libero.it',
  'virgilio.it',
  'tin.it',
  'alice.it',
  'terra.es',
  'teleline.es',
  'ziggo.nl',
  'kpnmail.nl',
  // Eastern Europe & Russia
  'mail.ru',
  'yandex.ru',
  'yandex.com',
  'rambler.ru',
  'bk.ru',
  'inbox.ru',
  'list.ru',
  'ukr.net',
  'wp.pl',
  'onet.pl',
  'interia.pl',
  'seznam.cz',
  'centrum.cz',
]);

// ============================================================================
// 4. FOUNDATION, KERNEL & OPEN SOURCE ORG DOMAINS
// ============================================================================
export const BLOCKED_FOUNDATION_DOMAINS = new Set([
  'kernel.org',
  'linuxfoundation.org',
  'apache.org',
  'eclipse.org',
  'cncf.io',
  'wikipedia.org',
  'wikimedia.org',
  'mozilla.org',
  'fsf.org',
  'eff.org',
  'w3.org',
  'ietf.org',
  'openstack.org',
  'owasp.org',
  'isoc.org',
  'freebsd.org',
  'debian.org',
  'ubuntu.com',
  'archlinux.org',
  'redhat.com',
  'centos.org',
  'gnome.org',
  'kde.org',
]);

// ============================================================================
// 5. RESTRICTED / SANCTIONED REGIONAL TLDS
// ============================================================================
export const BLOCKED_SANCTIONED_RESTRICTED_TLDS = new Set([
  '.ru',
  '.su',
  '.by',
  '.ua',
  '.ir',
  '.kp',
  '.kz',
  '.sy',
  '.cu',
]);

// ============================================================================
// 6. DISPOSABLE / TEMPORARY EMAIL SERVICES
// ============================================================================
export const BLOCKED_DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'temp-mail.org',
  'trashmail.com',
  'dispostable.com',
  'getnada.com',
  'throwawaymail.com',
  'yopmail.com',
  'sharklasers.com',
  'tempmail.com',
]);

/**
 * Clean and extract the root domain from email address or domain string.
 */
export function extractDomain(emailOrDomain: string): string {
  if (!emailOrDomain) return '';
  let clean = emailOrDomain.toLowerCase().trim();
  clean = clean.replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (clean.includes('@')) {
    clean = clean.split('@')[1];
  }
  return clean.trim();
}

/**
 * Checks a single domain string against all regional and category blocklists.
 */
export function isCorporateDomain(domain: string): { valid: boolean; reason?: string } {
  if (!domain) {
    return { valid: false, reason: 'Domain is required.' };
  }

  const cleanDomain = extractDomain(domain);

  // 1. Global Freemail Check
  if (BLOCKED_GLOBAL_FREEMAIL_DOMAINS.has(cleanDomain)) {
    return { 
      valid: false, 
      reason: `"${cleanDomain}" is a public webmail domain and cannot be used for corporate membership.` 
    };
  }

  // 2. Asia Regional Freemail Check
  if (BLOCKED_ASIA_FREEMAIL_DOMAINS.has(cleanDomain)) {
    return { 
      valid: false, 
      reason: `"${cleanDomain}" is a public Asian webmail domain and cannot be used for corporate membership.` 
    };
  }

  // 3. European Regional Freemail Check
  if (BLOCKED_EU_FREEMAIL_DOMAINS.has(cleanDomain)) {
    return { 
      valid: false, 
      reason: `"${cleanDomain}" is a public European webmail domain and cannot be used for corporate membership.` 
    };
  }

  // 4. Foundation / Kernel Check
  if (BLOCKED_FOUNDATION_DOMAINS.has(cleanDomain)) {
    return { 
      valid: false, 
      reason: `"${cleanDomain}" is a foundation or open-source organization domain.` 
    };
  }

  // 5. Disposable Check
  if (BLOCKED_DISPOSABLE_DOMAINS.has(cleanDomain)) {
    return { 
      valid: false, 
      reason: `"${cleanDomain}" is a temporary/disposable email domain.` 
    };
  }

  // 6. Sanctioned/Restricted Region TLD Check
  for (const tld of BLOCKED_SANCTIONED_RESTRICTED_TLDS) {
    if (cleanDomain.endsWith(tld)) {
      return { 
        valid: false, 
        reason: `Domains with restricted extension "${tld}" are not permitted.` 
      };
    }
  }

  return { valid: true };
}

// Zod Schema validating form data
export const JoinFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').trim(),
  contactName: z.string().min(1, 'Contact name is required').trim(),
  contactEmail: z.string().email('Invalid contact email format').toLowerCase().trim(),
  allowedDomains: z.string().min(1, 'Allowed corporate domains field is required').trim(),
  docusignEnabled: z.boolean().default(false),
  docusignSignatoryEmail: z.string().email('Invalid signatory email format').optional().or(z.literal('')),
})
.refine((data) => {
  // 1. Validate Contact Corporate Email
  const domain = extractDomain(data.contactEmail);
  return isCorporateDomain(domain).valid;
}, {
  message: 'Contact email must be a valid corporate domain (public webmail, regional webmail providers, foundations, and disposable services are not permitted).',
  path: ['contactEmail'],
})
.refine((data) => {
  // 2. Validate EVERY entry in Allowed Corporate Domains
  if (!data.allowedDomains || data.allowedDomains.trim() === '') return false;

  const domainsList = data.allowedDomains.split(',').map((d) => extractDomain(d)).filter(Boolean);

  if (domainsList.length === 0) return false;

  for (const dom of domainsList) {
    const check = isCorporateDomain(dom);
    if (!check.valid) {
      return false;
    }
  }

  return true;
}, {
  message: 'One or more domain names listed in Allowed Corporate Domains are public webmail, foundation, disposable, or restricted regional domains.',
  path: ['allowedDomains'],
})
.refine((data) => {
  // 3. Validate DocuSign Signatory Email if DocuSign is enabled
  if (data.docusignEnabled) {
    if (!data.docusignSignatoryEmail) return false;
    const domain = extractDomain(data.docusignSignatoryEmail);
    return isCorporateDomain(domain).valid;
  }
  return true;
}, {
  message: 'DocuSign Signatory Email is required and must be a valid corporate domain when DocuSign is enabled.',
  path: ['docusignSignatoryEmail'],
});

export type JoinFormData = z.infer<typeof JoinFormSchema>;

export interface FormSubmissionPayload {
  company_name: string;
  contact_name: string;
  contact_email: string;
  allowed_domains: string;
  docusign_enabled: 'Yes' | 'No';
  docusign_signatory_email: string | null;
}

export function formatJoinPayload(rawData: Record<string, any>): FormSubmissionPayload {
  const isDocuSign = rawData.docusignEnabled === 'true' || rawData.docusignEnabled === true || rawData.docusignEnabled === 'on';

  return {
    company_name: String(rawData.companyName || '').trim(),
    contact_name: String(rawData.contactName || '').trim(),
    contact_email: String(rawData.contactEmail || '').trim().toLowerCase(),
    allowed_domains: String(rawData.allowedDomains || '').trim(),
    docusign_enabled: isDocuSign ? 'Yes' : 'No',
    docusign_signatory_email: isDocuSign && rawData.docusignSignatoryEmail 
      ? String(rawData.docusignSignatoryEmail).trim().toLowerCase() 
      : null,
  };
}

