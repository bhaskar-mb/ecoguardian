
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create reusable transporter object using the default SMTP transport
// Note: Users should configure these environment variables for real production use.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendAdminReportNotification = async (reportData: any) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecoguard.ai';
  
  const mailOptions = {
    from: `"EcoGuardian System" <${process.env.EMAIL_USER || 'system@ecoguard.ai'}>`,
    to: adminEmail,
    subject: `🚨 New Environmental Report: ${reportData.type}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px; border-radius: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #0f172a; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase;">Sentinel Alert</h1>
            <p style="margin: 10px 0 0; font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.2em;">Incident Detected on Network</p>
          </div>
          
          <div style="padding: 40px;">
            <div style="margin-bottom: 25px;">
              <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 5px;">Incident Type</span>
              <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">${reportData.type}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 5px;">Severity Level</span>
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: ${reportData.severity === 'high' || reportData.severity === 'critical' ? '#ef4444' : '#f59e0b'}; text-transform: uppercase;">${reportData.severity}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 5px;">Observation Details</span>
              <p style="margin: 0; font-size: 14px; font-weight: 500; color: #475569; font-style: italic;">"${reportData.description}"</p>
            </div>
            
            <div style="margin-bottom: 35px;">
              <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 5px;">Location</span>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">${reportData.location?.address || 'Site Coordinates Attached'}</p>
            </div>
            
            <a href="http://localhost:5173" style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">Access Management Grid</a>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
            Secure Automated Dispatch • ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAIL] Admin notification dispatched: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[MAIL] Failed to send admin notification:', error);
    return false;
  }
};
