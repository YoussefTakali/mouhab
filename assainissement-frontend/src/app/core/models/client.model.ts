export interface Client {
  id: number;
  name: string;
  type: ClientType;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  siret?: string;
  vatNumber?: string;
  billingAddress?: string;
  hasContract: boolean;
  contractStartDate?: string;
  contractEndDate?: string;
  notes?: string;
  active: boolean;

  // Stats
  totalMissions: number;
  completedMissions: number;
  inProgressMissions: number;
  totalPaid: number;
  totalDue: number;
  balance: number;

  createdAt?: string;
  updatedAt?: string;
}

export type ClientType = 'PARTICULIER' | 'ENTREPRISE' | 'MUNICIPALITE' | 'SYNDIC' | 'COLLECTIVITE' | 'ADMINISTRATION' | 'OTHER';

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  PARTICULIER: 'Particulier',
  ENTREPRISE: 'Entreprise',
  MUNICIPALITE: 'Municipalité',
  SYNDIC: 'Syndic',
  COLLECTIVITE: 'Collectivité',
  ADMINISTRATION: 'Administration',
  OTHER: 'Autre'
};

export interface Payment {
  id: number;
  clientId: number;
  clientName?: string;
  missionId?: number;
  missionTitle?: string;
  amount: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  reference?: string;
  invoiceNumber?: string;
  notes?: string;
  paymentDate?: string;
  dueDate?: string;
  createdAt?: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  PARTIAL: 'Partiel',
  OVERDUE: 'En retard',
  CANCELLED: 'Annulé',
  REFUNDED: 'Remboursé'
};

export type PaymentMethod = 'CASH' | 'CHECK' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Espèces',
  CHECK: 'Chèque',
  BANK_TRANSFER: 'Virement',
  CARD: 'Carte',
  OTHER: 'Autre'
};
