
/**
 * Shared In-Memory Data Store
 * Acts as a persistent local database when MongoDB is offline.
 * All controllers reference this same module so data stays consistent.
 */

export const inMemoryDB = {
  users: [
    {
      id: 'admin-001',
      name: 'Chief Warden',
      email: 'admin@ecoguard.ai',
      role: 'admin',
      password: 'admin',
      points: 0,
      reportsCount: 0,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
      organization: null,
      phone: null,
      sector: null,
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'user-001',
      name: 'John Sentinel',
      email: 'user@test.com',
      role: 'user',
      password: 'user',
      points: 450,
      reportsCount: 4,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      organization: null,
      phone: null,
      sector: 'North Ridge',
      createdAt: new Date('2024-01-02')
    },
    {
      id: 'auth-raghu',
      name: 'raghu',
      email: 'raghu@ecoguard.ai',
      role: 'authority',
      password: 'parks',
      points: 0,
      reportsCount: 0,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raghu',
      organization: 'Municipal Parks Dept',
      phone: null,
      sector: null,
      createdAt: new Date('2024-01-03')
    },
    {
      id: 'auth-001',
      name: 'Forestry Warden',
      email: 'forestry@agency.gov',
      role: 'authority',
      password: 'forest',
      points: 0,
      reportsCount: 0,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Forestry',
      organization: 'Forestry Commission',
      phone: null,
      sector: null,
      createdAt: new Date('2024-01-04')
    },
    {
      id: 'auth-002',
      name: 'Marine Warden',
      email: 'marine@agency.gov',
      role: 'authority',
      password: 'ocean',
      points: 0,
      reportsCount: 0,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marine',
      organization: 'Marine Conservation Society',
      phone: null,
      sector: null,
      createdAt: new Date('2024-01-05')
    }
  ] as any[]
};
