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
    topLabel: 'TEST EMAIL',
    heading: 'YOUR EMAIL EXPERIENCE IS WORKING',
    message: `This test email verifies that your email delivery and template rendering system is active and functioning properly.\n\nThis test email does not affect the real birthday schedule, Tithi schedule, or real event history.`,
    buttonText: 'OPEN BIRTHDAY EXPERIENCE →',
    websiteUrl: 'http://localhost:5173',
    deepLinkScene: '',
    footer: `SIRI — A JOURNEY WRITTEN IN THE STARS\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
  advance: {
    subject: 'A Little Early… But With Love, SIRI ✨',
    topLabel: 'A LETTER BEFORE YOUR DAY',
    heading: 'YOUR SPECIAL DAY IS NEAR',
    message: `Some days arrive on a calendar.\n\nSome days carry a meaning of their own.\n\nYours is one of those days.\n\nBefore the day arrives, we simply wanted to leave you a little message…\n\nAdvance Happy Birthday, SIRI. ❤️\n\nMay the year ahead bring you moments that make you smile,\npeople who value you,\nand memories that stay close to your heart.\n\nYour story has already come a long way.\n\nAnd there is still so much more to be written.`,
    buttonText: 'STEP INTO YOUR STORY →',
    websiteUrl: 'http://localhost:5173',
    deepLinkScene: 'birthday',
    footer: `SIRI — A JOURNEY WRITTEN IN THE STARS\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
  birthday_midnight: {
    subject: 'The Day Has Arrived, SIRI ✨',
    topLabel: 'MIDNIGHT COSMIC MILESTONE',
    heading: 'THE DAY HAS ARRIVED',
    message: `Today isn't just another date.\n\nIt's the day your story began.\n\nHappy Birthday, SIRI. ❤️\n\nMay this new chapter bring beautiful moments,\nmeaningful journeys,\nand memories worth keeping forever.`,
    buttonText: 'ENTER YOUR STORY →',
    websiteUrl: 'http://localhost:5173',
    deepLinkScene: 'birthday',
    footer: `SIRI — A JOURNEY WRITTEN IN THE STARS\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
  birth_moment: {
    subject: 'At 8:00 AM — The Moment It All Began ✨',
    topLabel: 'THE EXACT BIRTH MOMENT · 08:00 AM IST',
    heading: 'THE MOMENT IT ALL BEGAN',
    message: `At this exact moment, years ago,\na beautiful journey began.\n\nToday, we pause for a moment to remember where it all started.\n\nYou. Your journey. Your story.\n\nFrom that first moment to everything you have become today,\nevery chapter has its own meaning.\n\nHappy Birthday, SIRI. ❤️`,
    buttonText: 'REVISIT YOUR BEGINNING →',
    websiteUrl: 'http://localhost:5173',
    deepLinkScene: 'birth-moment',
    footer: `SIRI — A JOURNEY WRITTEN IN THE STARS\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
  tithi: {
    subject: 'A Divine Birthday Blessing ✨',
    topLabel: 'SACRED LUNAR RETURN',
    heading: 'TODAY, YOUR TITHI RETURNS',
    message: `Some moments are measured by dates.\n\nSome are remembered by something deeper.\n\nToday, your corresponding birth Tithi returns.\n\nAshwayuja Shukla Tritiya\n\nA day connected to the beginning of your journey.\n\nBorn under the divine blessings of Sharan Navaratri.\n\nMay this sacred day bring peace, happiness, strength and beautiful blessings into the year ahead.`,
    buttonText: 'DISCOVER YOUR TITHI →',
    websiteUrl: 'http://localhost:5173',
    deepLinkScene: 'tithi',
    footer: `SIRI — A JOURNEY WRITTEN IN THE STARS\nA small experience created with love, admiration and respect.`,
    enabled: true,
  },
};

