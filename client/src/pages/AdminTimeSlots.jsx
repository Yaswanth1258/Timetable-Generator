import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';

const AdminTimeSlots = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [formData, setFormData] = useState({
        order: 1,
        label: '',
        startTime: '09:00',
        endTime: '10:00',
        type: 'regular'
    });

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    const fetchTimeSlots = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/timeslots');
            setTimeSlots(data.sort((a, b) => a.order - b.order));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (slot = null) => {
        if (slot) {
            setEditingSlot(slot);
            setFormData({
                order: slot.order,
                label: slot.label,
                startTime: slot.startTime,
                endTime: slot.endTime,
                type: slot.type
            });
        } else {
            setEditingSlot(null);
            setFormData({
                order: timeSlots.length + 1,
                label: `Period ${timeSlots.filter(s => s.type === 'regular').length + 1}`,
                startTime: '09:00',
                endTime: '10:00',
                type: 'regular'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSlot(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingSlot) {
                await api.put(`/admin/timeslots/${editingSlot._id}`, formData);
            } else {
                await api.post('/admin/timeslots', formData);
            }
            fetchTimeSlots();
            handleCloseModal();
        } catch (err) {
            alert('Failed to save time slot');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this time slot?')) return;
        try {
            await api.delete(`/admin/timeslots/${id}`);
            fetchTimeSlots();
        } catch (err) {
            alert('Failed to delete time slot');
        }
    };

    const getTypeClasses = (type) => {
        switch (type) {
            case 'break': return 'bg-orange-100 text-orange-700';
            case 'lunch': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Time Slots</h2>
                    <p className="text-sm text-slate-500 mt-1">Define class periods and break times</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Add Time Slot
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
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Label</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {timeSlots.map((slot) => (
                                    <tr key={slot._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{slot.order}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{slot.label}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{slot.startTime}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{slot.endTime}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTypeClasses(slot.type)}`}>
                                                {slot.type === 'break' && <span className="mr-1">☕</span>}
                                                {slot.type === 'lunch' && <span className="mr-1">🍽️</span>}
                                                {slot.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(slot)} className="text-slate-400 hover:text-indigo-600 p-1 rounded"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(slot._id)} className="text-slate-400 hover:text-rose-600 p-1 rounded"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {timeSlots.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No time slots found. Click Add Time Slot to create one.</td>
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
                            <h3 className="text-xl font-bold text-slate-800">{editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
                                    <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                                        <option value="regular">Regular</option>
                                        <option value="break">Break</option>
                                        <option value="lunch">Lunch</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Label (e.g. Period 1, Lunch)</label>
                                <input type="text" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                    <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                                    <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Save Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTimeSlots;
