import api from "./api";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Patient,
  CreatePatientRequest,
  Doctor,
  DoctorSlots,
  Appointment,
  CreateAppointmentRequest,
  MedicalRecord,
  CreateMedicalRecordRequest,
  CreateDoctorRequest,
  LabReport,
  DoctorStats,
  PendingLabTest,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

// Auth API
export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },
  getUsersByRole: async (role?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (role) params.append("role", role);
    const response = await api.get<PaginatedResponse<User>>(
      `/auth/users?${params}`
    );
    return response.data;
  },
};

// Patient API
export const patientApi = {
  createProfile: async (data: CreatePatientRequest) => {
    const response = await api.post<ApiResponse<Patient>>(
      "/patients/profile",
      data
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<Patient>>("/patients/profile");
    return response.data;
  },

  updateProfile: async (data: Partial<CreatePatientRequest>) => {
    const response = await api.put<ApiResponse<Patient>>(
      "/patients/profile",
      data
    );
    return response.data;
  },

  getPatientById: async (id: string) => {
    const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data;
  },

  getAllPatients: async (page = 1, limit = 10, search?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append("search", search);
    const response = await api.get<PaginatedResponse<Patient>>(
      `/patients?${params}`
    );
    return response.data;
  },
};

// Doctor API
export const doctorApi = {
  getAllDoctors: async (page = 1, limit = 10, specialization?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (specialization) params.append("specialization", specialization);
    const response = await api.get<PaginatedResponse<Doctor>>(
      `/doctors?${params}`
    );
    return response.data;
  },

  getDoctorById: async (id: string) => {
    const response = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return response.data;
  },

  getAvailableSlots: async (doctorId: string, date: string) => {
    const response = await api.get<ApiResponse<DoctorSlots>>(
      `/doctors/${doctorId}/slots?date=${date}`
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<Doctor>>("/doctors/me/profile");
    return response.data;
  },
  create: async (data: CreateDoctorRequest) => {
    const response = await api.post<
      ApiResponse<{ doctor: Doctor; userId: string }>
    >("/doctors", data);
    return response.data;
  },
};

// Appointment API
export const appointmentApi = {
  create: async (data: CreateAppointmentRequest) => {
    const response = await api.post<ApiResponse<Appointment>>(
      "/appointments",
      data
    );
    return response.data;
  },

  getMyAppointments: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.append("status", status);
    const response = await api.get<PaginatedResponse<Appointment>>(
      `/appointments/my?${params}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Appointment>>(
      `/appointments/${id}`
    );
    return response.data;
  },

  getDoctorQueue: async (date?: string) => {
    const params = date ? `?date=${date}` : "";
    const response = await api.get<ApiResponse<Appointment[]>>(
      `/appointments/queue${params}`
    );
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<ApiResponse<DoctorStats>>(
      "/appointments/stats"
    );
    return response.data;
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    const response = await api.patch<ApiResponse<Appointment>>(
      `/appointments/${id}/status`,
      { status, notes }
    );
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.delete<ApiResponse<Appointment>>(
      `/appointments/${id}`
    );
    return response.data;
  },
};

// Medical Record API
export const medicalRecordApi = {
  create: async (data: CreateMedicalRecordRequest) => {
    const response = await api.post<ApiResponse<MedicalRecord>>(
      "/medical-records",
      data
    );
    return response.data;
  },

  getByAppointment: async (appointmentId: string) => {
    const response = await api.get<ApiResponse<MedicalRecord>>(
      `/medical-records/appointment/${appointmentId}`
    );
    return response.data;
  },

  getMyRecords: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<MedicalRecord>>(
      `/medical-records/my?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  update: async (id: string, data: Partial<CreateMedicalRecordRequest>) => {
    const response = await api.put<ApiResponse<MedicalRecord>>(
      `/medical-records/${id}`,
      data
    );
    return response.data;
  },

  getPendingLabTests: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<PendingLabTest>>(
      `/medical-records/pending-tests?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  updateLabTestStatus: async (
    recordId: string,
    testId: string,
    status: string
  ) => {
    const response = await api.patch<ApiResponse<MedicalRecord>>(
      `/medical-records/${recordId}/tests/${testId}/status`,
      { status }
    );
    return response.data;
  },

  uploadLabReport: async (
    recordId: string,
    testId: string,
    formData: FormData
  ) => {
    const response = await api.post<ApiResponse<LabReport>>(
      `/medical-records/${recordId}/tests/${testId}/report`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  getMyLabReports: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<LabReport>>(
      `/medical-records/my/lab-reports?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
