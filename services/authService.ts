
import { User, UserRole } from "../types.ts";

const MOCK_DB: Record<string, User & { password?: string }> = {
  'admin@ecoguard.ai': {
    id: 'admin-001',
    name: 'Chief Warden',
    email: 'admin@ecoguard.ai',
    role: 'admin',
    points: 0,
    reportsCount: 0,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
    password: 'admin'
  },
  'user@test.com': {
    id: 'user-001',
    name: 'John Sentinel',
    email: 'user@test.com',
    role: 'user',
    points: 450,
    reportsCount: 4,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    password: 'user'
  },
  'forestry@agency.gov': {
    id: 'auth-001',
    name: 'Forestry Warden',
    email: 'forestry@agency.gov',
    role: 'authority',
    points: 0,
    reportsCount: 0,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Forestry',
    password: 'forest',
    organization: 'Forestry Commission'
  },
  'marine@agency.gov': {
    id: 'auth-002',
    name: 'Marine Warden',
    email: 'marine@agency.gov',
    role: 'authority',
    points: 0,
    reportsCount: 0,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marine',
    password: 'ocean',
    organization: 'Marine Conservation Society'
  },
  'air@agency.gov': {
    id: 'auth-003',
    name: 'Air Inspector',
    email: 'air@agency.gov',
    role: 'authority',
    points: 0,
    reportsCount: 0,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Air',
    password: 'clean',
    organization: 'Air Quality Control Board'
  }
};

export const loginUser = async (email: string, password: string, role: UserRole): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const user = MOCK_DB[email.toLowerCase()];
  
  if (!user || user.role !== role || (user.password && user.password !== password)) {
    throw new Error("Invalid credentials.");
  }

  return { ...user };
};

export const registerUser = async (
  name: string, 
  email: string, 
  role: UserRole, 
  password?: string, 
  organization?: string,
  phone?: string,
  sector?: string
): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newUser: User = {
    id: `u-${Math.random().toString(36).substr(2, 5)}`,
    name,
    email: email.toLowerCase(),
    role,
    points: 0,
    reportsCount: 0,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    organization,
    phone,
    sector
  };
  MOCK_DB[email.toLowerCase()] = { ...newUser, password };
  return newUser;
};

const MockOTPStore: Record<string, string> = {};

export const sendOtp = async (contactInfo: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  // Find user by email or phone
  const isFound = Object.values(MOCK_DB).find(u => u.email === contactInfo.toLowerCase() || u.phone === contactInfo);
  if (!isFound) {
    throw new Error("No account found with this contact info.");
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  MockOTPStore[contactInfo.toLowerCase()] = otp;

  // Check if contactInfo is a phone number (just a basic test)
  const isPhone = /^\+?[0-9]{7,15}$/.test(contactInfo.replace(/[\s-]/g, ''));
  
  if (isPhone) {
    const accountSid = (import.meta as any).env.VITE_TWILIO_ACCOUNT_SID;
    const authToken = (import.meta as any).env.VITE_TWILIO_AUTH_TOKEN;
    const twilioNumber = (import.meta as any).env.VITE_TWILIO_PHONE_NUMBER;

    // Send Real SMS if credentials are provided
    if (accountSid && authToken && twilioNumber) {
      const formattedPhone = contactInfo.startsWith('+') ? contactInfo : `+${contactInfo}`; // Ideally requires country code
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      const formData = new URLSearchParams();
      formData.append('To', formattedPhone);
      formData.append('From', twilioNumber);
      formData.append('Body', `Your EcoGuardian Verification Code is: ${otp}`);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + window.btoa(`${accountSid}:${authToken}`)
          },
          body: formData.toString()
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Twilio SMS failed');
        }
        
        console.log(`[SMS SENT VIA TWILIO] OTP for ${formattedPhone}: ${otp}`);
        return "SMS_SENT";
      } catch (err: any) {
        console.error("Twilio SMS Error:", err);
        throw new Error("Failed to send real SMS. Check your Twilio credentials.");
      }
    }
  }
  
  console.log(`[SIMULATED SMS/EMAIL] OTP for ${contactInfo}: ${otp}`);
  return otp;
};

export const verifyOtp = async (contactInfo: string, otp: string, role: UserRole): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const user = Object.values(MOCK_DB).find(u => u.email === contactInfo.toLowerCase() || u.phone === contactInfo);
  
  if (!user || user.role !== role) {
    throw new Error("Invalid role or user not found.");
  }
  
  const expectedOtp = MockOTPStore[contactInfo.toLowerCase()];
  
  if (!expectedOtp || otp !== expectedOtp) {
    throw new Error("Invalid or expired OTP code.");
  }
  
  delete MockOTPStore[contactInfo.toLowerCase()];
  
  return { ...user };
};
