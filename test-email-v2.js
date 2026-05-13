
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // try default first

console.log('--- FINAL DEBUG ---');
console.log('USER:', process.env.EMAIL_USER);
console.log('PASS:', process.env.EMAIL_PASS ? '********' : 'MISSING');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ VERIFY ERROR:', error);
  } else {
    console.log('✅ SERVER IS READY TO TAKE OUR MESSAGES');
    
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'EcoGuardian - FINAL TEST',
      text: 'Notification test successful!'
    }, (err, info) => {
      if (err) {
        console.log('❌ SEND ERROR:', err);
      } else {
        console.log('✅ EMAIL SENT:', info.response);
      }
    });
  }
});
