import { Types } from "mongoose";
import { Request } from "express";

// User Roles
export type UserRole = "patient" | "doctor" | "labstaff" | "admin";

// Appointment Status
export type AppointmentStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled";

// Lab Test Status
export type LabTestStatus =
  | "requested"
  | "sample-collected"
  | "in-progress"
  | "completed";

// Doctor Status
export type DoctorStatus = "active" | "inactive" | "on-leave";

// User Interface
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Patient Interface
export interface IPatient {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  address: string;
  bloodGroup?: string;
  medicalHistory?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Doctor Interface
export interface IDoctor {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  phone: string;
  email: string;
  opdTimings: {
    day: string;
    startTime: string;
    endTime: string;
    maxPatients: number;
  }[];
  consultationFee: number;
  status: DoctorStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment Interface
export interface IAppointment {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  date: Date;
  slot: string;
  tokenNumber: number;
  status: AppointmentStatus;
  symptoms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Prescription Item
export interface IPrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Lab Test Request
export interface ILabTestRequest {
  testName: string;
  status: LabTestStatus;
  requestedAt: Date;
  completedAt?: Date;
}

// Medical Record Interface
export interface IMedicalRecord {
  _id: Types.ObjectId;
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  symptoms: string[];
  diagnosis: string;
  notes?: string;
  prescriptions: IPrescriptionItem[];
  labTestsRequested: ILabTestRequest[];
  vitalSigns?: {
    bloodPressure?: string;
    temperature?: string;
    pulse?: string;
    weight?: string;
    height?: string;
  };
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Lab Report Interface
export interface ILabReport {
  _id: Types.ObjectId;
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  medicalRecordId: Types.ObjectId;
  testName: string;
  testDate: Date;
  reportFile: string;
  result?: string;
  normalRange?: string;
  remarks?: string;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth Types
export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Request with User
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
