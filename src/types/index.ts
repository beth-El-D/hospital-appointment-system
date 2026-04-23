// Core data types matching your simplified database tables

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'Admin' | 'Doctor' | 'Receptionist';
    createdAt: string;
}

export interface Appointment {
    id: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';
    notes?: string;
    createdAt: string;
}

export interface CreateAppointmentRequest {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';
    notes?: string;
}

export interface UpdateAppointmentRequest extends CreateAppointmentRequest {
    id: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';
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
    role: 'Admin' | 'Doctor' | 'Receptionist';
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface AppointmentFilters {
    search?: string;
    doctorName?: string;
    status?: string;
    priority?: string;
    dateFrom?: string;
    dateTo?: string;
}