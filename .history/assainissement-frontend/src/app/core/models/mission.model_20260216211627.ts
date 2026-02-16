export interface Mission {
  id: number;
  title: string;
  description?: string;
  type: MissionType;
  status: MissionStatus;
  priority: MissionPriority;
  
  // Client info
  clientId?: number;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  
  // Location
  address: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  zone?: string;
  
  // Timing
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  scheduledDate?: string; // Convenience alias
  estimatedDurationMinutes?: number;
  estimatedDuration?: number; // Convenience alias
  actualStartTime?: string;
  actualEndTime?: string;
  actualDurationMinutes?: number;
  deadline?: string;
  slaBreached: boolean;
  
  // Assignment
  assignedToId?: number;
  assignedToName?: string;
  assignedEmployeeId?: number; // Convenience alias
  assignedEmployeeName?: string; // Convenience alias
  createdById?: number;
  createdByName?: string;
  employeeName?: string; // For display
  
  // Timestamps
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  approvedAt?: string;
  approvedByName?: string;
  
  // Checklist
  checklist: MissionChecklist[];
  
  // Photos
  photos: Photo[];
  beforePhotosCount: number;
  afterPhotosCount: number;
  
  // Instructions
  safetyInstructions?: string;
  requiredEquipment: string[];
  
  // AI Validation
  aiConfidenceScore?: number;
  aiValidationNotes?: string;
  aiApproved: boolean;
  
  // Supervisor
  supervisorNotes?: string;
  
  // Points
  pointsAwarded?: number;
  basePoints?: number;
  bonusPoints?: number;
  
  // Photo requirements
  requiresBeforePhoto?: boolean;
  requiresAfterPhoto?: boolean;
  requiresSignature?: boolean;
  
  // Rejection
  rejectionReason?: string;
  rejectionCount?: number;
  
  createdAt?: string;
}

export interface MissionChecklist {
  id: number;
  item: string;
  description?: string;
  completed: boolean;
  mandatory: boolean;
  orderIndex?: number;
}

export interface Photo {
  id: number;
  missionId: number;
  fileName: string;
  filePath: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  type: PhotoType;
  latitude?: number;
  longitude?: number;
  capturedAddress?: string;
  capturedAt: string;
  deviceId?: string;
  fromGallery: boolean;
  aiQualityScore?: number;
  aiAnalysisNotes?: string;
  aiDetectedFraud: boolean;
  validated: boolean;
  createdAt?: string;
  description?: string; // For display
}

export type MissionType = 
  | 'CURAGE'
  | 'VIDANGE_FOSSE'
  | 'VIDANGE_BAC'
  | 'INSPECTION_CAMERA'
  | 'INSPECTION_REGARD'
  | 'INSPECTION_RESEAU'
  | 'URGENCE_BOUCHAGE'
  | 'URGENCE_DEBORDEMENT'
  | 'MAINTENANCE_PREVENTIVE'
  | 'DEBOUCHAGE'
  | 'POMPAGE'
  | 'HYDROCURAGE'
  | 'DIAGNOSTIC'
  | 'OTHER';

export type MissionStatus = 
  | 'CREATED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ON_SITE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PENDING'
  | 'PENDING_REVIEW'
  | 'PENDING_VALIDATION'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ON_HOLD';

export type MissionPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY';

export type PhotoType = 'BEFORE' | 'AFTER' | 'DURING' | 'EQUIPMENT' | 'SAFETY' | 'SIGNATURE' | 'OTHER';

export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  CURAGE: 'Curage et nettoyage',
  VIDANGE_FOSSE: 'Vidange fosse septique',
  VIDANGE_BAC: 'Vidange bac à graisse',
  INSPECTION_CAMERA: 'Inspection caméra',
  INSPECTION_REGARD: 'Inspection regards',
  INSPECTION_RESEAU: 'Inspection réseaux',
  URGENCE_BOUCHAGE: 'Urgence - Bouchage',
  URGENCE_DEBORDEMENT: 'Urgence - Débordement',
  MAINTENANCE_PREVENTIVE: 'Maintenance préventive',
  DEBOUCHAGE: 'Débouchage',
  POMPAGE: 'Pompage',
  HYDROCURAGE: 'Hydrocurage',
  DIAGNOSTIC: 'Diagnostic',
  OTHER: 'Autre'
};

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  CREATED: 'Créée',
  ASSIGNED: 'Assignée',
  ACCEPTED: 'Acceptée',
  ON_THE_WAY: 'En route',
  ON_SITE: 'Sur site',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  PENDING: 'En attente',
  PENDING_REVIEW: 'En validation',
  PENDING_VALIDATION: 'En validation',
  AWAITING_APPROVAL: "En attente d'approbation",
  APPROVED: 'Approuvée',
  REJECTED: 'Rejetée',
  CANCELLED: 'Annulée',
  ON_HOLD: 'En pause'
};

export const MISSION_PRIORITY_LABELS: Record<MissionPriority, string> = {
  LOW: 'Basse',
  NORMAL: 'Normale',
  HIGH: 'Haute',
  URGENT: 'Urgente',
  EMERGENCY: 'Urgence absolue'
};
