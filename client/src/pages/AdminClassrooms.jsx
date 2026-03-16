import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';

const AdminClassrooms = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        building: 'Main Block',
        capacity: 60,
        type: 'lecture_hall',
        projector: true,
        status: 'available'
    });

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/classrooms');
            setClassrooms(data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                name: room.name,
                building: room.building || 'Main Block',
                capacity: room.capacity,
                type: room.type || 'lecture_hall',
                projector: room.projector ?? true,
                status: room.status || 'available'
            });
        } else {
            setEditingRoom(null);
            setFormData({
                name: '',
                building: 'Main Block',
                capacity: 60,
                type: 'lecture_hall',
                projector: true,
                status: 'available'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await api.put(`/admin/classrooms/${editingRoom._id}`, formData);
            } else {
                await api.post('/admin/classrooms', formData);
            }
            fetchClassrooms();
            handleCloseModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save classroom');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this classroom?')) return;
        try {
            await api.delete(`/admin/classrooms/${id}`);
            fetchClassrooms();
        } catch (err) {
            alert('Failed to delete classroom');
        }
    };

    const getTypeClasses = (type) => {
        switch (type) {
            case 'lab': return 'bg-purple-100 text-purple-700';
            case 'auditorium': return 'bg-amber-100 text-amber-700';
            case 'seminar_room': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Classrooms</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage classroom resources and availability</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={18} /> Add Classroom
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
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Building</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Projector</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {classrooms.map((room) => (
                                    <tr key={room._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{room.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{room.building}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{room.capacity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getTypeClasses(room.type)}`}>
                                                {room.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold border ${room.projector ? 'border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-400'}`}>
                                                {room.projector ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {room.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(room)} className="text-slate-400 hover:text-indigo-600 p-1 rounded"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(room._id)} className="text-slate-400 hover:text-rose-600 p-1 rounded"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {classrooms.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No classrooms found</td>
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
                            <h3 className="text-xl font-bold text-slate-800">{editingRoom ? 'Edit Classroom' : 'Add Classroom'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required placeholder="LAB-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Building</label>
                                    <input type="text" value={formData.building} onChange={e => setFormData({ ...formData, building: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required placeholder="IT Block" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                                    <input type="number" min="10" max="500" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="lecture_hall">lecture_hall</option>
                                        <option value="lab">lab</option>
                                        <option value="seminar_room">seminar_room</option>
                                        <option value="auditorium">auditorium</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Projector</label>
                                    <select value={formData.projector} onChange={e => setFormData({ ...formData, projector: e.target.value === 'true' })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="available">available</option>
                                        <option value="maintenance">maintenance</option>
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

export default AdminClassrooms;
