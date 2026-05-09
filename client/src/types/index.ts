// User and Auth Types
export type UserRole = "patient" | "doctor" | "labstaff" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  profile?: any; // Generic profile info
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
  tokenExp: number;
}

// Patient Types
export interface Patient {
  _id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
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
}

// Doctor Types
export interface OPDTiming {
  day: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
}

export interface Doctor {
  _id: string;
  userId: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  phone: string;
  email: string;
  opdTimings: OPDTiming[];
  consultationFee: number;
  status: "active" | "inactive" | "on-leave";
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSlots {
  day: string;
  slots: string[];
  bookedSlots: string[];
}

export interface CreateDoctorRequest {
  email: string;
  password?: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  phone: string;
  opdTimings: OPDTiming[];
  consultationFee: number;
  status?: "active" | "inactive" | "on-leave";
}

// Appointment Types
export type AppointmentStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface Appointment {
  _id: string;
  patientId: Patient | string;
  doctorId: Doctor | string;
  date: string;
  slot: string;
  tokenNumber: number;
  status: AppointmentStatus;
  symptoms?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  date: string;
  slot: string;
  symptoms?: string;
}

// Medical Record Types
export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabTestRequest {
  _id?: string;
  testName: string;
  status: "requested" | "sample-collected" | "in-progress" | "completed";
  requestedAt: string;
  completedAt?: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  temperature?: string;
  pulse?: string;
  weight?: string;
  height?: string;
}

export interface MedicalRecord {
  _id: string;
  appointmentId: string | Appointment;
  patientId: string | Patient;
  doctorId: string | Doctor;
  symptoms: string[];
  diagnosis: string;
  notes?: string;
  prescriptions: PrescriptionItem[];
  labTestsRequested: LabTestRequest[];
  vitalSigns?: VitalSigns;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordRequest {
  appointmentId: string;
  symptoms: string[];
  diagnosis: string;
  notes?: string;
  prescriptions?: PrescriptionItem[];
  labTestsRequested?: { testName: string }[];
  vitalSigns?: VitalSigns;
  followUpDate?: string;
}

// Lab Report Types
export interface LabReport {
  _id: string;
  appointmentId: string;
  patientId: string;
  medicalRecordId: string;
  testName: string;
  testDate: string;
  reportFile: string;
  result?: string;
  normalRange?: string;
  remarks?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Dashboard Stats
export interface DoctorStats {
  total: number;
  pending: number;
  completed: number;
  inProgress: number;
}

// Pending Lab Test (from aggregation)
export interface PendingLabTest {
  _id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  labTest: LabTestRequest;
  createdAt: string;
}
