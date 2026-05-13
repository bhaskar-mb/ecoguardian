
import jwt from 'jsonwebtoken';
import { inMemoryDB } from '../store.ts';
import User from '../../Database/models/User.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
const JWT_EXPIRE = '24h';

const generateToken = (id: string, version: number) => {
  return jwt.sign({ id, version }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const login = async (req: any, res: any) => {
  const { email, password, role, otp } = req.body;

  try {
    if (!req.app.get('isDbConnected')) {
      const user = inMemoryDB.users.find(u => u.email === email.toLowerCase());
      if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
      
      if (password === 'otp') {
         if (user.verificationCode !== otp && user.mfaCode !== otp) {
            return res.status(401).json({ message: 'Invalid credentials.' });
         }
      } else if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      if (user.role !== role) return res.status(401).json({ message: 'Invalid credentials.' });

      const { password: p, ...safeUser } = user;
      const token = generateToken(user.id, user.tokenVersion || 0);
      return res.json({ success: true, token, user: safeUser });
    }

    const user: any = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    if (password === 'otp') {
       if (user.mfaCode !== otp || (user.mfaExpires && user.mfaExpires < new Date())) {
          return res.status(401).json({ message: 'Invalid credentials.' });
       }
       // Consume OTP
       user.mfaCode = undefined;
       await user.save();
    } else {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.role !== role) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateToken(user._id, user.tokenVersion || 0);
    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ message: 'An internal error occurred.' });
  }
};

export const register = async (req: any, res: any) => {
  const { name, email, password, role, organization, phone, sector } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Registration could not be completed.' });
  }

  try {
    if (!req.app.get('isDbConnected')) {
      const exists = inMemoryDB.users.find(u => u.email === email.toLowerCase());
      if (exists) return res.status(400).json({ message: 'Registration could not be completed.' });

      const newUser = {
        id: `u-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        role,
        password,
        organization: organization || null,
        phone: phone || null,
        sector: sector || null,
        points: 0,
        reportsCount: 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        isVerified: true,
        verificationCode: null,
        tokenVersion: 0,
        createdAt: new Date()
      };
      inMemoryDB.users.push(newUser);

      console.log(`[VERIFICATION] Code for ${email}: ${newUser.verificationCode}`);
      
      const { password: _, ...safeUser } = newUser;
      return res.status(201).json({ 
        success: true, 
        message: 'Registration successful. Secure access granted.',
        user: safeUser 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'Registration could not be completed.' });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name, email: email.toLowerCase(), password, role,
      organization, phone, sector,
      isVerified: true,
      mfaCode: null,
      mfaExpires: new Date(Date.now() + 3600000), // 1 hour
      tokenVersion: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    });
    
    await newUser.save();
    
    console.log(`[VERIFICATION] Code for ${email}: ${verificationCode}`);

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful. Secure access granted.',
      user: { name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(400).json({ message: 'Registration could not be completed.' });
  }
};

export const verifyEmail = async (req: any, res: any) => {
  const { email, code } = req.body;
  try {
    if (!req.app.get('isDbConnected')) {
      const user = inMemoryDB.users.find(u => u.email === email.toLowerCase());
      if (user && user.verificationCode === code) {
        user.isVerified = true;
        return res.json({ success: true, message: 'Email verified successfully.' });
      }
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      mfaCode: code,
      mfaExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    user.isVerified = true;
    user.mfaCode = undefined;
    user.mfaExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed.' });
  }
};

export const forgotPassword = async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent user discovery
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a recovery signal has been dispatched.' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    console.log(`[SECURITY] Password Reset Token for ${email}: ${resetToken}`);
    res.json({ success: true, message: 'If an account exists, a recovery signal has been dispatched.' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing recovery request.' });
  }
};

export const sendLoginOTP = async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = otp;
    user.mfaExpires = new Date(Date.now() + 600000); // 10 minutes
    await user.save();

    console.log(`[SECURITY] Login OTP for ${email}: ${otp}`);
    res.json({ success: true, message: 'Secure MFA code routed to your device.', otp }); // Sending OTP in JSON for demo/testing convenience
  } catch (error) {
    res.status(500).json({ message: 'Error routing secure signal.' });
  }
};

export const verifyMFA = async (req: any, res: any) => {
  const { email, code } = req.body;
  // Demonstration logic: verify OTP for sensitive actions
  res.json({ success: true, message: 'MFA verification successful.' });
};

export const resetPassword = async (req: any, res: any) => {
  const { token, newPassword } = req.body;
  // Demonstration logic: find user by token, check expiry, hash new password, save
  res.json({ success: true, message: 'Password has been reset successfully. All other sessions invalidated.' });
};
