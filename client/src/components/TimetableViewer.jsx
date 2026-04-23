import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { Loader2, Calendar, CheckSquare, Edit2, X, Printer, Download, Send } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

const TimetableViewer = ({ timetableId, filterUserFacultyId, enableLiveUpdates = false }) => {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const [allTimeSlots, setAllTimeSlots] = useState([]);

    // Override Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [overrideData, setOverrideData] = useState({ faculty: '', classroom: '' });

    // Override Options
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [classroomOptions, setClassroomOptions] = useState([]);

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!timetableId) return;
            try {
                setLoading(true);
                setError('');
                const { data } = await api.get(`/timetable/${timetableId}`);
                if (!data) {
                    setError('Timetable data not found');
                    return;
                }
                setTimetable(data);
            } catch (err) {
                console.error('Error fetching timetable:', err);
                setError(err.response?.data?.message || 'Failed to load timetable details.');
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, [timetableId]);

    useEffect(() => {
        if (!timetableId) return;

        const fetchLatestTimetable = async () => {
            try {
                const { data } = await api.get(`/timetable/${timetableId}`);
                setTimetable(data);
            } catch (err) {
                console.error('Error refreshing timetable:', err);
            }
        };

        const socket = io(import.meta.env.VITE_API_URL);
        socket.on('timetable_updated', (data) => {
            if (data.timetableId === timetableId) {
                fetchLatestTimetable();
            }
        });

        const handleFocus = () => {
            fetchLatestTimetable();
        };

        window.addEventListener('focus', handleFocus);

        const refreshTimer = window.setInterval(() => {
            fetchLatestTimetable();
        }, 15000);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.clearInterval(refreshTimer);
            socket.disconnect();
        };
    }, [timetableId]);

    useEffect(() => {
        if (!timetableId || user?.role !== 'ADMIN') return;
        api.get('/admin/timeslots')
            .then(res => setAllTimeSlots(res.data))
            .catch(() => {
                // Ignore if not authorized; fall back to timetable-provided slots.
            });
    }, [timetableId, user]);

    const fetchOverrideOptions = async () => {
        try {
            const [facRes, roomRes] = await Promise.all([
                api.get('/admin/faculty'),
                api.get('/admin/classrooms')
            ]);
            setFacultyOptions(facRes.data);
            setClassroomOptions(roomRes.data);
        } catch (err) {
            console.error('Failed to load override options', err);
        }
    };

    const handleOpenEditModal = (entry) => {
        // Allow editing in two scenarios:
        // 1. DRAFT timetables (normal editing)
        // 2. PUBLISHED timetables when enableLiveUpdates is true (for emergency changes)
        const canEditEntry = user?.role === 'ADMIN' && 
            (timetable.status === 'DRAFT' || enableLiveUpdates);
        
        if (!canEditEntry) return;
        
        setEditingEntry(entry);
        setOverrideData({
            faculty: entry.faculty?._id || '',
            classroom: entry.classroom?._id || ''
        });
        setIsEditModalOpen(true);
        if (facultyOptions.length === 0) fetchOverrideOptions();
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingEntry(null);
    };

    const handleSaveOverride = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/timetable/${timetableId}/entries/${editingEntry._id}`, overrideData);

            // Re-fetch timetable to get fully populated data (or we could manually stitch it for speed)
            const refreshRes = await api.get(`/timetable/${timetableId}`);
            setTimetable(refreshRes.data);

            handleCloseEditModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update entry');
        }
    };

    const handlePublish = async () => {
        try {
            await api.put(`/timetable/${timetableId}/publish`);
            setTimetable({ ...timetable, status: 'PUBLISHED' });
            alert('Timetable published successfully!');
        } catch (err) {
            alert('Error publishing timetable');
        }
    };

    const handleExport = () => {
        // Generate CSV data
        let csv = 'Day,Time,Subject,Code,Type,Faculty,Room\n';
        
        for (const day of days) {
            for (const slot of sortedTimeSlots) {
                const entry = getEntryForSlot(day, slot._id);
                if (slot.isBreak) {
                    csv += `${day},${slot.startTime}-${slot.endTime},BREAK,--,--,--,--\n`;
                } else if (entry) {
                    const subjectType = entry.subject?.type === 'lab' ? 'Lab' : 'Lecture';
                    const facultyName = entry.faculty?.user?.name || 'N/A';
                    const roomName = entry.classroom?.name || 'N/A';
                    csv += `${day},${slot.startTime}-${slot.endTime},"${entry.subject?.name}",${entry.subject?.code},${subjectType},${facultyName},${roomName}\n`;
                } else {
                    csv += `${day},${slot.startTime}-${slot.endTime},FREE SLOT,--,--,--,--\n`;
                }
            }
        }

        // Create blob and download
        const element = document.createElement('a');
        const file = new Blob([csv], { type: 'text/csv' });
        element.href = URL.createObjectURL(file);
        element.download = `Timetable_${timetable.department?.name}_Sem${timetable.semester}.csv`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handlePrintTimetable = () => {
        window.print();
    };

    if (!timetableId) return null;
    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (error) return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-8">
            <p className="font-medium">Error Loading Timetable</p>
            <p className="text-sm mt-1">{error}</p>
        </div>
    );
    if (!timetable || !timetable.entries) return (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mt-8">
            <p className="font-medium">No timetable data available</p>
            <p className="text-sm mt-1">The timetable could not be loaded. Please try again.</p>
        </div>
    );

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Safely get time slots from multiple sources
    let baseTimeSlots = [];
    if (allTimeSlots.length > 0) {
        baseTimeSlots = allTimeSlots;
    } else if (Array.isArray(timetable.timeSlots) && timetable.timeSlots.length > 0) {
        baseTimeSlots = timetable.timeSlots;
    } else if (Array.isArray(timetable.entries) && timetable.entries.length > 0) {
        baseTimeSlots = timetable.entries
            .filter(entry => entry && entry.timeSlot)
            .reduce((acc, entry) => {
                if (entry.timeSlot && !acc.some(slot => slot._id === entry.timeSlot._id)) {
                    acc.push(entry.timeSlot);
                }
                return acc;
            }, []);
    }

    if (baseTimeSlots.length === 0) {
        return (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mt-8">
                <p className="font-medium">No time slots available</p>
                <p className="text-sm mt-1">The timetable has no structured time slots configured.</p>
            </div>
        );
    }

    const sortedTimeSlots = baseTimeSlots
        .map(slot => ({
            ...slot,
            isBreak: slot.type === 'break' || slot.type === 'lunch'
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.startTime || '').localeCompare(b.startTime || ''));

    const getEntryForSlot = (day, slotId) => {
        try {
            if (!timetable.entries || !Array.isArray(timetable.entries)) return null;
            
            const entry = timetable.entries.find(e => 
                e && e.day === day && e.timeSlot && e.timeSlot._id === slotId
            );
            
            if (!entry) return null;
            
            if (filterUserFacultyId) {
                const facUserId = entry.faculty?.user?._id || entry.faculty?.user;
                if (facUserId !== filterUserFacultyId) return null;
            }
            
            return entry;
        } catch (err) {
            console.warn('Error getting entry for slot:', err);
            return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                        <Calendar size={24} className="text-indigo-600" />
                        {timetable.department?.name} - {timetable.semester}
                    </h3>
                    <p className="text-sm text-indigo-700 mt-1">
                        Status: <span className="font-semibold">{timetable.status}</span>
                        {enableLiveUpdates && timetable.status === 'PUBLISHED' && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-semibold">
                                🔴 LIVE UPDATES MODE
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                        {enableLiveUpdates && timetable.status === 'PUBLISHED' 
                            ? 'Click any class to substitute faculty or change room in real-time'
                            : 'Scroll horizontally to view afternoon sessions.'}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrintTimetable}
                        title="Print Timetable"
                        className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <Printer size={20} />
                    </button>
                    <button
                        onClick={handleExport}
                        title="Export as CSV"
                        className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <Download size={20} />
                    </button>
                    {user?.role === 'ADMIN' && timetable.status === 'DRAFT' && (
                        <button
                            onClick={handlePublish}
                            title="Publish Timetable"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Send size={18} />
                            Publish
                        </button>
                    )}
                    {timetable.status === 'PUBLISHED' && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">
                            PUBLISHED ✓
                        </span>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-max w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-semibold text-slate-800 border-r border-slate-200 w-32 sticky left-0 bg-slate-50 z-10">Day / Time</th>
                                {sortedTimeSlots.map(slot => (
                                    <th key={slot._id} className="p-4 font-semibold text-slate-800 border-r border-slate-200 min-w-[160px] text-center">
                                        {slot.startTime} - {slot.endTime}
                                        {slot.isBreak && <span className="block text-xs text-amber-600 mt-1 font-semibold">{slot.label || 'BREAK'}</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {days.map(day => (
                                <tr key={day}>
                                    <td className="p-4 font-medium text-slate-700 border-r border-slate-200 bg-slate-50 align-top sticky left-0 z-10">
                                        {day}
                                    </td>

                                    {sortedTimeSlots.map(slot => {
                                        const entry = getEntryForSlot(day, slot._id);
                                        // Allow editing for DRAFT or when Live Updates is enabled for PUBLISHED
                                        const canEdit = user?.role === 'ADMIN' && 
                                            (timetable.status === 'DRAFT' || enableLiveUpdates) && 
                                            entry && !slot.isBreak;

                                        return (
                                            <td key={`${day}-${slot._id}`} className="p-3 border-r border-slate-200 align-top">
                                                {slot.isBreak ? (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-100/50 rounded-lg min-h-[80px]">
                                                        {slot.label || 'Break'}
                                                    </div>
                                                ) : entry ? (
                                                    <div
                                                        className={`relative bg-indigo-50 border border-indigo-100 p-3 rounded-lg shadow-sm h-full group
                                                            ${canEdit ? 'cursor-pointer hover:border-indigo-400 transition hover:-translate-y-1 hover:shadow-md' : ''}`}
                                                        onClick={() => canEdit && handleOpenEditModal(entry)}
                                                    >
                                                        {canEdit && (
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-100 p-1 rounded text-indigo-600">
                                                                <Edit2 size={14} />
                                                            </div>
                                                        )}
                                                        <p className="font-bold text-indigo-900 pr-6">{entry.subject?.name}</p>
                                                        <p className="text-sm text-indigo-700 mt-1 font-medium">{entry.subject?.code} ({entry.subject?.type === 'lab' ? 'Lab' : 'Lec'})</p>
                                                        <div className="mt-3 pt-3 border-t border-indigo-200/50 text-xs text-slate-600 space-y-1">
                                                            <p className="flex justify-between"><span>Prof:</span> <span className="font-semibold text-slate-800">{entry.faculty?.user?.name || 'Assigned Faculty'}</span></p>
                                                            <p className="flex justify-between"><span>Room:</span> <span className="font-semibold text-slate-800">{entry.classroom?.name} ({entry.classroom?.type})</span></p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-lg min-h-[80px]">
                                                        Free Slot
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
            </div>

            {/* Edit Override Modal */}
            {isEditModalOpen && editingEntry && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {enableLiveUpdates ? 'Live Update - Substitute' : 'Manual Override'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{editingEntry.subject?.name} ({editingEntry.day} {editingEntry.timeSlot?.startTime})</p>
                            </div>
                            <button onClick={handleCloseEditModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveOverride} className="p-6 space-y-4">
                            {enableLiveUpdates && (
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
                                    <div className="text-amber-600 mt-0.5">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-amber-900">Real-Time Update Mode</p>
                                        <p className="text-xs text-amber-800 mt-1">Changes will be immediately visible to all users viewing this timetable. Use for emergency substitutions only.</p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {enableLiveUpdates ? 'Substitute Faculty' : 'Override Faculty'}
                                </label>
                                <select
                                    value={overrideData.faculty}
                                    onChange={e => setOverrideData({ ...overrideData, faculty: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>Select Faculty</option>
                                    {facultyOptions.map(f => (
                                        <option key={f._id} value={f._id}>{f.user?.name} ({f.user?.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {enableLiveUpdates ? 'Change Classroom' : 'Override Classroom'}
                                </label>
                                <select
                                    value={overrideData.classroom}
                                    onChange={e => setOverrideData({ ...overrideData, classroom: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>Select Classroom</option>
                                    {classroomOptions.map(r => (
                                        <option key={r._id} value={r._id}>{r.name} ({r.type} - Cap: {r.capacity})</option>
                                    ))}
                                </select>
                            </div>

                            {!enableLiveUpdates && (
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2 mt-4">
                                    <div className="text-amber-600 mt-0.5"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                                    <p className="text-xs text-amber-800">Manual overrides bypass scheduler constraints (like max load or lab-specific rooms). Ensure changes are valid.</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseEditModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                                    {enableLiveUpdates ? 'Apply Live Update' : 'Apply Override'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableViewer;
