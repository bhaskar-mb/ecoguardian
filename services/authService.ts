
import { User, UserRole } from "../types.ts";

const API_URL = 'http://localhost:5000/api/auth';

export const loginUser = async (email: string, password: string, role: UserRole): Promise<User> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  if (data.token) {
    localStorage.setItem('eco_token', data.token);
  }

  return data.user;
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
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, role, password, organization, phone, sector })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  if (data.token) {
    localStorage.setItem('eco_token', data.token);
  }

  return data.user;
};

export const logoutUser = () => {
  localStorage.removeItem('eco_token');
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('eco_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const sendOtp = async (email: string): Promise<string> => {
  const response = await fetch(`${API_URL}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'OTP delivery failed');
  }
  return data.otp; // In real app, we don't return OTP to client, but for demo we do.
};

export const verifyOtp = async (email: string, code: string, role: UserRole): Promise<User> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'otp', role, otp: code }) // Logic to be handled in login or a separate endpoint
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Verification failed');
  }

  if (data.token) {
    localStorage.setItem('eco_token', data.token);
  }

  return data.user;
};

export const verifyEmail = async (email: string, code: string): Promise<void> => {
  const response = await fetch(`${API_URL}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Verification failed');
  }
};
