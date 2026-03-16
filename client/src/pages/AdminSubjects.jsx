import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        department: '',
        semester: '3',
        credits: 3,
        contactHours: 3,
        type: 'lecture'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subRes, deptRes] = await Promise.all([
                api.get('/admin/subjects'),
                api.get('/admin/departments')
            ]);
            setSubjects(subRes.data.sort((a, b) => a.code.localeCompare(b.code)));
            setDepartments(deptRes.data);
            if (deptRes.data.length > 0) {
                setFormData(prev => ({ ...prev, department: deptRes.data[0]._id }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (sub = null) => {
        if (sub) {
            setEditingSubject(sub);
            setFormData({
                name: sub.name,
                code: sub.code,
                department: sub.department?._id || '',
                semester: sub.semester?.toString() || '3',
                credits: sub.credits,
                contactHours: sub.contactHours,
                type: sub.type || 'lecture'
            });
        } else {
            setEditingSubject(null);
            setFormData({
                name: '',
                code: '',
                department: departments.length > 0 ? departments[0]._id : '',
                semester: '3',
                credits: 3,
                contactHours: 3,
                type: 'lecture'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubject(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingSubject) {
                await api.put(`/admin/subjects/${editingSubject._id}`, formData);
            } else {
                await api.post('/admin/subjects', formData);
            }
            const { data } = await api.get('/admin/subjects');
            setSubjects(data.sort((a, b) => a.code.localeCompare(b.code)));
            handleCloseModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save subject');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await api.delete(`/admin/subjects/${id}`);
            setSubjects(subjects.filter(s => s._id !== id));
        } catch (err) {
            alert('Failed to delete subject');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Subjects</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage academic subjects and courses</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={18} /> Add Subject
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
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Semester</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Hours/Week</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {subjects.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{sub.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{sub.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{sub.department?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">{sub.semester}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">{sub.contactHours}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                                ${sub.type === 'lab' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {sub.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(sub)} className="text-slate-400 hover:text-indigo-600 p-1 rounded"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(sub._id)} className="text-slate-400 hover:text-rose-600 p-1 rounded"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {subjects.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No subjects found</td>
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
                            <h3 className="text-xl font-bold text-slate-800">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                                    <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required placeholder="e.g. CS201" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Semester/Term</label>
                                    <input type="text" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required placeholder="e.g. 1, 2, or Fall" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required placeholder="e.g. Data Structures" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                    <option value="" disabled>Select Department</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Credits</label>
                                    <input type="number" min="1" max="10" value={formData.credits} onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hours/Week</label>
                                    <input type="number" min="1" max="20" value={formData.contactHours} onChange={e => setFormData({ ...formData, contactHours: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="lecture">lecture</option>
                                        <option value="lab">lab</option>
                                        <option value="tutorial">tutorial</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSubjects;
