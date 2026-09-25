import { BIRTH_DETAILS } from '../src/data/timelineData';
import { calculateDynamicAge } from '../src/utils/timeCalculations';

export interface CustomEmailTemplateConfig {
  subject: string;
  heading: string;
  message: string;
  buttonText: string;
  websiteUrl: string;
  deepLinkScene?: string;
  footer?: string;
  enabled: boolean;
}

export interface AllEmailTemplates {
  birthday_midnight: CustomEmailTemplateConfig;
  birth_moment: CustomEmailTemplateConfig;
  tithi: CustomEmailTemplateConfig;
  advance_test: CustomEmailTemplateConfig;
}

export const DEFAULT_EMAIL_TEMPLATES: AllEmailTemplates = {
  birthday_midnight: {
    subject: 'The Day Has Arrived, {{name}} ✨',
    heading: 'THE DAY HAS ARRIVED',
    message: `The wait is over.\n\nToday marks the day your beautiful journey began.\n\n28 September\n\nHappy Birthday, {{name}}! ❤️`,
    buttonText: 'ENTER YOUR STORY →',
    websiteUrl: 'http://localhost:5173',
    deepLinkScene: 'birthday',
    footer: `${BIRTH_DETAILS.blessing}\nSIRI · A Journey Written in the Stars (2003 – 2103)`,
    enabled: true,
  },
  birth_moment: {
    subject: 'At 8:00 AM — The Moment It All Began ✨',
    heading: 'AT 8:00 AM — THE MOMENT IT ALL BEGAN',
    message: `At this very moment, your journey began.\n\n28 September 2003 · 08:00 AM\n\nToday marks another beautiful chapter of your journey.\n\nWelcome to {{age}} years of grace and light.\n\nHappy Birthday, {{name}}! ❤️`,
    buttonText: 'REVISIT YOUR BEGINNING →',
    websiteUrl: 'http://localhost:5173',
    deepLinkScene: 'birth-moment',
    footer: `${BIRTH_DETAILS.blessing}\nSIRI · Birth Moment 28 September 2003, 08:00 AM IST`,
    enabled: true,
  },
  tithi: {
    subject: 'A Divine Birthday Blessing ✨',
    heading: 'A DIVINE BIRTHDAY BLESSING',
    message: `Today, your corresponding birth Tithi returns.\n\n{{tithi_name}}\n\n{{tithi_date}} {{current_year}}\n\nMay this sacred day bring boundless happiness, peace, prosperity, and divine blessings to your life.`,
    buttonText: "DISCOVER TODAY'S TITHI →",
    websiteUrl: 'http://localhost:5173',
    deepLinkScene: 'tithi',
    footer: `${BIRTH_DETAILS.blessing}\nSIRI · Sharan Navaratri Lunar Anniversary`,
    enabled: true,
  },
  advance_test: {
    subject: 'A Little Early... But Happy Birthday, {{name}} ✨',
    heading: 'YOUR SPECIAL DAY IS APPROACHING',
    message: `Some birthdays are simply too special to wait for.\n\nADVANCE HAPPY BIRTHDAY, {{name}}! ❤️\n\nYour special day is almost here:\n28 September {{current_year}} · 08:00 AM\n\nYour corresponding birth Tithi will return on {{tithi_date}} {{current_year}}.`,
    buttonText: 'ENTER THE BIRTHDAY EXPERIENCE →',
    websiteUrl: 'http://localhost:5173',
    deepLinkScene: '',
    footer: `${BIRTH_DETAILS.blessing}\nSIRI · Advance Milestone Preview`,
    enabled: true,
  },
};

/**
 * Calculates live snapshot of remaining time until 28 September 08:00 AM IST of given year
 */
