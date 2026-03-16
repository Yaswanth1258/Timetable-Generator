import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import TimetableViewer from '../components/TimetableViewer';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [timetables, setTimetables] = useState([]);
    const [timetableId, setTimetableId] = useState('');

    useEffect(() => {
        const fetchTimetables = async () => {
            try {
                const { data } = await api.get('/timetable');
                let published = data.filter(t => t.status === 'PUBLISHED');
                setTimetables(published);
                if (published.length > 0) {
                    setTimetableId(published[0]._id);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchTimetables();
    }, []);

    // Get unique departments and semesters for the filters
    const uniqueDepartments = Array.from(new Set(timetables.map(t => t.department?._id))).map(id => {
        return timetables.find(t => t.department?._id === id)?.department;
    }).filter(Boolean);

    const selectedDepartment = timetables.find(t => t._id === timetableId)?.department?._id;
    const availableSemesters = Array.from(new Set(timetables.filter(t => t.department?._id === selectedDepartment).map(t => t.semester)));

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Student Timetable</h1>
                        <p className="mt-2 text-sm text-slate-600">View classes by selecting your department and semester.</p>
                    </div>
                    {timetables.length > 0 && (
                        <div className="flex gap-4">
                            <div className="w-48">
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Department</label>
                                <select
                                    value={selectedDepartment || ''}
                                    onChange={e => {
                                        const firstTt = timetables.find(t => t.department?._id === e.target.value);
                                        if (firstTt) setTimetableId(firstTt._id);
                                    }}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                >
                                    {uniqueDepartments.map(dept => (
                                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Semester</label>
                                <select
                                    value={timetables.find(t => t._id === timetableId)?.semester || ''}
                                    onChange={e => {
                                        const tt = timetables.find(t => t.department?._id === selectedDepartment && String(t.semester) === e.target.value);
                                        if (tt) setTimetableId(tt._id);
                                    }}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                >
                                    {availableSemesters.map(sem => (
                                        <option key={sem} value={sem}>Sem {sem}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </header>

                <div>
                    {timetableId ? (
                        <TimetableViewer timetableId={timetableId} />
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-12 text-center text-slate-500">
                            No published timetables available for your department yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
