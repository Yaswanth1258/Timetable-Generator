import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';

const AdminFaculty = () => {
    const [faculty, setFaculty] = useState([]);
    const [users, setUsers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFac, setEditingFac] = useState(null);
    const [formData, setFormData] = useState({
        user: '',
        expertise: [],
        maxLoad: 16,
        designation: 'Assistant Professor',
        availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    });

    const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [facRes, usersRes, subRes] = await Promise.all([
                api.get('/admin/faculty'),
                api.get('/users?role=FACULTY'), // Assuming this endpoint exists, or we might need to filter client side if not
                api.get('/admin/subjects')
            ]);
            setFaculty(facRes.data);
            setUsers(usersRes.data || []);
            setSubjects(subRes.data || []);

            if (usersRes.data && usersRes.data.length > 0) {
                setFormData(prev => ({ ...prev, user: usersRes.data[0]._id }));
            }
        } catch (err) {
            console.error(err);
            // Fallback if /users API fails
            try {
                const { data } = await api.get('/admin/faculty');
                setFaculty(data);
                const subRes = await api.get('/admin/subjects');
                setSubjects(subRes.data);
            } catch (e) { }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (fac = null) => {
        if (fac) {
            setEditingFac(fac);
            setFormData({
                user: fac.user?._id || '',
                expertise: fac.expertise?.map(e => e._id) || [],
                maxLoad: fac.maxLoad || 16,
                designation: fac.designation || 'Assistant Professor',
                availability: fac.availability || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
            });
        } else {
            setEditingFac(null);
            setFormData({
                user: users.length > 0 ? users[0]._id : '',
                expertise: [],
                maxLoad: 16,
                designation: 'Assistant Professor',
                availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFac(null);
    };

    const handleExpertiseChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, expertise: value });
    };

    const handleDayToggle = (day) => {
        setFormData(prev => {
            if (prev.availability.includes(day)) {
                return { ...prev, availability: prev.availability.filter(d => d !== day) };
            } else {
                return { ...prev, availability: [...prev.availability, day] };
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingFac) {
                await api.put(`/admin/faculty/${editingFac._id}`, formData);
            } else {
                await api.post('/admin/faculty', formData);
            }
            const { data } = await api.get('/admin/faculty');
            setFaculty(data);
            handleCloseModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save faculty profile');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this faculty profile?')) return;
        try {
            await api.delete(`/admin/faculty/${id}`);
            setFaculty(faculty.filter(f => f._id !== id));
        } catch (err) {
            alert('Failed to delete faculty');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Faculty Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage teaching staff and their availability</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={18} /> Add Faculty
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Max Hours</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Availability</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {faculty.map((fac) => (
                                    <tr key={fac._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{fac.user?.name || 'Unknown User'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fac.user?.email || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fac.user?.department?.name || 'Computer Science'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-slate-600">{fac.designation || 'Professor'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fac.maxLoad}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                {fac.availability && fac.availability.length > 0 ? fac.availability.map(day => (
                                                    <span key={day} className="px-2 py-0.5 border border-slate-200 rounded text-xs font-medium text-slate-600">{day}</span>
                                                )) : <span className="text-xs text-slate-400">All</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(fac)} className="text-slate-400 hover:text-indigo-600 p-1 rounded"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(fac._id)} className="text-slate-400 hover:text-rose-600 p-1 rounded"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {faculty.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No faculty profiles found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">{editingFac ? 'Edit Faculty' : 'Add Faculty'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {!editingFac && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Select User Account</label>
                                    <select value={formData.user} onChange={e => setFormData({ ...formData, user: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="" disabled>Select User</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Only Users with FACULTY role are shown.</p>
                                </div>
                            )}
                            {editingFac && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
                                    <input type="text" value={editingFac.user?.name || ''} disabled className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-500" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                                    <select value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="Professor">Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Assistant Professor">Assistant Professor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Hours/Week</label>
                                    <input type="number" min="1" max="40" value={formData.maxLoad} onChange={e => setFormData({ ...formData, maxLoad: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_DAYS.map(day => (
                                        <button
                                            type="button"
                                            key={day}
                                            onClick={() => handleDayToggle(day)}
                                            className={`px-3 py-1 rounded text-sm font-medium border ${formData.availability.includes(day) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Expertise (Multi-select)</label>
                                <select multiple value={formData.expertise} onChange={handleExpertiseChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 h-32">
                                    {subjects.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Save Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFaculty;