/**
 * Evaluates template variables: {{name}}, {{age}}, {{birth_date}}, {{birth_time}}, {{current_year}}, {{tithi_date}}, {{tithi_name}}, {{website_url}}
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
  const websiteUrl = data.websiteUrl || 'http://localhost:5173';
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

function buildDestinationUrl(baseUrl: string, sceneParam?: string): string {
  let url = (baseUrl || 'http://localhost:5173').trim();
  if (!sceneParam) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}scene=${encodeURIComponent(sceneParam)}`;
}

// 1. TEST EMAIL HTML
export function generateTestEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; recipient?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.test, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const recipient = contextData.recipient || 'siri@example.com';
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene);
  const sentAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

  const heading = replaceEmailVariables(config.heading, { name, currentYear: year, recipient, sentAt, websiteUrl });
  const rawMessage = replaceEmailVariables(config.message, { name, currentYear: year, recipient, sentAt, websiteUrl });
  const messageHtml = rawMessage
    .split('\n\n')
    .map((p) => `<p style="margin: 0 0 16px 0; color: #E8E4DF; font-size: 15px; line-height: 1.8;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
  const buttonText = replaceEmailVariables(config.buttonText, { name, currentYear: year });
  const footerText = replaceEmailVariables(config.footer || '', { name, currentYear: year });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceEmailVariables(config.subject, { name, currentYear: year })}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030305; padding: 35px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(150deg, #121019 0%, #07060A 100%); border: 1px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.95);">
          
          <!-- Top Label & Icon -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 52px; height: 52px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 52px; text-align: center; color: #D4AF37; font-size: 20px; font-weight: bold; margin-bottom: 16px; background-color: rgba(212,175,55,0.1); box-shadow: 0 0 20px rgba(212,175,55,0.25);">
                🧪
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; font-weight: 700;">
                ${config.topLabel || 'TEST EMAIL'}
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Test Details Card -->
          <tr>
            <td align="center" style="padding: 24px 30px 10px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; padding: 16px 24px; width: 100%; text-align: left;">
                <tr>
                  <td style="color: #D4AF37; font-size: 12px; font-weight: 600; padding: 4px 0;">MODE:</td>
                  <td style="color: #FAF8F5; font-size: 12px; font-weight: 700; padding: 4px 0; text-align: right;">TEST</td>
                </tr>
                <tr>
                  <td style="color: #D4AF37; font-size: 12px; font-weight: 600; padding: 4px 0;">RECIPIENT:</td>
                  <td style="color: #FAF8F5; font-size: 12px; padding: 4px 0; text-align: right;">${recipient}</td>
                </tr>
                <tr>
                  <td style="color: #D4AF37; font-size: 12px; font-weight: 600; padding: 4px 0;">SENT AT:</td>
                  <td style="color: #FAF8F5; font-size: 12px; padding: 4px 0; text-align: right;">${sentAt}</td>
                </tr>
                <tr>
                  <td style="color: #D4AF37; font-size: 12px; font-weight: 600; padding: 4px 0;">EVENT:</td>
                  <td style="color: #FAF8F5; font-size: 12px; padding: 4px 0; text-align: right;">Test Email Verification</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 20px 40px 25px 40px; text-align: center;">
              ${messageHtml}
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding: 10px 40px 35px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #E5CD74 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" style="display: inline-block; padding: 15px 34px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 22px 30px; background-color: #050408; border-top: 1px solid rgba(212,175,55,0.2);">
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 2. ADVANCE BIRTHDAY EMAIL HTML
export function generateAdvanceEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; tithiDate?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.advance, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene);

  const heading = replaceEmailVariables(config.heading, { name, currentYear: year, websiteUrl });
  const rawMessage = replaceEmailVariables(config.message, { name, currentYear: year, websiteUrl });
  const messageHtml = rawMessage
    .split('\n\n')
    .map((p) => `<p style="margin: 0 0 16px 0; color: #E8E4DF; font-size: 15px; line-height: 1.8;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
  const buttonText = replaceEmailVariables(config.buttonText, { name, currentYear: year });
  const footerText = replaceEmailVariables(config.footer || '', { name, currentYear: year });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceEmailVariables(config.subject, { name, currentYear: year })}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030305; padding: 35px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(150deg, #171122 0%, #07060A 100%); border: 1px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.95);">
          
          <!-- Top Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 52px; height: 52px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 52px; text-align: center; color: #D4AF37; font-size: 20px; font-weight: bold; margin-bottom: 16px; background-color: rgba(212,175,55,0.1); box-shadow: 0 0 20px rgba(212,175,55,0.25);">
                ✨
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; font-weight: 700;">
                ${config.topLabel || 'A LETTER BEFORE YOUR DAY'}
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Golden Date Plaque -->
          <tr>
            <td align="center" style="padding: 24px 30px 10px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.35); border-radius: 50px; padding: 10px 28px;">
                <tr>
                  <td align="center" style="color: #FFF8E7; font-size: 13px; letter-spacing: 2px; font-weight: 700;">
                    28 SEPTEMBER ${year} · The next chapter awaits.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 22px 40px 28px 40px; text-align: center;">
              ${messageHtml}
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding: 10px 40px 38px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #E5CD74 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 22px 30px; background-color: #050408; border-top: 1px solid rgba(212,175,55,0.2);">
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 3. REAL BIRTHDAY MIDNIGHT EMAIL HTML (12:00 AM IST, 28 September)
export function generateBirthdayMidnightEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; tithiDate?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.birthday_midnight, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const age = calculateDynamicAge(new Date(`${year}-09-28T08:00:00+05:30`));
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene);

  const heading = replaceEmailVariables(config.heading, { name, age, currentYear: year, websiteUrl });
  const rawMessage = replaceEmailVariables(config.message, { name, age, currentYear: year, websiteUrl });
  const messageHtml = rawMessage
    .split('\n\n')
    .map((p) => `<p style="margin: 0 0 16px 0; color: #E8E4DF; font-size: 15px; line-height: 1.8;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
  const buttonText = replaceEmailVariables(config.buttonText, { name, age, currentYear: year });
  const footerText = replaceEmailVariables(config.footer || '', { name, age, currentYear: year });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceEmailVariables(config.subject, { name, age, currentYear: year })}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030305; padding: 35px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(150deg, #13101C 0%, #07060A 100%); border: 1px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.95);">
          
          <!-- Top Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #D4AF37; font-size: 22px; font-weight: bold; margin-bottom: 16px; background-color: rgba(212,175,55,0.1); box-shadow: 0 0 20px rgba(212,175,55,0.25);">
                ✦
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                ${config.topLabel || 'Midnight Cosmic Milestone · 28 September'}
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 30px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Dynamic Age Milestone Badge -->
          <tr>
            <td align="center" style="padding: 26px 30px 10px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.12); border: 1px solid #D4AF37; border-radius: 50px; padding: 10px 32px;">
                <tr>
                  <td align="center" style="color: #FFF8E7; font-size: 15px; letter-spacing: 2.5px; font-weight: 800;">
                    WELCOME TO ${age}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 22px 40px 28px 40px; text-align: center;">
              ${messageHtml}
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding: 10px 40px 38px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #E5CD74 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 22px 30px; background-color: #050408; border-top: 1px solid rgba(212,175,55,0.2);">
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 4. REAL BIRTH MOMENT EMAIL HTML (08:00 AM IST, 28 September)
export function generateBirthMomentEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; tithiDate?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.birth_moment, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const age = calculateDynamicAge(new Date(`${year}-09-28T08:00:00+05:30`));
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene);

  const heading = replaceEmailVariables(config.heading, { name, age, currentYear: year, websiteUrl });
  const rawMessage = replaceEmailVariables(config.message, { name, age, currentYear: year, websiteUrl });
  const messageHtml = rawMessage
    .split('\n\n')
    .map((p) => `<p style="margin: 0 0 16px 0; color: #E8E4DF; font-size: 15px; line-height: 1.8;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
  const buttonText = replaceEmailVariables(config.buttonText, { name, age, currentYear: year });
  const footerText = replaceEmailVariables(config.footer || '', { name, age, currentYear: year });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceEmailVariables(config.subject, { name, age, currentYear: year })}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030305; padding: 35px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(150deg, #181124 0%, #08060C 100%); border: 1px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.95);">
          
          <!-- Top Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #D4AF37; font-size: 22px; font-weight: bold; margin-bottom: 16px; background-color: rgba(212,175,55,0.1); box-shadow: 0 0 20px rgba(212,175,55,0.25);">
                ☀️
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                ${config.topLabel || 'Exact Moment of Birth · 08:00 AM IST'}
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Birth Moment Plaque -->
          <tr>
            <td align="center" style="padding: 26px 30px 10px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.12); border: 1px solid #D4AF37; border-radius: 16px; padding: 14px 28px; width: 100%;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                      The Genesis Moment
                    </p>
                    <p style="margin: 0; font-size: 20px; color: #FFF8E7; font-weight: bold; letter-spacing: 1.5px;">
                      28 SEPTEMBER 2003 · 08:00 AM
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #CBB06D;">
                      Kakinada, Andhra Pradesh · Tula Rashi · Swati (1st Pada)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 22px 40px 28px 40px; text-align: center;">
              ${messageHtml}
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding: 10px 40px 38px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #E5CD74 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 22px 30px; background-color: #050408; border-top: 1px solid rgba(212,175,55,0.2);">
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 5. REAL TITHI EMAIL HTML (08:00 AM IST on published Tithi date)
export function generateTithiEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; tithiDate?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.tithi, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const tithiDate = contextData.tithiDate || '14 October';
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene);

  const heading = replaceEmailVariables(config.heading, { name, currentYear: year, tithiDate, websiteUrl });
  const rawMessage = replaceEmailVariables(config.message, { name, currentYear: year, tithiDate, websiteUrl });
  const messageHtml = rawMessage
    .split('\n\n')
    .map((p) => `<p style="margin: 0 0 16px 0; color: #E8E4DF; font-size: 15px; line-height: 1.8;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
  const buttonText = replaceEmailVariables(config.buttonText, { name, currentYear: year, tithiDate });
  const footerText = replaceEmailVariables(config.footer || '', { name, currentYear: year, tithiDate });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceEmailVariables(config.subject, { name, currentYear: year, tithiDate })}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030305; padding: 35px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(150deg, #1F0712 0%, #0A0307 100%); border: 1px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.95);">
          
          <!-- Top Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #D4AF37; font-size: 22px; font-weight: bold; margin-bottom: 16px; background-color: rgba(212,175,55,0.12); box-shadow: 0 0 20px rgba(212,175,55,0.3);">
                ॐ
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                ${config.topLabel || 'Sacred Lunar Return · Sharan Navaratri'}
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Sacred Tithi Plaque -->
          <tr>
            <td align="center" style="padding: 26px 30px 10px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.14); border: 1px solid #D4AF37; border-radius: 16px; padding: 14px 28px; width: 100%;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                      Sacred Tithi Alignment
                    </p>
                    <p style="margin: 0; font-size: 20px; color: #FFF8E7; font-weight: bold; letter-spacing: 1.5px;">
                      Ashwayuja Shukla Tritiya
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #F3E5AB;">
                      ${tithiDate.toUpperCase()} ${year} · 08:00 AM IST
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 22px 40px 28px 40px; text-align: center;">
              ${messageHtml}
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding: 10px 40px 38px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #E5CD74 0%, #D4AF37 50%, #997A26 100%); box-shadow: 0 10px 30px rgba(212,175,55,0.35);">
                    <a href="${destinationUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-decoration: none; color: #07060A; text-transform: uppercase; border-radius: 50px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 22px 30px; background-color: #050408; border-top: 1px solid rgba(212,175,55,0.2);">
              <p style="margin: 0; font-size: 11px; letter-spacing: 1px; color: #8F8A82; line-height: 1.6;">
                ${footerText.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
