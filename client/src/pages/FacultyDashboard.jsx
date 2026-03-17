import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import TimetableViewer from '../components/TimetableViewer';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const FacultyDashboard = () => {
    const { user } = useContext(AuthContext);
    const [timetables, setTimetables] = useState([]);
    const [timetableId, setTimetableId] = useState('');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTimetables = async () => {
            try {
                const { data } = await api.get('/timetable');
                const published = data.filter(t => t.status === 'PUBLISHED');
                setTimetables(published);
                if (published.length > 0) {
                    setTimetableId(published[0]._id);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchTimetables();

        const socket = io(import.meta.env.VITE_API_URL);
        socket.on('request_updated', (data) => {
            if(data.faculty?._id === user?._id) {
                 toast(data.status === 'APPROVED' ? 'Your request was APPROVED!' : 'Your request was REJECTED', {
                     icon: data.status === 'APPROVED' ? '✅' : '❌',
                 });
            }
        });

        return () => {
            socket.disconnect();
        };

    }, [user]);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post('/requests', { message: requestMessage });
            setIsRequestModalOpen(false);
            setRequestMessage('');
            toast.success('Request submitted successfully to Admin!');
        } catch (err) {
            toast.error('Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Faculty Schedule</h1>
                        <p className="mt-2 text-sm text-slate-600">View your assigned classes. Updates appear instantly.</p>
                    </div>
                    {timetables.length > 0 && (
                        <div className="w-64">
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Select Term</label>
                            <select
                                value={timetableId}
                                onChange={e => setTimetableId(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                            >
                                {timetables.map(tt => (
                                    <option key={tt._id} value={tt._id}>
                                        {tt.department?.name} - {tt.semester}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </header>

                <div>
                    {timetableId ? (
                        <>
                            <div className="flex justify-end mb-4">
                                <button 
                                    onClick={() => setIsRequestModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Request Timetable Change
                                </button>
                            </div>
                            <TimetableViewer timetableId={timetableId} filterUserFacultyId={user?._id} />
                        </>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-12 text-center text-slate-500">
                            No published timetables available yet.
                        </div>
                    )}
                </div>

            {/* Request Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">Request Change</h3>
                            <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea 
                                    value={requestMessage} 
                                    onChange={e => setRequestMessage(e.target.value)} 
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]" 
                                    required 
                                    placeholder="Describe the changes you need..."
                                ></textarea>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default FacultyDashboard;
