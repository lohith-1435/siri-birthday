import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import { generateBirthdayEmailHtml, generateTithiEmailHtml } from '../server/emailTemplates';

async function testGmail() {
  const user = process.env.SMTP_USER || 'lohithmedisetti@gmail.com';
  const pass = process.env.SMTP_PASS || 'ihmu xdbq bccv zjhw';
  const recipient = process.env.RECIPIENT_EMAIL || 'lohithmedisetti1432004@gmail.com';

  console.log(`[Testing Gmail Connection]`);
  console.log(`From: ${user}`);
  console.log(`To: ${recipient}`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });

  try {
    console.log('Verifying SMTP credentials with Google...');
    await transporter.verify();
    console.log('✅ Google SMTP Authentication SUCCESSFUL!');

    // Test 1: Fixed Birthday Email
    console.log('1. Sending Birthday Email (28 September)...');
    const info1 = await transporter.sendMail({
      from: `"SIRI Celestial Journey" <${user}>`,
      to: recipient,
      subject: 'Happy Birthday, SIRI ✨ (Live Delivery Verification)',
      html: generateBirthdayEmailHtml('SIRI', 2026),
    });
    console.log('   🎉 Birthday Email Delivered! Message ID:', info1.messageId);

    // Test 2: Tithi Blessing Email
    console.log('2. Sending Tithi Blessing Email (14 October / Ashwayuja Shukla Tritiya)...');
    const info2 = await transporter.sendMail({
      from: `"SIRI Celestial Journey" <${user}>`,
      to: recipient,
      subject: 'A Divine Birthday Blessing ✨ (Ashwayuja Shukla Tritiya Verification)',
      html: generateTithiEmailHtml('SIRI', 2026, '14 October'),
    });
    console.log('   🎉 Tithi Blessing Email Delivered! Message ID:', info2.messageId);

    console.log('\n🌟 ALL TEST EMAILS DELIVERED SUCCESSFULLY TO INBOX!');
  } catch (error: any) {
    console.error('❌ Email failed with error:', error.message);
  }
}

testGmail();
