export interface DashboardStats {
  totalMissions: number;
  completedMissions: number;
  pendingMissions: number;
  urgentMissions: number;
  overdueMissions: number;
  completionRate: number;
  
  totalEmployees: number;
  activeEmployees: number;
  employeesOnMission: number;
  
  todayMissions: number;
  todayCompleted: number;
  todayPending: number;
  
  weeklyMissions: number;
  weeklyCompleted: number;
  
  aiApprovedMissions: number;
  aiPendingReview: number;
  averageAiScore: number;
  
  totalPointsAwarded: number;
  totalPointsDeducted: number;
}

export interface PointTransaction {
  id: number;
  employeeId: number;
  employeeName: string;
  missionId?: number;
  missionTitle?: string;
  points: number;
  type: PointTransactionType;
  reason: string;
  description?: string;
  createdAt: string;
}

export type PointTransactionType = 
  | 'ON_TIME_ARRIVAL'
  | 'TASK_COMPLETED'
  | 'HIGH_AI_QUALITY_SCORE'
  | 'EMERGENCY_INTERVENTION'
  | 'CLIENT_POSITIVE_FEEDBACK'
  | 'ZERO_REWORK'
  | 'PERFECT_WEEK'
  | 'TRAINING_COMPLETED'
  | 'MENTOR_BONUS'
  | 'UNJUSTIFIED_ABSENCE'
  | 'LATE_ARRIVAL'
  | 'POOR_QUALITY_WORK'
  | 'MISSING_PHOTOS'
  | 'TASK_REJECTED'
  | 'SAFETY_VIOLATION'
  | 'CLIENT_COMPLAINT'
  | 'SLA_BREACH'
  | 'MANUAL_ADJUSTMENT';

export interface Leaderboard {
  entries: LeaderboardEntry[];
  totalEmployees: number;
  period: string;
}

export interface LeaderboardEntry {
  rank: number;
  employeeId: number;
  employeeName: string;
  profilePhoto?: string;
  points: number;
  missionsCompleted: number;
  successRate: number;
  badge: 'gold' | 'silver' | 'bronze' | 'none';
}

export interface Absence {
  id: number;
  employeeId: number;
  employeeName: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  reason?: string;
  notes?: string;
  status: AbsenceStatus;
  documentPath?: string;
  pointsPenalty?: number;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
}

export type AbsenceType = 
  | 'CONGE_PAYE'
  | 'CONGE_SANS_SOLDE'
  | 'RTT'
  | 'MALADIE'
  | 'MALADIE_PROFESSIONNELLE'
  | 'ACCIDENT_TRAVAIL'
  | 'MATERNITE'
  | 'PATERNITE'
  | 'FORMATION'
  | 'ABSENCE_JUSTIFIEE'
  | 'ABSENCE_INJUSTIFIEE'
  | 'CONGE_EXCEPTIONNEL'
  | 'TELETRAVAIL'
  | 'OTHER';

export type AbsenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
  CONGE_PAYE: 'Congé payé',
  CONGE_SANS_SOLDE: 'Congé sans solde',
  RTT: 'RTT',
  MALADIE: 'Arrêt maladie',
  MALADIE_PROFESSIONNELLE: 'Maladie professionnelle',
  ACCIDENT_TRAVAIL: 'Accident de travail',
  MATERNITE: 'Congé maternité',
  PATERNITE: 'Congé paternité',
  FORMATION: 'Formation',
  ABSENCE_JUSTIFIEE: 'Absence justifiée',
  ABSENCE_INJUSTIFIEE: 'Absence injustifiée',
  CONGE_EXCEPTIONNEL: 'Congé exceptionnel',
  TELETRAVAIL: 'Télétravail',
  OTHER: 'Autre'
};

export const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Rejetée',
  CANCELLED: 'Annulée'
};
