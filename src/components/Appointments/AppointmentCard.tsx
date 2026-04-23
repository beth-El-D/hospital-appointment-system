import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Appointment } from '@/types';

interface AppointmentCardProps {
    appointment: Appointment;
    onEdit: (appointment: Appointment) => void;
    onDelete: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    onEdit,
    onDelete,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'High':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-emerald-100 text-emerald-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            case 'NoShow':
                return 'bg-slate-100 text-slate-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const handleDelete = () => {
        onDelete(appointment.id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {appointment.patientName}
                        </h3>
                        <p className="text-sm text-slate-600">Dr. {appointment.doctorName}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(appointment.priority)}`}>
                        {appointment.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                    </span>
                </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(appointment.appointmentTime)}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{appointment.patientPhone}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span>{appointment.patientEmail}</span>
                </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600">{appointment.notes}</p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-400">
                    Created: {new Date(appointment.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onEdit(appointment)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                    </button>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentCard;