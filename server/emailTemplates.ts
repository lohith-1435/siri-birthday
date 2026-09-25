import { calculateDynamicAge } from '../src/utils/timeCalculations';

export interface CustomEmailTemplateConfig {
  subject: string;
  topLabel?: string;
  heading: string;
  message: string;
  buttonText: string;
  websiteUrl: string;
  deepLinkScene?: string;
  footer?: string;
  enabled: boolean;
}

export interface AllEmailTemplates {
  test: CustomEmailTemplateConfig;
  advance: CustomEmailTemplateConfig;
  birthday_midnight: CustomEmailTemplateConfig;
  birth_moment: CustomEmailTemplateConfig;
  tithi: CustomEmailTemplateConfig;
}

export const DEFAULT_EMAIL_TEMPLATES: AllEmailTemplates = {
  test: {
    subject: 'Email System Test — SIRI Birthday Experience ✨',
    topLabel: 'SYSTEM VERIFICATION DISPATCH',
    heading: 'EMAIL AUTOMATION LIVE TEST',
    message: `This test email verifies that your email delivery, dynamic variable interpolation, and luxury email rendering engine are fully operational.\n\nThis test dispatch does not affect the automated yearly calendar, Tithi triggers, or live delivery audit records.`,
    buttonText: 'OPEN BIRTHDAY EXPERIENCE →',
    websiteUrl: 'https://siri-birthday-brown.vercel.app/',
    deepLinkScene: '',
    footer: `SIRI — A JOURNEY WRITTEN IN THE STARS\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
  advance: {
    subject: 'A Little Early… But With Love, SIRI ✨',
    topLabel: 'A LETTER BEFORE YOUR DAY',
    heading: 'ADVANCE HAPPY BIRTHDAY',
    message: `Some days arrive on a calendar.\nSome days carry a meaning of their own.\n\nYours is one of those days.\n\nBefore the day arrives, we simply wanted to leave you a little message…\n\nAdvance Happy Birthday, {{name}}. ❤️\n\nMay the year ahead bring you moments that make you smile,\npeople who value you,\nand memories that stay close to your heart.\n\nYour story has already come a long way.\n\nAnd there is still so much more to be written.`,
    buttonText: 'STEP INTO YOUR STORY →',
    websiteUrl: 'https://siri-birthday-brown.vercel.app/',
    deepLinkScene: 'birthday',
    footer: `SIRI — A JOURNEY WRITTEN IN THE STARS\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
  birthday_midnight: {
    subject: 'The Day Has Arrived, SIRI ✨',
    topLabel: 'MIDNIGHT COSMIC MILESTONE',
    heading: 'THE DAY HAS ARRIVED',
    message: `Today isn't just another date.\n\nIt's the day your story began.\n\nHappy Birthday, {{name}}. ❤️\n\nMay this new chapter bring beautiful moments,\nmeaningful journeys,\nand memories worth keeping forever.`,
    buttonText: 'ENTER YOUR STORY →',
    websiteUrl: 'https://siri-birthday-brown.vercel.app/',
    deepLinkScene: 'birthday',
    footer: `SIRI — A JOURNEY WRITTEN IN THE STARS\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
  birth_moment: {
    subject: 'At 8:00 AM — The Moment It All Began ✨',
    topLabel: '28 SEPTEMBER · 08:00 AM IST',
    heading: 'THE MOMENT IT ALL BEGAN',
    message: `At this exact moment, years ago,\na beautiful journey began.\n\nToday, we pause for a moment to remember where it all started.\n\nYou. Your journey. Your story.\n\nFrom that first moment to everything you have become today,\nevery chapter has its own meaning.\n\nHappy Birthday, {{name}}. ❤️`,
    buttonText: 'REVISIT YOUR BEGINNING →',
    websiteUrl: 'https://siri-birthday-brown.vercel.app/',
    deepLinkScene: 'birth-moment',
    footer: `SIRI — A JOURNEY WRITTEN IN THE STARS\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
  tithi: {
    subject: 'A Divine Birthday Blessing ✨',
    topLabel: 'SACRED LUNAR RETURN · {{current_year}}',
    heading: 'A DIVINE BIRTHDAY BLESSING',
    message: `Dear {{name}},\n\nYour solar birth date is remembered every year on 28 September.\n\nAccording to the sacred Hindu lunar tradition, your corresponding birth Tithi returns today on {{tithi_date}} {{current_year}} under the divine auspiciousness of Sharan Navaratri.\n\nMay the divine blessings of Goddess Durga bring eternal peace, good health, flourishing prosperity, and radiant joy to you throughout this year.`,
    buttonText: "DISCOVER TODAY'S TITHI →",
    websiteUrl: 'https://siri-birthday-brown.vercel.app/',
    deepLinkScene: 'tithi',
    footer: `SIRI — SHARAN NAVARATRI LUNAR ANNIVERSARY\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
};

/**
 * Evaluates template variables: {{name}}, {{age}}, {{birth_date}}, {{birth_time}}, {{current_year}}, {{tithi_date}}, {{tithi_name}}, {{website_url}}, {{recipient}}, {{sent_at}}
 */
export function replaceEmailVariables(
  text: string,
  data: {
    name?: string;
    age?: number;
    birthDate?: string;
    birthTime?: string;
    currentYear?: number;
    tithiDate?: string;
    tithiName?: string;
    websiteUrl?: string;
    recipient?: string;
    sentAt?: string;
  }
): string {
  if (!text) return '';
  const name = data.name || 'SIRI';
  const currentYear = data.currentYear || new Date().getFullYear();
  const age = data.age || calculateDynamicAge(new Date(`${currentYear}-09-28T08:00:00+05:30`));
  const birthDate = data.birthDate || '28 September 2003';
  const birthTime = data.birthTime || '08:00 AM IST';
  const tithiDate = data.tithiDate || '14 October';
  const tithiName = data.tithiName || 'Ashwayuja Shukla Tritiya';
  const websiteUrl = data.websiteUrl || 'https://siri-birthday-brown.vercel.app/';
  const recipient = data.recipient || 'siri@example.com';
  const sentAt = data.sentAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

  return text
    .replace(/\{\{name\}\}/gi, name)
    .replace(/\{\{age\}\}/gi, String(age))
    .replace(/\{\{birth_date\}\}/gi, birthDate)
    .replace(/\{\{birth_time\}\}/gi, birthTime)
    .replace(/\{\{current_year\}\}/gi, String(currentYear))
    .replace(/\{\{tithi_date\}\}/gi, tithiDate)
    .replace(/\{\{tithi_name\}\}/gi, tithiName)
    .replace(/\{\{website_url\}\}/gi, websiteUrl)
    .replace(/\{\{recipient\}\}/gi, recipient)
    .replace(/\{\{sent_at\}\}/gi, sentAt);
}

export function buildDestinationUrl(baseUrl: string, sceneParam?: string): string {
  let url = (baseUrl || 'https://siri-birthday-brown.vercel.app/').trim();
  if (!sceneParam) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}scene=${encodeURIComponent(sceneParam)}`;
}

/**
 * Applies golden highlights to key words, dates, and names in body text
 */
function highlightLuxuryPhrases(text: string, recipientName: string = 'SIRI'): string {
  let formatted = text;

  // Highlight recipient name if not already wrapped in span
  const safeName = recipientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (safeName && safeName.length > 1) {
    const nameRegex = new RegExp(`(?<!<[^>]*)\\b(${safeName})\\b(?![^<]*>)`, 'gi');
    formatted = formatted.replace(
      nameRegex,
      `<span style="color: #F3E5AB; font-weight: 700; text-shadow: 0 0 10px rgba(243,229,171,0.35);">$1</span>`
    );
  }

  // Highlight standard key milestone terms
  const terms = [
    '28 September 2003',
    '28 September 2026',
    '28 September',
    '14 October 2026',
    '14 October',
    'Sharan Navaratri',
    'Ashwayuja Shukla Tritiya',
    'Goddess Durga',
    'Advance Happy Birthday',
    'Happy Birthday',
  ];

  terms.forEach((term) => {
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!<[^>]*)\\b(${safeTerm})\\b(?![^<]*>)`, 'gi');
    formatted = formatted.replace(
      regex,
      `<span style="color: #E6C687; font-weight: 700;">$1</span>`
    );
  });

  return formatted;
}

/**
 * Formats a golden signature name with refined letter spacing and glow
 */
function formatGoldenSignatureName(name: string): string {
  const upper = (name || 'SIRI').trim().toUpperCase();
  return `<span style="display: inline-block; color: #F3E5AB; font-size: 24px; font-weight: 800; letter-spacing: 5px; text-transform: uppercase; font-family: 'Cinzel', 'Playfair Display', Georgia, serif; text-shadow: 0 0 16px rgba(243, 229, 171, 0.45); line-height: 1.3; word-break: normal; white-space: normal;">${upper}</span>`;
}

// =========================================================================
// 1. ADVANCE BIRTHDAY EMAIL (Letter Before Your Day)
// =========================================================================
export function generateAdvanceEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; recipient?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.advance, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene || 'birthday');

  const subject = replaceEmailVariables(config.subject, { name, currentYear: year, websiteUrl });
  const topLabel = replaceEmailVariables(config.topLabel || 'A LETTER BEFORE YOUR DAY', { name, currentYear: year });
  const heading = replaceEmailVariables(config.heading || 'ADVANCE HAPPY BIRTHDAY', { name, currentYear: year });
  const rawMessage = replaceEmailVariables(config.message, { name, currentYear: year, websiteUrl });
  const buttonText = replaceEmailVariables(config.buttonText, { name, currentYear: year });
  const footerText = replaceEmailVariables(config.footer || '', { name, currentYear: year });

  const paragraphs = rawMessage
    .split('\n\n')
    .map((p) => {
      const highlighted = highlightLuxuryPhrases(p.replace(/\n/g, '<br>'), name);
      return `<p style="margin: 0 0 16px 0; color: #E8E2D8; font-size: 15px; line-height: 1.85; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${highlighted}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 12px !important; }
      .email-content { padding: 24px 20px !important; }
      .email-heading { font-size: 22px !important; }
      .signature-name { font-size: 20px !important; letter-spacing: 5px !important; }
      .panel-card { padding: 16px 16px !important; }
      .panel-date { font-size: 18px !important; }
      .cta-button { padding: 14px 28px !important; font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #060408; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060408; background-image: radial-gradient(circle at 50% 15%, #180a18 0%, #060408 70%); padding: 35px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Frame -->
        <table role="presentation" class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(175deg, #170b19 0%, #0d0610 45%, #060408 100%); border: 1px solid #C5A059; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(197,160,89,0.12);">
          
          <!-- Top Emblem & Header -->
          <tr>
            <td align="center" style="padding: 42px 30px 24px 30px; border-bottom: 1px solid rgba(197,160,89,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #F3E5AB; font-size: 22px; font-weight: bold; margin-bottom: 18px; background: radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.05) 100%); box-shadow: 0 0 22px rgba(212,175,55,0.35);">
                ✧
              </div>
              <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 4.5px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                ${topLabel}
              </p>
              <h1 class="email-heading" style="margin: 0 0 14px 0; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #FAF8F5; text-transform: uppercase; font-family: 'Cinzel', Georgia, serif; line-height: 1.3;">
                ${heading}
              </h1>
              <div class="signature-name" style="margin-top: 6px;">
                ${formatGoldenSignatureName(name)}
              </div>
            </td>
          </tr>

          <!-- Highlighted Date Panel -->
          <tr>
            <td align="center" style="padding: 28px 32px 12px 32px;">
              <table role="presentation" class="panel-card" border="0" cellspacing="0" cellpadding="0" style="width: 100%; background: linear-gradient(135deg, rgba(197,160,89,0.12) 0%, rgba(30,12,30,0.4) 100%); border: 1px solid #C5A059; border-radius: 16px; padding: 20px 24px; text-align: center; box-shadow: inset 0 0 25px rgba(197,160,89,0.06);">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 6px 0; font-size: 10.5px; letter-spacing: 3px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                      YOUR SPECIAL DAY IS NEAR
                    </p>
                    <p class="panel-date" style="margin: 0; font-size: 22px; color: #FFF8E7; font-weight: 800; letter-spacing: 2px; font-family: 'Cinzel', Georgia, serif; text-shadow: 0 0 12px rgba(255,248,231,0.3);">
                      28 SEPTEMBER ${year}
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #E6C687; font-style: italic; letter-spacing: 1.5px; font-family: 'Playfair Display', Georgia, serif;">
                      The next chapter awaits
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td class="email-content" style="padding: 24px 44px 20px 44px; text-align: center;">
              ${paragraphs}
            </td>
          </tr>

          <!-- CTA Button Section -->
          <tr>
            <td align="center" style="padding: 14px 40px 10px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #F5E6B3 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" class="cta-button" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px; font-family: 'Cinzel', Georgia, serif;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Visible Configured Destination URL -->
              <div style="margin-top: 14px; text-align: center;">
                <a href="${destinationUrl}" target="_blank" style="color: #C5A059; font-size: 11.5px; font-family: 'Montserrat', monospace, sans-serif; text-decoration: underline; letter-spacing: 0.5px; word-break: break-all;">
                  🔗 ${destinationUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- Lower Celestial Visual Accent -->
          <tr>
            <td align="center" style="padding: 22px 0 12px 0; color: #8F7745; font-size: 11px; letter-spacing: 8px;">
              ✦ &nbsp; · &nbsp; ✧ &nbsp; · &nbsp; ✦
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #060408; border-top: 1px solid rgba(197,160,89,0.22);">
              <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 2.5px; color: #C5A059; font-weight: 700; font-family: 'Cinzel', Georgia, serif; text-transform: uppercase;">
                SIRI — A JOURNEY WRITTEN IN THE STARS
              </p>
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6; font-family: 'Montserrat', sans-serif;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// =========================================================================
// 2. REAL BIRTHDAY MIDNIGHT EMAIL (12:00 AM IST, 28 September)
// =========================================================================
export function generateBirthdayMidnightEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; recipient?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.birthday_midnight, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const age = calculateDynamicAge(new Date(`${year}-09-28T08:00:00+05:30`));
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene || 'birthday');

  const subject = replaceEmailVariables(config.subject, { name, age, currentYear: year, websiteUrl });
  const topLabel = replaceEmailVariables(config.topLabel || 'MIDNIGHT COSMIC MILESTONE', { name, age, currentYear: year });
  const heading = replaceEmailVariables(config.heading || 'THE DAY HAS ARRIVED', { name, age, currentYear: year });
  const rawMessage = replaceEmailVariables(config.message, { name, age, currentYear: year, websiteUrl });
  const buttonText = replaceEmailVariables(config.buttonText, { name, age, currentYear: year });
  const footerText = replaceEmailVariables(config.footer || '', { name, age, currentYear: year });

  const paragraphs = rawMessage
    .split('\n\n')
    .map((p) => {
      const highlighted = highlightLuxuryPhrases(p.replace(/\n/g, '<br>'), name);
      return `<p style="margin: 0 0 16px 0; color: #E8E2D8; font-size: 15px; line-height: 1.85; font-family: 'Montserrat', sans-serif;">${highlighted}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 12px !important; }
      .email-content { padding: 24px 20px !important; }
      .email-heading { font-size: 22px !important; }
      .signature-name { font-size: 20px !important; letter-spacing: 5px !important; }
      .panel-card { padding: 16px 16px !important; }
      .panel-date { font-size: 18px !important; }
      .cta-button { padding: 14px 28px !important; font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #060408; font-family: 'Montserrat', sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060408; background-image: radial-gradient(circle at 50% 15%, #190919 0%, #060408 70%); padding: 35px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Frame -->
        <table role="presentation" class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(175deg, #180c1b 0%, #0d0610 45%, #060408 100%); border: 1px solid #C5A059; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(197,160,89,0.12);">
          
          <!-- Top Header -->
          <tr>
            <td align="center" style="padding: 42px 30px 24px 30px; border-bottom: 1px solid rgba(197,160,89,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #F3E5AB; font-size: 22px; font-weight: bold; margin-bottom: 18px; background: radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.05) 100%); box-shadow: 0 0 22px rgba(212,175,55,0.35);">
                ✦
              </div>
              <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 4.5px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                ${topLabel} · 28 SEPTEMBER
              </p>
              <h1 class="email-heading" style="margin: 0 0 14px 0; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #FAF8F5; text-transform: uppercase; font-family: 'Cinzel', Georgia, serif; line-height: 1.3;">
                ${heading}
              </h1>
              <div class="signature-name" style="margin-top: 6px;">
                ${formatGoldenSignatureName(name)}
              </div>
            </td>
          </tr>

          <!-- Dynamic Age Milestone Panel -->
          <tr>
            <td align="center" style="padding: 28px 32px 12px 32px;">
              <table role="presentation" class="panel-card" border="0" cellspacing="0" cellpadding="0" style="width: 100%; background: linear-gradient(135deg, rgba(197,160,89,0.14) 0%, rgba(30,12,30,0.4) 100%); border: 1px solid #C5A059; border-radius: 16px; padding: 20px 24px; text-align: center; box-shadow: inset 0 0 25px rgba(197,160,89,0.08);">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 6px 0; font-size: 10.5px; letter-spacing: 3px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                      COSMIC SOLAR ANNIVERSARY
                    </p>
                    <p class="panel-date" style="margin: 0; font-size: 22px; color: #FFF8E7; font-weight: 800; letter-spacing: 3px; font-family: 'Cinzel', Georgia, serif; text-shadow: 0 0 12px rgba(255,248,231,0.3);">
                      WELCOME TO ${age}
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #E6C687; font-style: italic; letter-spacing: 1.5px; font-family: 'Playfair Display', Georgia, serif;">
                      28 September ${year} · 12:00 AM IST
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td class="email-content" style="padding: 24px 44px 20px 44px; text-align: center;">
              ${paragraphs}
            </td>
          </tr>

          <!-- CTA Button Section -->
          <tr>
            <td align="center" style="padding: 14px 40px 10px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #F5E6B3 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" class="cta-button" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px; font-family: 'Cinzel', Georgia, serif;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Visible Configured Destination URL -->
              <div style="margin-top: 14px; text-align: center;">
                <a href="${destinationUrl}" target="_blank" style="color: #C5A059; font-size: 11.5px; font-family: 'Montserrat', monospace, sans-serif; text-decoration: underline; letter-spacing: 0.5px; word-break: break-all;">
                  🔗 ${destinationUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- Lower Celestial Visual Accent -->
          <tr>
            <td align="center" style="padding: 22px 0 12px 0; color: #8F7745; font-size: 11px; letter-spacing: 8px;">
              ✦ &nbsp; · &nbsp; ✧ &nbsp; · &nbsp; ✦
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #060408; border-top: 1px solid rgba(197,160,89,0.22);">
              <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 2.5px; color: #C5A059; font-weight: 700; font-family: 'Cinzel', Georgia, serif; text-transform: uppercase;">
                SIRI — A JOURNEY WRITTEN IN THE STARS
              </p>
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6; font-family: 'Montserrat', sans-serif;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// =========================================================================
// 3. REAL BIRTH MOMENT EMAIL (08:00 AM IST, 28 September)
// =========================================================================
export function generateBirthMomentEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; recipient?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.birth_moment, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const age = calculateDynamicAge(new Date(`${year}-09-28T08:00:00+05:30`));
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene || 'birth-moment');

  const subject = replaceEmailVariables(config.subject, { name, age, currentYear: year, websiteUrl });
  const topLabel = replaceEmailVariables(config.topLabel || '28 SEPTEMBER · 08:00 AM IST', { name, age, currentYear: year });
  const heading = replaceEmailVariables(config.heading || 'THE MOMENT IT ALL BEGAN', { name, age, currentYear: year });
  const rawMessage = replaceEmailVariables(config.message, { name, age, currentYear: year, websiteUrl });
  const buttonText = replaceEmailVariables(config.buttonText, { name, age, currentYear: year });
  const footerText = replaceEmailVariables(config.footer || '', { name, age, currentYear: year });

  const paragraphs = rawMessage
    .split('\n\n')
    .map((p) => {
      const highlighted = highlightLuxuryPhrases(p.replace(/\n/g, '<br>'), name);
      return `<p style="margin: 0 0 16px 0; color: #E8E2D8; font-size: 15px; line-height: 1.85; font-family: 'Montserrat', sans-serif;">${highlighted}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 12px !important; }
      .email-content { padding: 24px 20px !important; }
      .email-heading { font-size: 22px !important; }
      .signature-name { font-size: 20px !important; letter-spacing: 5px !important; }
      .panel-card { padding: 16px 16px !important; }
      .panel-date { font-size: 17px !important; }
      .cta-button { padding: 14px 28px !important; font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #060408; font-family: 'Montserrat', sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060408; background-image: radial-gradient(circle at 50% 15%, #1c0e18 0%, #060408 70%); padding: 35px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Frame -->
        <table role="presentation" class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(175deg, #1a0d1d 0%, #0d0610 45%, #060408 100%); border: 1px solid #C5A059; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(197,160,89,0.12);">
          
          <!-- Top Header -->
          <tr>
            <td align="center" style="padding: 42px 30px 24px 30px; border-bottom: 1px solid rgba(197,160,89,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #F3E5AB; font-size: 22px; font-weight: bold; margin-bottom: 18px; background: radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.05) 100%); box-shadow: 0 0 22px rgba(212,175,55,0.35);">
                ☀️
              </div>
              <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 4.5px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                ${topLabel}
              </p>
              <h1 class="email-heading" style="margin: 0 0 14px 0; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #FAF8F5; text-transform: uppercase; font-family: 'Cinzel', Georgia, serif; line-height: 1.3;">
                ${heading}
              </h1>
              <div class="signature-name" style="margin-top: 6px;">
                ${formatGoldenSignatureName(name)}
              </div>
            </td>
          </tr>

          <!-- Genesis Moment Plaque -->
          <tr>
            <td align="center" style="padding: 28px 32px 12px 32px;">
              <table role="presentation" class="panel-card" border="0" cellspacing="0" cellpadding="0" style="width: 100%; background: linear-gradient(135deg, rgba(197,160,89,0.14) 0%, rgba(30,12,30,0.4) 100%); border: 1px solid #C5A059; border-radius: 16px; padding: 20px 24px; text-align: center; box-shadow: inset 0 0 25px rgba(197,160,89,0.08);">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 6px 0; font-size: 10.5px; letter-spacing: 3px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                      THE GENESIS MOMENT
                    </p>
                    <p class="panel-date" style="margin: 0; font-size: 21px; color: #FFF8E7; font-weight: 800; letter-spacing: 2px; font-family: 'Cinzel', Georgia, serif; text-shadow: 0 0 12px rgba(255,248,231,0.3);">
                      28 SEPTEMBER 2003 · 08:00 AM
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #E6C687; font-style: italic; letter-spacing: 1px; font-family: 'Playfair Display', Georgia, serif;">
                      Kakinada, Andhra Pradesh · Tula Rashi · Swati (1st Pada)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td class="email-content" style="padding: 24px 44px 20px 44px; text-align: center;">
              ${paragraphs}
            </td>
          </tr>

          <!-- CTA Button Section -->
          <tr>
            <td align="center" style="padding: 14px 40px 10px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #F5E6B3 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" class="cta-button" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px; font-family: 'Cinzel', Georgia, serif;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Visible Configured Destination URL -->
              <div style="margin-top: 14px; text-align: center;">
                <a href="${destinationUrl}" target="_blank" style="color: #C5A059; font-size: 11.5px; font-family: 'Montserrat', monospace, sans-serif; text-decoration: underline; letter-spacing: 0.5px; word-break: break-all;">
                  🔗 ${destinationUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- Lower Celestial Visual Accent -->
          <tr>
            <td align="center" style="padding: 22px 0 12px 0; color: #8F7745; font-size: 11px; letter-spacing: 8px;">
              ✦ &nbsp; · &nbsp; ✧ &nbsp; · &nbsp; ✦
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #060408; border-top: 1px solid rgba(197,160,89,0.22);">
              <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 2.5px; color: #C5A059; font-weight: 700; font-family: 'Cinzel', Georgia, serif; text-transform: uppercase;">
                SIRI — A JOURNEY WRITTEN IN THE STARS
              </p>
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6; font-family: 'Montserrat', sans-serif;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// =========================================================================
// 4. REAL LUNAR TITHI EMAIL (08:00 AM IST on published Tithi date)
// =========================================================================
export function generateTithiEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; tithiDate?: string; recipient?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.tithi, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI NANNAA';
  const tithiDate = contextData.tithiDate || '14 October';
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene || 'tithi');

  const subject = replaceEmailVariables(config.subject, { name, currentYear: year, tithiDate, websiteUrl });
  const topLabel = replaceEmailVariables(config.topLabel || `SACRED LUNAR RETURN · ${year}`, { name, currentYear: year, tithiDate });
  const heading = replaceEmailVariables(config.heading || 'A DIVINE BIRTHDAY BLESSING', { name, currentYear: year, tithiDate });
  const rawMessage = replaceEmailVariables(config.message, { name, currentYear: year, tithiDate, websiteUrl });
  const buttonText = replaceEmailVariables(config.buttonText, { name, currentYear: year, tithiDate });
  const footerText = replaceEmailVariables(config.footer || '', { name, currentYear: year, tithiDate });

  const paragraphs = rawMessage
    .split('\n\n')
    .map((p) => {
      const highlighted = highlightLuxuryPhrases(p.replace(/\n/g, '<br>'), name);
      return `<p style="margin: 0 0 16px 0; color: #E8E2D8; font-size: 15px; line-height: 1.85; font-family: 'Montserrat', sans-serif;">${highlighted}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 12px !important; }
      .email-content { padding: 24px 20px !important; }
      .email-heading { font-size: 22px !important; }
      .signature-name { font-size: 20px !important; letter-spacing: 5px !important; }
      .panel-card { padding: 16px 16px !important; }
      .panel-date { font-size: 20px !important; }
      .cta-button { padding: 14px 28px !important; font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #060408; font-family: 'Montserrat', sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060408; background-image: radial-gradient(circle at 50% 15%, #220716 0%, #060408 70%); padding: 35px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Frame -->
        <table role="presentation" class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(175deg, #1e0915 0%, #0e050c 45%, #060408 100%); border: 1px solid #C5A059; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(197,160,89,0.12);">
          
          <!-- Sacred Om Emblem & Header -->
          <tr>
            <td align="center" style="padding: 42px 30px 24px 30px; border-bottom: 1px solid rgba(197,160,89,0.25);">
              <div style="width: 58px; height: 58px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 58px; text-align: center; color: #F3E5AB; font-size: 25px; font-weight: bold; margin-bottom: 18px; background: radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.06) 100%); box-shadow: 0 0 25px rgba(212,175,55,0.4);">
                ॐ
              </div>
              <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 4.5px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                ${topLabel}
              </p>
              <h1 class="email-heading" style="margin: 0 0 14px 0; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #FAF8F5; text-transform: uppercase; font-family: 'Cinzel', Georgia, serif; line-height: 1.3;">
                ${heading}
              </h1>
              <div class="signature-name" style="margin-top: 6px;">
                ${formatGoldenSignatureName(name)}
              </div>
            </td>
          </tr>

          <!-- Sacred Tithi Panel (Exact Reference Design Matching) -->
          <tr>
            <td align="center" style="padding: 28px 32px 12px 32px;">
              <table role="presentation" class="panel-card" border="0" cellspacing="0" cellpadding="0" style="width: 100%; background: linear-gradient(135deg, rgba(197,160,89,0.15) 0%, rgba(40,10,25,0.4) 100%); border: 1px solid #C5A059; border-radius: 16px; padding: 22px 24px; text-align: center; box-shadow: inset 0 0 25px rgba(197,160,89,0.08);">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 3.5px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                      THIS YEAR'S LUNAR TITHI
                    </p>
                    <p class="panel-date" style="margin: 0; font-size: 24px; color: #FFF8E7; font-weight: 800; letter-spacing: 2px; font-family: 'Cinzel', Georgia, serif; text-shadow: 0 0 14px rgba(255,248,231,0.35);">
                      ${tithiDate.toUpperCase()} ${year}
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 13.5px; color: #F3E5AB; font-style: italic; letter-spacing: 1.5px; font-family: 'Playfair Display', Georgia, serif;">
                      Ashwayuja Shukla Tritiya (आश्वयुज शुक्ल तृतीया)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td class="email-content" style="padding: 24px 44px 20px 44px; text-align: center;">
              ${paragraphs}
            </td>
          </tr>

          <!-- Lower Sacred Banner -->
          <tr>
            <td align="center" style="padding: 10px 32px 20px 32px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%; background-color: rgba(212,175,55,0.08); border-top: 1px solid rgba(212,175,55,0.3); border-bottom: 1px solid rgba(212,175,55,0.3); padding: 12px 20px;">
                <tr>
                  <td align="center" style="color: #D4AF37; font-size: 10.5px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; font-family: 'Cinzel', Georgia, serif;">
                    BORN UNDER THE DIVINE BLESSINGS OF SHARAN NAVARATRI
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button Section -->
          <tr>
            <td align="center" style="padding: 6px 40px 10px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #F5E6B3 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" class="cta-button" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px; font-family: 'Cinzel', Georgia, serif;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Visible Configured Destination URL -->
              <div style="margin-top: 14px; text-align: center;">
                <a href="${destinationUrl}" target="_blank" style="color: #C5A059; font-size: 11.5px; font-family: 'Montserrat', monospace, sans-serif; text-decoration: underline; letter-spacing: 0.5px; word-break: break-all;">
                  🔗 ${destinationUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- Lower Celestial Visual Accent -->
          <tr>
            <td align="center" style="padding: 22px 0 12px 0; color: #8F7745; font-size: 11px; letter-spacing: 8px;">
              ✦ &nbsp; · &nbsp; ✧ &nbsp; · &nbsp; ✦
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #060408; border-top: 1px solid rgba(197,160,89,0.22);">
              <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 2.5px; color: #C5A059; font-weight: 700; font-family: 'Cinzel', Georgia, serif; text-transform: uppercase;">
                SIRI · SHARAN NAVARATRI LUNAR ANNIVERSARY
              </p>
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6; font-family: 'Montserrat', sans-serif;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// =========================================================================
// 5. TEST VERIFICATION EMAIL (System Verification Dispatch)
// =========================================================================
export function generateTestEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; recipient?: string; tithiDate?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.test, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const recipient = contextData.recipient || 'siri@example.com';
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene);
  const sentAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

  const subject = replaceEmailVariables(config.subject, { name, currentYear: year, recipient, sentAt, websiteUrl });
  const topLabel = replaceEmailVariables(config.topLabel || 'SYSTEM VERIFICATION DISPATCH', { name, currentYear: year });
  const heading = replaceEmailVariables(config.heading || 'EMAIL AUTOMATION LIVE TEST', { name, currentYear: year });
  const rawMessage = replaceEmailVariables(config.message, { name, currentYear: year, recipient, sentAt, websiteUrl });
  const buttonText = replaceEmailVariables(config.buttonText, { name, currentYear: year });
  const footerText = replaceEmailVariables(config.footer || '', { name, currentYear: year });

  const paragraphs = rawMessage
    .split('\n\n')
    .map((p) => {
      const highlighted = highlightLuxuryPhrases(p.replace(/\n/g, '<br>'), name);
      return `<p style="margin: 0 0 16px 0; color: #E8E2D8; font-size: 15px; line-height: 1.85; font-family: 'Montserrat', sans-serif;">${highlighted}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 12px !important; }
      .email-content { padding: 24px 20px !important; }
      .email-heading { font-size: 22px !important; }
      .signature-name { font-size: 20px !important; letter-spacing: 5px !important; }
      .panel-card { padding: 16px 16px !important; }
      .cta-button { padding: 14px 28px !important; font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #060408; font-family: 'Montserrat', sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060408; background-image: radial-gradient(circle at 50% 15%, #180c1b 0%, #060408 70%); padding: 35px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Frame -->
        <table role="presentation" class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(175deg, #170b1a 0%, #0d0610 45%, #060408 100%); border: 1px solid #C5A059; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(197,160,89,0.12);">
          
          <!-- Top Header -->
          <tr>
            <td align="center" style="padding: 42px 30px 24px 30px; border-bottom: 1px solid rgba(197,160,89,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #F3E5AB; font-size: 22px; font-weight: bold; margin-bottom: 18px; background: radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.05) 100%); box-shadow: 0 0 22px rgba(212,175,55,0.35);">
                🧪
              </div>
              <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 4.5px; color: #D4AF37; text-transform: uppercase; font-weight: 700; font-family: 'Cinzel', Georgia, serif;">
                ${topLabel}
              </p>
              <h1 class="email-heading" style="margin: 0 0 14px 0; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #FAF8F5; text-transform: uppercase; font-family: 'Cinzel', Georgia, serif; line-height: 1.3;">
                ${heading}
              </h1>
              <div class="signature-name" style="margin-top: 6px;">
                ${formatGoldenSignatureName(name)}
              </div>
            </td>
          </tr>

          <!-- System Status Details Table -->
          <tr>
            <td align="center" style="padding: 28px 32px 12px 32px;">
              <table role="presentation" class="panel-card" border="0" cellspacing="0" cellpadding="0" style="width: 100%; background: linear-gradient(135deg, rgba(197,160,89,0.12) 0%, rgba(30,12,30,0.4) 100%); border: 1px solid #C5A059; border-radius: 16px; padding: 18px 24px; text-align: left; box-shadow: inset 0 0 25px rgba(197,160,89,0.06);">
                <tr>
                  <td style="color: #D4AF37; font-size: 11.5px; font-weight: 700; padding: 5px 0; font-family: 'Cinzel', serif;">STATUS:</td>
                  <td style="color: #6EE7B7; font-size: 11.5px; font-weight: 800; padding: 5px 0; text-align: right; font-family: 'Montserrat', sans-serif;">ALL SYSTEMS OPERATIONAL ✓</td>
                </tr>
                <tr>
                  <td style="color: #D4AF37; font-size: 11.5px; font-weight: 700; padding: 5px 0; font-family: 'Cinzel', serif;">RECIPIENT:</td>
                  <td style="color: #FAF8F5; font-size: 11.5px; padding: 5px 0; text-align: right; font-family: 'Montserrat', monospace, sans-serif;">${recipient}</td>
                </tr>
                <tr>
                  <td style="color: #D4AF37; font-size: 11.5px; font-weight: 700; padding: 5px 0; font-family: 'Cinzel', serif;">TIMESTAMP (IST):</td>
                  <td style="color: #FAF8F5; font-size: 11.5px; padding: 5px 0; text-align: right; font-family: 'Montserrat', sans-serif;">${sentAt}</td>
                </tr>
                <tr>
                  <td style="color: #D4AF37; font-size: 11.5px; font-weight: 700; padding: 5px 0; font-family: 'Cinzel', serif;">TEMPLATE ENGINE:</td>
                  <td style="color: #F3E5AB; font-size: 11.5px; font-weight: 600; padding: 5px 0; text-align: right; font-family: 'Montserrat', sans-serif;">Luxury Celestial Edition v2.5</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td class="email-content" style="padding: 24px 44px 20px 44px; text-align: center;">
              ${paragraphs}
            </td>
          </tr>

          <!-- CTA Button Section -->
          <tr>
            <td align="center" style="padding: 14px 40px 10px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #F5E6B3 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" class="cta-button" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px; font-family: 'Cinzel', Georgia, serif;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Visible Configured Destination URL -->
              <div style="margin-top: 14px; text-align: center;">
                <a href="${destinationUrl}" target="_blank" style="color: #C5A059; font-size: 11.5px; font-family: 'Montserrat', monospace, sans-serif; text-decoration: underline; letter-spacing: 0.5px; word-break: break-all;">
                  🔗 ${destinationUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- Lower Celestial Visual Accent -->
          <tr>
            <td align="center" style="padding: 22px 0 12px 0; color: #8F7745; font-size: 11px; letter-spacing: 8px;">
              ✦ &nbsp; · &nbsp; ✧ &nbsp; · &nbsp; ✦
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #060408; border-top: 1px solid rgba(197,160,89,0.22);">
              <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 2.5px; color: #C5A059; font-weight: 700; font-family: 'Cinzel', Georgia, serif; text-transform: uppercase;">
                SIRI — A JOURNEY WRITTEN IN THE STARS
              </p>
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6; font-family: 'Montserrat', sans-serif;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
