import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const ResourceManager = () => {
    const [departments, setDepartments] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newDept, setNewDept] = useState({ name: '', code: '' });
    const [newRoom, setNewRoom] = useState({ name: '', capacity: 60, type: 'Lecture Hall' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, roomRes] = await Promise.all([
                api.get('/admin/departments'),
                api.get('/admin/classrooms')
            ]);
            setDepartments(deptRes.data);
            setClassrooms(roomRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/departments', newDept);
            setNewDept({ name: '', code: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding department');
        }
    };

    const handleDeleteDepartment = async (id) => {
        try {
            await api.delete(`/admin/departments/${id}`);
            fetchData();
        } catch (err) {
            alert('Error deleting department');
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/classrooms', newRoom);
            setNewRoom({ name: '', capacity: 60, type: 'Lecture Hall' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding room');
        }
    };

    const handleDeleteRoom = async (id) => {
        try {
            await api.delete(`/admin/classrooms/${id}`);
            fetchData();
        } catch (err) {
            alert('Error deleting room');
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Departments Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Manage Departments</h3>
                <form onSubmit={handleAddDepartment} className="flex gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Dept Name (e.g. Computer Science)"
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newDept.name}
                        onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Code (CS)"
                        className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newDept.code}
                        onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                        required
                    />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                        <Plus size={18} /> Add
                    </button>
                </form>

                <div className="space-y-3">
                    {departments.map(dept => (
                        <div key={dept._id} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg">
                            <div>
                                <p className="font-semibold text-slate-800">{dept.name}</p>
                                <p className="text-sm text-slate-500">Code: {dept.code}</p>
                            </div>
                            <button onClick={() => handleDeleteDepartment(dept._id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {departments.length === 0 && <p className="text-slate-500 text-sm">No departments found.</p>}
                </div>
            </div>

            {/* Classrooms Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Manage Classrooms</h3>
                <form onSubmit={handleAddRoom} className="flex gap-2 mb-6 flex-wrap">
                    <input
                        type="text"
                        placeholder="Room Name"
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-w-[120px]"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Capacity"
                        className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 0 })}
                        min="1"
                        required
                    />
                    <select
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newRoom.type}
                        onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                    >
                        <option value="Lecture Hall">Lecture Hall</option>
                        <option value="Lab">Lab</option>
                        <option value="Seminar Room">Seminar Room</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                        <Plus size={18} /> Add
                    </button>
                </form>

                <div className="space-y-3">
                    {classrooms.map(room => (
                        <div key={room._id} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg">
                            <div>
                                <p className="font-semibold text-slate-800">{room.name}</p>
                                <p className="text-sm text-slate-500">Capacity: {room.capacity} • {room.type}</p>
                            </div>
                            <button onClick={() => handleDeleteRoom(room._id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {classrooms.length === 0 && <p className="text-slate-500 text-sm">No classrooms found.</p>}
                </div>
            </div>
        </div>
    );
};

export default ResourceManager;
