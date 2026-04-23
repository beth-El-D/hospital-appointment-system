import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import {
    Appointment,
    CreateAppointmentRequest,
    UpdateAppointmentRequest,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ApiResponse,
    PaginatedResponse,
    AppointmentFilters,
} from '@/types';

// API Configuration - Update this URL to match your ASP.NET Core backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5086/api';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Important for CORS with credentials
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Authentication endpoints - These will connect to your ASP.NET Core Identity endpoints
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post(
                '/auth/login',
                credentials
            );

            if (response.data.success && response.data.data) {
                localStorage.setItem('authToken', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                return response.data.data;
            }

            throw new Error(response.data.message || 'Login failed');
        } catch (error) {
            toast.error('Login failed. Please check your credentials.');
            throw error;
        }
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post(
                '/auth/register',
                userData
            );

            if (response.data.success) {
                // Registration successful - backend returns success message but no user data
                // Return a dummy AuthResponse since we don't get user data from registration
                return {
                    user: {
                        id: '',
                        email: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        role: userData.role,
                        createdAt: new Date().toISOString()
                    },
                    token: '',
                    refreshToken: ''
                };
            }

            throw new Error(response.data.message || 'Registration failed');
        } catch (error: any) {
            // Only show error toast for actual failures, not for successful registrations
            if (error.response?.data?.success === false) {
                toast.error(error.response.data.message || 'Registration failed. Please try again.');
            } else if (!error.response) {
                toast.error('Registration failed. Please try again.');
            }
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            await this.api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    }

    // Get doctors for appointment form
    async getDoctors(): Promise<{ id: string; name: string; email: string }[]> {
        try {
            const response: AxiosResponse<ApiResponse<{ id: string; name: string; email: string }[]>> =
                await this.api.get('/auth/doctors');

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to fetch doctors');
        } catch (error) {
            console.error('Failed to load doctors:', error);
            return [];
        }
    }

    // Appointment CRUD operations - These connect to your ASP.NET Core Web API endpoints
    async getAppointments(filters?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> {
        try {
            const params = new URLSearchParams();

            if (filters?.search) params.append('search', filters.search);
            if (filters?.doctorName) params.append('doctorName', filters.doctorName);
            if (filters?.status) params.append('status', filters.status);
            if (filters?.priority) params.append('priority', filters.priority);
            if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters?.dateTo) params.append('dateTo', filters.dateTo);

            const response: AxiosResponse<ApiResponse<PaginatedResponse<Appointment>>> =
                await this.api.get(`/appointments?${params.toString()}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to fetch appointments');
        } catch (error) {
            toast.error('Failed to load appointments');
            throw error;
        }
    }

    async getAppointmentById(id: string): Promise<Appointment> {
        try {
            const response: AxiosResponse<ApiResponse<Appointment>> =
                await this.api.get(`/appointments/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Appointment not found');
        } catch (error) {
            toast.error('Failed to load appointment details');
            throw error;
        }
    }

    async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
        try {
            const response: AxiosResponse<ApiResponse<Appointment>> =
                await this.api.post('/appointments', appointmentData);

            if (response.data.success && response.data.data) {
                toast.success('Appointment created successfully!');
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to create appointment');
        } catch (error) {
            toast.error('Failed to create appointment');
            throw error;
        }
    }

    async updateAppointment(appointmentData: UpdateAppointmentRequest): Promise<Appointment> {
        try {
            const response: AxiosResponse<ApiResponse<Appointment>> =
                await this.api.put(`/appointments/${appointmentData.id}`, appointmentData);

            if (response.data.success && response.data.data) {
                toast.success('Appointment updated successfully!');
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to update appointment');
        } catch (error) {
            toast.error('Failed to update appointment');
            throw error;
        }
    }

    async deleteAppointment(id: string): Promise<void> {
        try {
            const response: AxiosResponse<ApiResponse<null>> =
                await this.api.delete(`/appointments/${id}`);

            if (response.data.success) {
                toast.success('Appointment deleted successfully!');
                return;
            }

            throw new Error(response.data.message || 'Failed to delete appointment');
        } catch (error) {
            toast.error('Failed to delete appointment');
            throw error;
        }
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;