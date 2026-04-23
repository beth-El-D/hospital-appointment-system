import { useState, useEffect, useCallback } from 'react';
import {
    Appointment,
    CreateAppointmentRequest,
    UpdateAppointmentRequest,
    AppointmentFilters,
    PaginatedResponse,
} from '@/types';
import { apiService } from '@/services/apiService';

export const useAppointments = (initialFilters?: AppointmentFilters) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState<AppointmentFilters>(initialFilters || {});

    const fetchAppointments = useCallback(async (currentFilters?: AppointmentFilters) => {
        setIsLoading(true);
        setError(null);

        try {
            const response: PaginatedResponse<Appointment> = await apiService.getAppointments(
                currentFilters || filters
            );
            setAppointments(response.data);
            setTotalCount(response.totalCount);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const createAppointment = async (appointmentData: CreateAppointmentRequest): Promise<Appointment> => {
        const newAppointment = await apiService.createAppointment(appointmentData);
        await fetchAppointments(); // Refresh the list
        return newAppointment;
    };

    const updateAppointment = async (appointmentData: UpdateAppointmentRequest): Promise<Appointment> => {
        const updatedAppointment = await apiService.updateAppointment(appointmentData);
        await fetchAppointments(); // Refresh the list
        return updatedAppointment;
    };

    const deleteAppointment = async (id: string): Promise<void> => {
        await apiService.deleteAppointment(id);
        await fetchAppointments(); // Refresh the list
    };

    const updateFilters = (newFilters: AppointmentFilters) => {
        setFilters(newFilters);
        fetchAppointments(newFilters);
    };

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return {
        appointments,
        isLoading,
        error,
        totalCount,
        filters,
        fetchAppointments,
        createAppointment,
        updateAppointment,
        deleteAppointment,
        updateFilters,
    };
};