import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TimetableViewer from '../components/TimetableViewer';

const AdminViewTimetable = () => {
    const [timetables, setTimetables] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [ttRes, deptRes] = await Promise.all([
                    api.get('/timetable'),
                    api.get('/admin/departments')
                ]);
                setTimetables(ttRes.data || []);
                setDepartments(deptRes.data || []);
                setError('');
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError('Failed to load timetables and departments');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter timetables based on department selection
    const filteredTimetables = timetables.filter(tt => {
        if (selectedDepartment) {
            const deptId = typeof tt.department === 'object' ? tt.department?._id : tt.department;
            return deptId === selectedDepartment;
        }
        return true;
    });

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto pb-12 my-20">
                <div className="text-center text-slate-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-1">View Timetable</h1>
                <p className="text-sm text-slate-500">View and publish generated timetables</p>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">Department (Optional)</label>
                        <select
                            value={selectedDepartment}
                            onChange={e => {
                                setSelectedDepartment(e.target.value);
                                setSelectedVersion(''); // reset version on filter change
                            }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                            <option value="">All departments</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">Timetable Version</label>
                        <select
                            value={selectedVersion}
                            onChange={e => setSelectedVersion(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                            <option value="">Select version</option>
                            {filteredTimetables.map(tt => {
                                const deptName = typeof tt.department === 'object' ? tt.department?.name : 'Department';
                                return (
                                    <option key={tt._id} value={tt._id}>
                                        {tt.semester} - {deptName} ({tt.status})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>

            {selectedVersion ? (
                <TimetableViewer timetableId={selectedVersion} />
            ) : (
                <div className="py-20 text-center text-slate-400 font-medium">
                    {filteredTimetables.length === 0 
                        ? 'No timetables available for the selected department'
                        : 'Select a timetable version to view'}
                </div>
            )}
        </div>
    );
};

export default AdminViewTimetable;
