export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePhoto?: string;
  role: UserRole;
  active: boolean;
  fullName: string;
}

export type UserRole = 'WORKER' | 'SUPERVISOR' | 'EMPLOYER' | 'ADMIN' | 'HR';

export interface Employee {
  id: number;
  user: User;
  employeeCode: string;
  hireDate?: string;
  contractEndDate?: string;
  contractType?: ContractType;
  skills: string[];
  certifications: string[];
  safetyTrainingCompleted: boolean;
  lastSafetyTrainingDate?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentAddress?: string;
  totalPoints: number;
  monthlyPoints: number;
  averageCompletionTime?: number;
  successRate?: number;
  totalMissionsCompleted?: number;
  totalDistanceTraveled?: number;
  supervisorId?: number;
  supervisorName?: string;
  
  // Convenience properties (from user or computed)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  status?: string;
  completedMissions?: number;
  leaderboardRank?: number;
  avgRating?: number;
}

export type ContractType = 'CDI' | 'CDD' | 'INTERIM' | 'APPRENTICE' | 'STAGE';

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
  employee?: Employee;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}
