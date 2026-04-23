import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { AppointmentFilters } from '@/types';

interface SearchBarProps {
    onFiltersChange: (filters: AppointmentFilters) => void;
    initialFilters?: AppointmentFilters;
}

const SearchBar: React.FC<SearchBarProps> = ({ onFiltersChange, initialFilters = {} }) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filters, setFilters] = useState<AppointmentFilters>(initialFilters);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            const newFilters = {
                ...filters,
                search: searchTerm.trim() || undefined,
            };
            setFilters(newFilters);
            onFiltersChange(newFilters);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleFilterChange = (key: keyof AppointmentFilters, value: string) => {
        const newFilters = {
            ...filters,
            [key]: value || undefined,
        };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        setSearchTerm('');
        const clearedFilters: AppointmentFilters = {};
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
        setShowAdvancedFilters(false);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
            {/* Main Search Bar */}
            <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Search by patient name, doctor, or email..."
                    />
                </div>

                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${showAdvancedFilters || hasActiveFilters
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                        <span>Clear</span>
                    </button>
                )}
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Doctor Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Doctor
                            </label>
                            <input
                                type="text"
                                value={filters.doctorName || ''}
                                onChange={(e) => handleFilterChange('doctorName', e.target.value)}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Dr. Ayele"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="NoShow">No Show</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Priority
                            </label>
                            <select
                                value={filters.priority || ''}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom || ''}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {Object.entries(filters).map(([key, value]) => {
                                if (!value) return null;
                                return (
                                    <span
                                        key={key}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                    >
                                        {key}: {value}
                                        <button
                                            onClick={() => handleFilterChange(key as keyof AppointmentFilters, '')}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;