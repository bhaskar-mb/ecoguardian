
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('--- Email Config Test ---');
console.log('User:', process.env.EMAIL_USER);
console.log('Host:', process.env.EMAIL_HOST);
console.log('Port:', process.env.EMAIL_PORT);
console.log('Admin Target:', process.env.ADMIN_EMAIL);

const transporter = nodemailer.createTransport({
  service: 'gmail', // Simplifies config for Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function test() {
  try {
    console.log('Testing connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'EcoGuardian Test Notification',
      text: 'This is a test notification from the EcoGuardian system. If you see this, your email configuration is working correctly.',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Connection or Send failed:');
    console.error(err);
  }
}

test();