export function calculateRemainingCountdownSnapshot(targetYear: number = new Date().getFullYear()): {
  days: number;
  hours: number;
  minutes: number;
  formatted: string;
} {
  const now = new Date();
  let target = new Date(`${targetYear}-09-28T08:00:00+05:30`).getTime();
  if (now.getTime() > target) {
    target = new Date(`${targetYear + 1}-09-28T08:00:00+05:30`).getTime();
  }

  const diffMs = Math.max(0, target - now.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

  return {
    days,
    hours,
    minutes,
    formatted: `${days} DAYS · ${hours} HOURS · ${minutes} MINUTES`,
  };
}

/**
 * Evaluates template variables: {{name}}, {{age}}, {{birth_date}}, {{birth_time}}, {{current_year}}, {{tithi_date}}, {{tithi_name}}, {{website_url}}, {{time_remaining}}
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
    timeRemaining?: string;
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
  const timeRemaining = data.timeRemaining || calculateRemainingCountdownSnapshot(currentYear).formatted;

  return text
    .replace(/\{\{name\}\}/gi, name)
    .replace(/\{\{age\}\}/gi, String(age))
    .replace(/\{\{birth_date\}\}/gi, birthDate)
    .replace(/\{\{birth_time\}\}/gi, birthTime)
    .replace(/\{\{current_year\}\}/gi, String(currentYear))
    .replace(/\{\{tithi_date\}\}/gi, tithiDate)
    .replace(/\{\{tithi_name\}\}/gi, tithiName)
    .replace(/\{\{website_url\}\}/gi, websiteUrl)
    .replace(/\{\{time_remaining\}\}/gi, timeRemaining);
}

function buildDestinationUrl(baseUrl: string, sceneParam?: string): string {
  let url = baseUrl.trim();
  if (!url) url = 'http://localhost:5173';
  if (!sceneParam) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}scene=${encodeURIComponent(sceneParam)}`;
}

// EMAIL 1: Birthday Midnight (12:00 AM, 28 September)
export function generateBirthdayMidnightEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; tithiDate?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.birthday_midnight, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene);

  const heading = replaceEmailVariables(config.heading, { name, currentYear: year, websiteUrl });
  const rawMessage = replaceEmailVariables(config.message, { name, currentYear: year, websiteUrl });
  const messageHtml = rawMessage
    .split('\n\n')
    .map((para) => `<p style="margin: 0 0 16px 0; color: #E8E4DF; font-size: 15px; line-height: 1.8;">${para.replace(/\n/g, '<br>')}</p>`)
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
        <!-- Main Luxury Obsidian & Gold Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(150deg, #13101C 0%, #07060A 100%); border: 1px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.9);">
          
          <!-- Top Celestial Monogram Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #D4AF37; font-size: 22px; font-weight: bold; margin-bottom: 16px; background-color: rgba(212,175,55,0.1); box-shadow: 0 0 20px rgba(212,175,55,0.25);">
                ✦
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                Midnight Cosmic Milestone · 28 September ${year}
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 32px; font-weight: 700; letter-spacing: 2.5px; color: #FAF8F5; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Golden Date Plaque -->
          <tr>
            <td align="center" style="padding: 28px 30px 10px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.35); border-radius: 50px; padding: 10px 28px;">
                <tr>
                  <td align="center" style="color: #FFF8E7; font-size: 14px; letter-spacing: 2px; font-weight: 700;">
                    28 SEPTEMBER ${year} · 12:00 AM IST
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 25px 40px 30px 40px; text-align: center;">
              ${messageHtml}
            </td>
          </tr>

          <!-- Interactive Website Button -->
          <tr>
            <td align="center" style="padding: 10px 40px 40px 40px;">
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

          <!-- Sacred Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #060509; border-top: 1px solid rgba(212,175,55,0.2);">
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

// EMAIL 2: Birth Moment (08:00 AM, 28 September)
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
    .map((para) => `<p style="margin: 0 0 16px 0; color: #E8E4DF; font-size: 15px; line-height: 1.8;">${para.replace(/\n/g, '<br>')}</p>`)
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
        <!-- Main Luxury Obsidian & Gold Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(150deg, #181124 0%, #08060C 100%); border: 1px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.9);">
          
          <!-- Top Celestial Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #D4AF37; font-size: 22px; font-weight: bold; margin-bottom: 16px; background-color: rgba(212,175,55,0.1); box-shadow: 0 0 20px rgba(212,175,55,0.25);">
                ☀️
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                Exact Moment of Birth · 08:00 AM IST
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 30px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Age & Moment Plaque -->
          <tr>
            <td align="center" style="padding: 28px 30px 10px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.12); border: 1px solid #D4AF37; border-radius: 16px; padding: 14px 30px; width: 100%;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                      Life Journey Milestone
                    </p>
                    <p style="margin: 0; font-size: 24px; color: #FFF8E7; font-weight: bold; letter-spacing: 1.5px;">
                      WELCOME TO ${age}
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #CBB06D;">
                      28 September 2003 · 08:00 AM → 28 September ${year} · 08:00 AM
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 25px 40px 30px 40px; text-align: center;">
              ${messageHtml}
              <p style="margin: 15px 0 0 0; font-size: 13px; color: #A8A29A; line-height: 1.6;">
                Tula Rashi · Swati Nakshatra (1st Pada) · Shukra (Venus) Light
              </p>
            </td>
          </tr>

          <!-- Interactive Website Button -->
          <tr>
            <td align="center" style="padding: 10px 40px 40px 40px;">
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

          <!-- Sacred Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #060509; border-top: 1px solid rgba(212,175,55,0.2);">
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

// EMAIL 3: Yearly Tithi (08:00 AM on published date)
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
    .map((para) => `<p style="margin: 0 0 16px 0; color: #E8E4DF; font-size: 15px; line-height: 1.8;">${para.replace(/\n/g, '<br>')}</p>`)
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
        <!-- Main Luxury Card with Burgundy & Gold -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(150deg, #1F0712 0%, #0A0307 100%); border: 1px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.95);">
          
          <!-- Top Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #D4AF37; font-size: 22px; font-weight: bold; margin-bottom: 16px; background-color: rgba(212,175,55,0.12); box-shadow: 0 0 20px rgba(212,175,55,0.3);">
                ॐ
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                Sacred Lunar Return · Sharan Navaratri
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Sacred Tithi Plaque -->
          <tr>
            <td align="center" style="padding: 28px 30px 10px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.14); border: 1px solid #D4AF37; border-radius: 16px; padding: 14px 30px; width: 100%;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                      This Year's Lunar Tithi Date
                    </p>
                    <p style="margin: 0; font-size: 22px; color: #FFF8E7; font-weight: bold; letter-spacing: 1.5px;">
                      ${tithiDate.toUpperCase()} ${year}
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #F3E5AB; font-style: italic;">
                      ${BIRTH_DETAILS.tithi} (${BIRTH_DETAILS.tithiSanskrit})
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 25px 40px 30px 40px; text-align: center;">
              ${messageHtml}
            </td>
          </tr>

          <!-- Interactive Website Button -->
          <tr>
            <td align="center" style="padding: 10px 40px 40px 40px;">
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

          <!-- Sacred Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #0B0206; border-top: 1px solid rgba(212,175,55,0.2);">
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

// EMAIL 4: Advance Test Email (Dynamic Remaining Countdown Snapshot)
export function generateAdvanceTestEmailHtml(
  customConfig?: Partial<CustomEmailTemplateConfig>,
  contextData: { name?: string; year?: number; websiteUrl?: string; tithiDate?: string } = {}
): string {
  const config = { ...DEFAULT_EMAIL_TEMPLATES.advance_test, ...customConfig };
  const year = contextData.year || new Date().getFullYear();
  const name = contextData.name || 'SIRI';
  const tithiDate = contextData.tithiDate || '14 October';
  const countdownSnapshot = calculateRemainingCountdownSnapshot(year);
  const websiteUrl = contextData.websiteUrl || config.websiteUrl;
  const destinationUrl = buildDestinationUrl(websiteUrl, config.deepLinkScene);

  const heading = replaceEmailVariables(config.heading, { name, currentYear: year, tithiDate, timeRemaining: countdownSnapshot.formatted, websiteUrl });
  const rawMessage = replaceEmailVariables(config.message, { name, currentYear: year, tithiDate, timeRemaining: countdownSnapshot.formatted, websiteUrl });
  const messageHtml = rawMessage
    .split('\n\n')
    .map((para) => `<p style="margin: 0 0 16px 0; color: #E8E4DF; font-size: 15px; line-height: 1.8;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
  const buttonText = replaceEmailVariables(config.buttonText, { name, currentYear: year });
  const footerText = replaceEmailVariables(config.footer || '', { name, currentYear: year });

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
        <!-- Main Luxury Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(150deg, #151120 0%, #07050A 100%); border: 1px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.9);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 54px; text-align: center; color: #D4AF37; font-size: 22px; font-weight: bold; margin-bottom: 16px; background-color: rgba(212,175,55,0.1); box-shadow: 0 0 20px rgba(212,175,55,0.25);">
                ✨
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; font-weight: 600;">
                A Little Early · Advance Birthday Preview
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Dynamic Remaining Time Countdown Box -->
          <tr>
            <td align="center" style="padding: 28px 30px 10px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.12); border: 1px solid #D4AF37; border-radius: 16px; padding: 16px 25px; width: 100%;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 3px; color: #D4AF37; text-transform: uppercase; font-weight: 700;">
                      THE WAIT
                    </p>
                    <p style="margin: 0; font-size: 22px; color: #FFF8E7; font-weight: 800; letter-spacing: 2px;">
                      ${countdownSnapshot.formatted}
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #C5C0B8;">
                      Target: 28 September ${year} · 08:00 AM IST
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 25px 40px 30px 40px; text-align: center;">
              ${messageHtml}
            </td>
          </tr>

          <!-- Interactive Website Button -->
          <tr>
            <td align="center" style="padding: 10px 40px 40px 40px;">
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

          <!-- Sacred Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #060509; border-top: 1px solid rgba(212,175,55,0.2);">
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
