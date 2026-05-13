
import { inMemoryDB } from '../store.ts';
import User from '../../Database/models/User.ts';

export const getAllUsers = async (req: any, res: any) => {
  try {
    if (!req.app.get('isDbConnected')) {
      // Return in-memory users (without passwords for security)
      const safeUsers = inMemoryDB.users.map(({ password, ...u }) => u);
      return res.json(safeUsers);
    }
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const createUser = async (req: any, res: any) => {
  try {
    const { name, email, role, password, organization, phone, sector } = req.body;
    if (!req.app.get('isDbConnected')) {
      const newUser = {
        id: `u-${Date.now()}`,
        name, email: email.toLowerCase(), role,
        password, organization, phone, sector,
        points: 0, reportsCount: 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        createdAt: new Date()
      };
      inMemoryDB.users.push(newUser);
      const { password: _, ...safeUser } = newUser;
      return res.status(201).json(safeUser);
    }
    const newUser = new User({ name, email, role, password, organization, phone, sector });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    if (!req.app.get('isDbConnected')) {
      inMemoryDB.users = inMemoryDB.users.filter(u => u.id !== id);
    } else {
      await User.findByIdAndDelete(id);
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const getLeaderboard = async (req: any, res: any) => {
  try {
    if (!req.app.get('isDbConnected')) {
      const sortedUsers = [...inMemoryDB.users].sort((a, b) => (b.points || 0) - (a.points || 0));
      const safeData = sortedUsers.map(u => ({ id: u.id, name: u.name, points: u.points, avatar: u.avatar, role: u.role, organization: u.organization, sector: u.sector }));
      return res.json(safeData);
    }
    const users = await User.find().sort({ points: -1 }).select('name points avatar role organization sector');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};
