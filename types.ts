
export enum IncidentType {
  LAND_DAMAGE = 'Land Damage',
  ILLEGAL_LOGGING = 'Illegal Logging',
  INJURED_WILDLIFE = 'Injured Wildlife',
  ROAD_ACCIDENT = 'Animal Road Accident',
  POLLUTION = 'Pollution',
  OTHER = 'Other'
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export type UserRole = 'user' | 'admin' | 'authority';

export type ReportStatus = 'pending' | 'verified' | 'assigned' | 'investigating' | 'solved_by_authority' | 'resolved' | 'rejected';

export interface TimelineEvent {
  status: ReportStatus;
  timestamp: Date;
  message: string;
  actor: string;
  actionTaken?: string;
  proofUrl?: string;
}

export interface Report {
  id: string;
  _id?: string;
  reportNumber?: number;
  type: IncidentType;
  severity: Severity;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  timestamp: Date;
  imageUrl?: string;
  status: ReportStatus;
  reporterId: string;
  assignedAuthorityId?: string; 
  aiInsights?: string;
  timeline: TimelineEvent[];
  resolutionDetails?: string;
  resolvedImageUrl?: string;
  internalNotes?: string[];
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  targetOrganization?: string;
  isRead?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  reportsCount: number;
  avatar?: string;
  organization?: string;
  phone?: string;
  sector?: string;
}

export interface AIAnalysisResult {
  detectedType: IncidentType;
  severity: Severity;
  explanation: string;
  recommendedAction: string;
}

export interface EnvironmentalResource {
  id: string;
  title: string;
  content: string;
  category: 'note' | 'wildlife' | 'link' | 'directive' | 'directory' | 'regulation';
  url?: string;
  icon?: string;
  email?: string;
  phone?: string;
}
