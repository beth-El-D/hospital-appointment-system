import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, User, Phone, Mail, AlertCircle, ChevronDown } from 'lucide-react';
import { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '@/types';
import { apiService } from '@/services/apiService';

const appointmentSchema = z.object({
    patientName: z.string().min(2, 'Patient name must be at least 2 characters'),
    patientEmail: z.string().email('Please enter a valid email address'),
    patientPhone: z.string().min(10, 'Please enter a valid phone number'),
    doctorName: z.string().min(2, 'Doctor name must be at least 2 characters'),
    appointmentDate: z.string().refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
    }, 'Appointment date cannot be in the past'),
    appointmentTime: z.string().min(1, 'Please select an appointment time'),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
        required_error: 'Please select a priority level',
    }),
    status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'NoShow']).optional(),
    notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateAppointmentRequest | UpdateAppointmentRequest) => Promise<void>;
    appointment?: Appointment;
    isLoading: boolean;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    appointment,
    isLoading,
}) => {
    const isEditing = !!appointment;
    const [doctors, setDoctors] = useState<{ id: string; name: string; email: string }[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
    });

    // Fetch doctors when component mounts
    useEffect(() => {
        const fetchDoctors = async () => {
            setLoadingDoctors(true);
            try {
                const doctorsList = await apiService.getDoctors();
                setDoctors(doctorsList);
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
            } finally {
                setLoadingDoctors(false);
            }
        };

        if (isOpen) {
            fetchDoctors();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (appointment) {
                // Pre-fill form for editing
                reset({
                    patientName: appointment.patientName,
                    patientEmail: appointment.patientEmail,
                    patientPhone: appointment.patientPhone,
                    doctorName: appointment.doctorName,
                    appointmentDate: appointment.appointmentDate,
                    appointmentTime: appointment.appointmentTime,
                    priority: appointment.priority,
                    status: appointment.status,
                    notes: appointment.notes || '',
                });
            } else {
                // Reset form for creating new appointment
                reset({
                    patientName: '',
                    patientEmail: '',
                    patientPhone: '',
                    doctorName: '',
                    appointmentDate: '',
                    appointmentTime: '',
                    priority: 'Medium',
                    status: 'Scheduled',
                    notes: '',
                });
            }
        }
    }, [isOpen, appointment, reset]);

    const handleFormSubmit = async (data: AppointmentFormData) => {
        try {
            if (isEditing && appointment) {
                const updateRequest: UpdateAppointmentRequest = {
                    id: appointment.id,
                    patientName: data.patientName,
                    patientEmail: data.patientEmail,
                    patientPhone: data.patientPhone,
                    doctorName: data.doctorName,
                    appointmentDate: data.appointmentDate,
                    appointmentTime: data.appointmentTime,
                    priority: data.priority,
                    status: data.status || 'Scheduled',
                    notes: data.notes,
                };
                await onSubmit(updateRequest);
            } else {
                const createRequest: CreateAppointmentRequest = {
                    patientName: data.patientName,
                    patientEmail: data.patientEmail,
                    patientPhone: data.patientPhone,
                    doctorName: data.doctorName,
                    appointmentDate: data.appointmentDate,
                    appointmentTime: data.appointmentTime,
                    priority: data.priority,
                    notes: data.notes,
                };
                await onSubmit(createRequest);
            }
            onClose();
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {isEditing ? 'Edit Appointment' : 'Create New Appointment'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white px-6 py-4">
                        <div className="space-y-4">
                            {/* Patient Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Patient Name *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        {...register('patientName')}
                                        type="text"
                                        autoComplete="off"
                                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter patient name"
                                    />
                                </div>
                                {errors.patientName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.patientName.message}</p>
                                )}
                            </div>

                            {/* Patient Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Patient Email *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        {...register('patientEmail')}
                                        type="email"
                                        autoComplete="off"
                                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="patient@email.com"
                                    />
                                </div>
                                {errors.patientEmail && (
                                    <p className="mt-1 text-sm text-red-600">{errors.patientEmail.message}</p>
                                )}
                            </div>

                            {/* Patient Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Patient Phone *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        {...register('patientPhone')}
                                        type="tel"
                                        autoComplete="off"
                                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="(+251) 900-000-000"
                                    />
                                </div>
                                {errors.patientPhone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.patientPhone.message}</p>
                                )}
                            </div>

                            {/* Doctor Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Doctor Name *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <select
                                        {...register('doctorName')}
                                        className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                        disabled={loadingDoctors}
                                    >
                                        <option value="">
                                            {loadingDoctors ? 'Loading doctors...' : 'Select a doctor'}
                                        </option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.name}>
                                                {doctor.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                                {errors.doctorName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.doctorName.message}</p>
                                )}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Date *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            {...register('appointmentDate')}
                                            type="date"
                                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    {errors.appointmentDate && (
                                        <p className="mt-1 text-sm text-red-600">{errors.appointmentDate.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Time *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            {...register('appointmentTime')}
                                            type="time"
                                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    {errors.appointmentTime && (
                                        <p className="mt-1 text-sm text-red-600">{errors.appointmentTime.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Priority and Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Priority *
                                    </label>
                                    <select
                                        {...register('priority')}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                    {errors.priority && (
                                        <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            {...register('status')}
                                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                            <option value="NoShow">No Show</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Notes
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <AlertCircle className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <textarea
                                        {...register('notes')}
                                        rows={3}
                                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Additional notes ..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Saving...' : isEditing ? 'Update Appointment' : 'Create Appointment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;