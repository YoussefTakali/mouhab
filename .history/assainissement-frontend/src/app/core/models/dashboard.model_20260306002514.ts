export interface DashboardStats {
  totalMissions: number;
  completedMissions: number;
  pendingMissions: number;
  urgentMissions: number;
  overdueMissions: number;
  completionRate: number;
  
  // Additional properties used by dashboard components
  missionsCompletedThisMonth?: number;
  inProgressMissions?: number;
  totalPoints?: number;
  leaderboardPosition?: number;
  
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
  // Additional properties for leaderboard display
  title?: string;
  avgRating?: number;
  trendDirection?: 'up' | 'down' | 'stable';
  positionsChanged?: number;
}

export const POINT_TRANSACTION_TYPE_LABELS: Record<PointTransactionType, string> = {
  ON_TIME_ARRIVAL: 'Arrivée à l\'heure',
  TASK_COMPLETED: 'Tâche complétée',
  HIGH_AI_QUALITY_SCORE: 'Score qualité IA élevé',
  EMERGENCY_INTERVENTION: 'Intervention urgence',
  CLIENT_POSITIVE_FEEDBACK: 'Retour client positif',
  ZERO_REWORK: 'Zéro reprise',
  PERFECT_WEEK: 'Semaine parfaite',
  TRAINING_COMPLETED: 'Formation terminée',
  MENTOR_BONUS: 'Bonus mentorat',
  UNJUSTIFIED_ABSENCE: 'Absence injustifiée',
  LATE_ARRIVAL: 'Retard',
  POOR_QUALITY_WORK: 'Travail de mauvaise qualité',
  MISSING_PHOTOS: 'Photos manquantes',
  TASK_REJECTED: 'Tâche rejetée',
  SAFETY_VIOLATION: 'Violation sécurité',
  CLIENT_COMPLAINT: 'Plainte client',
  SLA_BREACH: 'Violation SLA',
  MANUAL_ADJUSTMENT: 'Ajustement manuel'
};

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

// Salary Advance interfaces
export interface SalaryAdvance {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  requestedDate: string;
  reason?: string;
  status: SalaryAdvanceStatus;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  paidDate?: string;
  createdAt: string;
}

export type SalaryAdvanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export const SALARY_ADVANCE_STATUS_LABELS: Record<SalaryAdvanceStatus, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Rejetée',
  PAID: 'Payée'
};
