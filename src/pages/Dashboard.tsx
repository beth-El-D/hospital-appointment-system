import React, { useState } from 'react';
import { Plus, Calendar, Users, Clock, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import SearchBar from '@/components/Appointments/SearchBar';
import AppointmentCard from '@/components/Appointments/AppointmentCard';
import AppointmentModal from '@/components/Appointments/AppointmentModal';
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '@/types';

const Dashboard: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        appointments,
        isLoading,
        error,
        totalCount,
        createAppointment,
        updateAppointment,
        deleteAppointment,
        updateFilters,
    } = useAppointments();

    const handleCreateAppointment = () => {
        setEditingAppointment(undefined);
        setIsModalOpen(true);
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleDeleteAppointment = async (id: string) => {
        try {
            await deleteAppointment(id);
        } catch (error) {
            console.error('Failed to delete appointment:', error);
        }
    };

    const handleModalSubmit = async (data: CreateAppointmentRequest | UpdateAppointmentRequest) => {
        setIsSubmitting(true);
        try {
            if ('id' in data) {
                // Update existing appointment
                await updateAppointment(data as UpdateAppointmentRequest);
            } else {
                // Create new appointment
                await createAppointment(data as CreateAppointmentRequest);
            }
        } catch (error) {
            console.error('Failed to save appointment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAppointment(undefined);
    };

    // Calculate statistics
    const stats = {
        total: appointments.length,
        scheduled: appointments.filter(apt => apt.status === 'Scheduled').length,
        completed: appointments.filter(apt => apt.status === 'Completed').length,
        urgent: appointments.filter(apt => apt.priority === 'Urgent').length,
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Appointment Dashboard</h1>
                        <p className="text-slate-600">Manage hospital appointments and patient schedules</p>
                    </div>
                    <button
                        onClick={handleCreateAppointment}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Appointment</span>
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Total Appointments</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg">
                                <Clock className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Scheduled</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.scheduled}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Completed</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Urgent</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.urgent}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <SearchBar onFiltersChange={updateFilters} />

                {/* Appointments List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-slate-600">Loading appointments...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                            <p className="text-red-800 font-medium">Error loading appointments</p>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No appointments found</h3>
                            <p className="text-slate-600 mb-4">
                                Get started by creating your first appointment or adjust your search filters.
                            </p>
                            <button
                                onClick={handleCreateAppointment}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create First Appointment</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {appointments.map((appointment) => (
                                <AppointmentCard
                                    key={appointment.id}
                                    appointment={appointment}
                                    onEdit={handleEditAppointment}
                                    onDelete={handleDeleteAppointment}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Results Summary */}
                {!isLoading && appointments.length > 0 && (
                    <div className="text-center text-sm text-slate-600">
                        Showing {appointments.length} of {totalCount} appointments
                    </div>
                )}
            </div>

            {/* Appointment Modal */}
            <AppointmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                appointment={editingAppointment}
                isLoading={isSubmitting}
            />
        </Layout>
    );
};

export default Dashboard;