import { BIRTH_DETAILS } from '../src/data/timelineData';

export function generateBirthdayEmailHtml(recipientName: string = 'SIRI', year: number = 2026): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Happy Birthday, ${recipientName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050508; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Luxury Card -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(145deg, #121018 0%, #08070B 100%); border: 1px solid #D4AF37; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.8);">
          
          <!-- Top Celestial Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.2);">
              <div style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 50px; text-align: center; color: #D4AF37; font-size: 20px; font-weight: bold; margin-bottom: 15px; background-color: rgba(212,175,55,0.08);">
                ✦
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase;">
                A Celestial Milestone · ${year}
              </p>
              <h1 style="margin: 15px 0 0 0; font-size: 36px; font-weight: 700; letter-spacing: 3px; color: #FAF8F5; text-transform: uppercase;">
                HAPPY BIRTHDAY, <span style="color: #D4AF37;">${recipientName}</span>
              </h1>
            </td>
          </tr>

          <!-- Date Highlight -->
          <tr>
            <td align="center" style="padding: 30px 40px 10px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.3); border-radius: 50px; padding: 8px 25px;">
                <tr>
                  <td align="center" style="color: #FFF8E7; font-size: 14px; letter-spacing: 2px; font-weight: 600;">
                    28 SEPTEMBER ${year}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Core Message -->
          <tr>
            <td style="padding: 25px 45px 35px 45px; text-align: center; line-height: 1.8; color: #E8E4DF; font-size: 15px;">
              <p style="font-size: 18px; font-style: italic; color: #F3E5AB; margin-bottom: 20px;">
                “May every year ahead be filled with boundless happiness, peace, prosperity, love, and divine grace.”
              </p>
              <p style="margin: 0 0 15px 0; color: #C5C0B8;">
                Today marks the anniversary of the day your starlit journey began on <strong>28 September 2003</strong>.
              </p>
              <p style="margin: 0; color: #A8A29A; font-size: 13px;">
                Born under the sacred blessings of <strong>Sharan Navaratri</strong>, with <strong>Tula Rashi</strong> and <strong>Swati Nakshatra</strong>, may the ruling light of <strong>Venus (Shukra)</strong> continue to illuminate your path with wisdom and radiant joy.
              </p>
            </td>
          </tr>

          <!-- Sacred Details Footer -->
          <tr>
            <td align="center" style="padding: 25px 30px; background-color: #0A080E; border-top: 1px solid rgba(212,175,55,0.2);">
              <p style="margin: 0 0 8px 0; font-size: 10px; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;">
                ${BIRTH_DETAILS.blessing}
              </p>
              <p style="margin: 0; font-size: 11px; color: #736E67;">
                SIRI · A Journey Written in the Stars (2003 – 2103)
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

export function generateTithiEmailHtml(recipientName: string = 'SIRI', year: number = 2026, tithiDate: string = '14 October'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Divine Birthday Blessing — Ashwayuja Shukla Tritiya</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050508; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Luxury Card with Burgundy Touch -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(145deg, #1C050D 0%, #0A0306 100%); border: 1px solid #D4AF37; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
          
          <!-- Top Celestial Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 50px; text-align: center; color: #D4AF37; font-size: 20px; font-weight: bold; margin-bottom: 15px; background-color: rgba(212,175,55,0.1);">
                ॐ
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase;">
                Sacred Lunar Return · ${year}
              </p>
              <h1 style="margin: 15px 0 0 0; font-size: 32px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                A DIVINE BIRTHDAY BLESSING
              </h1>
            </td>
          </tr>

          <!-- Sacred Tithi Plaque -->
          <tr>
            <td align="center" style="padding: 30px 40px 10px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.12); border: 1px solid #D4AF37; border-radius: 12px; padding: 12px 25px; width: 100%;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;">
                      This Year's Lunar Tithi
                    </p>
                    <p style="margin: 0; font-size: 18px; color: #FFF8E7; font-weight: bold; letter-spacing: 1px;">
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

          <!-- Core Spiritual Message -->
          <tr>
            <td style="padding: 25px 45px 35px 45px; text-align: center; line-height: 1.8; color: #E8E4DF; font-size: 15px;">
              <p style="margin: 0 0 16px 0; color: #F5ECC9; font-size: 16px;">
                Dear <strong>${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 16px 0; color: #C5C0B8;">
                Your solar birth date is remembered every year on <strong>28 September</strong>.
              </p>
              <p style="margin: 0 0 16px 0; color: #E8E4DF;">
                According to the sacred Hindu lunar tradition, your corresponding birth Tithi returns today on <strong>${tithiDate} ${year}</strong> under the divine auspiciousness of <strong>Sharan Navaratri</strong>.
              </p>
              <p style="margin: 0; color: #A8A29A; font-size: 13px;">
                May the divine blessings of Goddess Durga bring eternal peace, good health, flourishing prosperity, and radiant joy to you throughout this year.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 25px 30px; background-color: #0D0206; border-top: 1px solid rgba(212,175,55,0.2);">
              <p style="margin: 0 0 8px 0; font-size: 10px; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;">
                ${BIRTH_DETAILS.blessing}
              </p>
              <p style="margin: 0; font-size: 11px; color: #736E67;">
                SIRI · Sharan Navaratri Lunar Anniversary
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

export function generateAdvanceTestEmailHtml(recipientName: string = 'SIRI', year: number = 2026): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Advance Happy Birthday, ${recipientName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050508; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FAF8F5;">

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Luxury Card -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(145deg, #14101A 0%, #07060A 100%); border: 1px solid #D4AF37; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
          
          <!-- Top Celestial Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(212,175,55,0.25);">
              <div style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid #D4AF37; line-height: 50px; text-align: center; color: #D4AF37; font-size: 20px; font-weight: bold; margin-bottom: 15px; background-color: rgba(212,175,55,0.1);">
                ✨
              </div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase;">
                A Little Early · Milestone Preview
              </p>
              <h1 style="margin: 15px 0 0 0; font-size: 32px; font-weight: 700; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                ADVANCE HAPPY BIRTHDAY, <span style="color: #D4AF37;">${recipientName}</span>!
              </h1>
            </td>
          </tr>

          <!-- Date Highlight -->
          <tr>
            <td align="center" style="padding: 25px 40px 10px 40px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.35); border-radius: 50px; padding: 10px 28px;">
                <tr>
                  <td align="center" style="color: #FFF8E7; font-size: 14px; letter-spacing: 2px; font-weight: 600;">
                    BIRTHDAY: 28 SEPTEMBER ${year}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Core Message -->
          <tr>
            <td style="padding: 25px 45px 35px 45px; text-align: center; line-height: 1.8; color: #E8E4DF; font-size: 15px;">
              <p style="font-size: 17px; font-style: italic; color: #F3E5AB; margin-bottom: 20px;">
                28 September is still a little ahead, but some birthdays are too special to wait for.
              </p>
              <p style="font-size: 20px; font-weight: bold; color: #D4AF37; margin: 0 0 15px 0;">
                Advance Happy Birthday, ${recipientName}!
              </p>
              <p style="margin: 0 0 15px 0; color: #C5C0B8;">
                Your special day is almost here.
              </p>
              <p style="margin: 0; color: #A8A29A; font-size: 13px;">
                Born under the sacred blessings of <strong>Sharan Navaratri</strong>, with <strong>Tula Rashi</strong> and <strong>Swati Nakshatra</strong>, may the ruling light of <strong>Venus (Shukra)</strong> continue to illuminate your path with boundless love, peace, and eternal joy.
              </p>
            </td>
          </tr>

          <!-- Sacred Details Footer -->
          <tr>
            <td align="center" style="padding: 25px 30px; background-color: #0A080E; border-top: 1px solid rgba(212,175,55,0.2);">
              <p style="margin: 0 0 8px 0; font-size: 10px; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;">
                ${BIRTH_DETAILS.blessing}
              </p>
              <p style="margin: 0; font-size: 11px; color: #736E67;">
                SIRI · A Journey Written in the Stars (2003 – 2103)
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

