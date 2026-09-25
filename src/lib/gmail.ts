import { getCachedAccessToken } from './firebase';

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  senderName?: string;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

// Convert Unicode string to base64url encoded RFC 2822 MIME message
function makeBody(to: string, from: string, subject: string, message: string): string {
  const str = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    message,
  ].join('\r\n');

  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Fetch the authenticated user's Gmail profile
 */
export async function getGmailProfile(): Promise<GmailProfile | null> {
  const token = getCachedAccessToken();
  if (!token) return null;

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.warn('Failed to fetch Gmail profile:', res.statusText);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching Gmail profile:', error);
    return null;
  }
}

/**
 * Send an email via the Gmail REST API
 * Note: Must always be preceded by explicit user confirmation if user-initiated.
 */
export async function sendGmailMessage(payload: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const token = getCachedAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Google OAuth token is not active. Please sign in with Google to send Gmail messages.',
    };
  }

  try {
    const profile = await getGmailProfile();
    const fromEmail = profile?.emailAddress || 'me';

    const rawMessage = makeBody(
      payload.to,
      fromEmail,
      payload.subject,
      `<div style="font-family: Arial, sans-serif; color: #292524; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e7e5e4; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #6b1426; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">REBERWET JUNIOR SECONDARY SCHOOL</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #fecdd3;">Portal Communication Desk</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          ${payload.body.replace(/\n/g, '<br/>')}
        </div>
        <div style="background-color: #f5f5f4; padding: 14px 24px; font-size: 12px; color: #78716c; text-align: center; border-top: 1px solid #e7e5e4;">
          <p style="margin: 0;">Reberwet JSS • Kericho County, Siongiroi • P.O. Box 52-20423</p>
          <p style="margin: 4px 0 0 0;">Official notice generated from the CBC School Management Portal.</p>
        </div>
      </div>`
    );

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: rawMessage,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error?.message || `Gmail API error (${res.status})`,
      };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown network error sending email.' };
  }
}
