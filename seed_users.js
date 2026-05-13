
import mongoose from 'mongoose';
import User from './Database/models/User.ts';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoguardian';

const users = [
  {
    name: 'Bhaskar',
    email: 'bhaskar@real.com',
    role: 'user',
    password: 'password', // Standard password for your testing
    isVerified: true,
    points: 100,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bhaskar'
  },
  {
    name: 'Chief Warden',
    email: 'admin@ecoguard.ai',
    role: 'admin',
    password: 'admin',
    isVerified: true,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'
  },
  {
    name: 'John Sentinel',
    email: 'user@test.com',
    role: 'user',
    password: 'user',
    isVerified: true,
    points: 450,
    reportsCount: 4,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  },
  {
    name: 'raghu',
    email: 'raghu@ecoguard.ai',
    role: 'authority',
    password: 'parks',
    isVerified: true,
    organization: 'Municipal Parks Dept',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raghu'
  },
  {
    name: 'Maya Patel',
    email: 'maya@user.com',
    role: 'user',
    password: 'user',
    isVerified: true,
    points: 1250,
    sector: 'Sector Delta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya'
  },
  {
    name: 'Liam Chen',
    email: 'liam@user.com',
    role: 'user',
    password: 'user',
    isVerified: true,
    points: 980,
    sector: 'Sector Alpha',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam'
  },
  {
    name: 'Elena Rostova',
    email: 'elena@user.com',
    role: 'user',
    password: 'user',
    isVerified: true,
    points: 840,
    sector: 'Sector Beta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'
  },
  {
    name: 'Marcus Vance',
    email: 'marcus@user.com',
    role: 'user',
    password: 'user',
    isVerified: true,
    points: 620,
    sector: 'Sector Gamma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
  },
  {
    name: 'Sarah Fieldings',
    email: 'sarah@user.com',
    role: 'user',
    password: 'user',
    isVerified: true,
    points: 310,
    sector: 'Sector Alpha',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    name: 'Test User',
    email: 'test@user.com',
    role: 'user',
    password: 'user',
    isVerified: true,
    points: 150,
    sector: 'Sector Beta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test'
  }
];

import bcrypt from 'bcryptjs';

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Hash passwords and insert
    const hashedUsers = await Promise.all(users.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 12)
    })));
    
    await User.insertMany(hashedUsers);
    console.log('Successfully seeded users with hashed passwords');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

seedUsers();
