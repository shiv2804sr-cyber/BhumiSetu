// src/types.ts

export interface KPI {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  change?: string | number;
  trend?: "up" | "down" | "neutral";
  description?: string;
  icon?: string;
  color?: string;
  [key: string]: any;
}

export interface Alert {
  id: string;
  title: string;
  message?: string;
  description?: string;
  type?: string;
  severity?: "low" | "medium" | "high" | "critical" | string;
  status?: string;
  read?: boolean;
  createdAt?: string;
  date?: string;
  time?: string;
  [key: string]: any;
}

export interface CompensationRecord {
  id: string;
  projectId?: string;
  projectName?: string;
  landParcelId?: string;
  landownerName?: string;
  ownerName?: string;
  amount?: number;
  compensationAmount?: number;
  status?: string;
  paymentStatus?: string;
  paymentDate?: string;
  dueDate?: string;
  village?: string;
  district?: string;
  state?: string;
  [key: string]: any;
}

export interface DocumentRecord {
  id: string;
  name?: string;
  documentName?: string;
  type?: string;
  category?: string;
  status?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  projectId?: string;
  projectName?: string;
  [key: string]: any;
}

export interface GrievanceRecord {
  id: string;
  title?: string;
  subject?: string;
  description?: string;
  category?: string;
  status?: string;
  priority?: string;
  complainantName?: string;
  applicantName?: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  projectId?: string;
  projectName?: string;
  district?: string;
  state?: string;
  [key: string]: any;
}

export interface Proposal {
  id: string;
  title?: string;
  name?: string;
  projectName?: string;
  projectId?: string;
  description?: string;
  status?: string;
  priority?: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  amount?: number;
  estimatedCost?: number;
  district?: string;
  state?: string;
  [key: string]: any;
}

export interface ReportRecord {
  id: string;
  name?: string;
  title?: string;
  type?: string;
  category?: string;
  status?: string;
  generatedBy?: string;
  generatedAt?: string;
  createdAt?: string;
  projectId?: string;
  projectName?: string;
  [key: string]: any;
}

export interface RnRRecord {
  id: string;
  projectId?: string;
  projectName?: string;
  landownerName?: string;
  beneficiaryName?: string;
  village?: string;
  district?: string;
  state?: string;
  packageAmount?: number;
  amount?: number;
  status?: string;
  settlementStatus?: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}