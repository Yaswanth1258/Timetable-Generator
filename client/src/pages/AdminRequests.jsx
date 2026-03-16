import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

import toast from 'react-hot-toast';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        socket.on('new_request', (data) => {
            toast('New Faculty Request Received!', { icon: '🔔' });
            fetchRequests(); 
        });
        socket.on('request_updated', (data) => {
             fetchRequests();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/requests');
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/requests/${id}`, { status });
            toast.success(`Request ${status}`);
            // Let the socket reload handle state
        } catch (err) {
            toast.error('Failed to update request');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Faculty Requests</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage timetable change requests from faculty</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.map((req) => (
                                    <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {new Date(req.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                                            {req.faculty?.name} <br/>
                                            <span className="text-xs text-slate-500 font-normal">{req.faculty?.email}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs break-words">
                                            {req.message}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                                                req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {req.status === 'PENDING' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleUpdateStatus(req._id, 'APPROVED')} 
                                                        className="text-green-600 hover:text-green-700 p-1 flex items-center gap-1 text-xs bg-green-50 rounded px-2 py-1"
                                                    >
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(req._id, 'REJECTED')} 
                                                        className="text-rose-600 hover:text-rose-700 p-1 flex items-center gap-1 text-xs bg-rose-50 rounded px-2 py-1"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {requests.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No requests found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRequests;
