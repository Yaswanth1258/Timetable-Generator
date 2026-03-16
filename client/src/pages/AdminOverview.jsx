import React, { useState, useEffect } from 'react';
import { Book, Users, Building, Clock, Activity, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/overview');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-sm hover:shadow-lg transition-shadow">
                <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
                <p className="text-indigo-100">Intelligent Timetable Optimization System</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:-translate-y-1 transition-transform cursor-pointer">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Departments</p>
                        <h3 className="text-3xl font-bold text-slate-800">{stats.departments}</h3>
                        <p className="text-xs text-slate-400 mt-1">Total</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-500">
                        <Book size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:-translate-y-1 transition-transform cursor-pointer">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Faculty</p>
                        <h3 className="text-3xl font-bold text-slate-800">{stats.faculty}</h3>
                        <p className="text-xs text-slate-400 mt-1">Total</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl text-emerald-500">
                        <Users size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:-translate-y-1 transition-transform cursor-pointer">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Classrooms</p>
                        <h3 className="text-3xl font-bold text-slate-800">{stats.classrooms}</h3>
                        <p className="text-xs text-slate-400 mt-1">Total</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl text-amber-500">
                        <Building size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:-translate-y-1 transition-transform cursor-pointer">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time Slots</p>
                        <h3 className="text-3xl font-bold text-slate-800">{stats.timeslots}</h3>
                        <p className="text-xs text-slate-400 mt-1">Configurations</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl text-purple-500">
                        <Clock size={20} />
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="text-indigo-500" size={18} />
                        System Setup Progress
                    </h3>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Configuration Completion</span>
                    <span className="font-bold text-slate-800">{stats.setupProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6">
                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${stats.setupProgress}%` }}></div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div className={`text-xs font-medium px-3 py-2 rounded-lg border flex items-center gap-2 ${stats.departments > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <div className={`w-2 h-2 rounded-full ${stats.departments > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> Departments
                    </div>
                    <div className={`text-xs font-medium px-3 py-2 rounded-lg border flex items-center gap-2 ${stats.subjects > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <div className={`w-2 h-2 rounded-full ${stats.subjects > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> Subjects
                    </div>
                    <div className={`text-xs font-medium px-3 py-2 rounded-lg border flex items-center gap-2 ${stats.faculty > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <div className={`w-2 h-2 rounded-full ${stats.faculty > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> Faculty
                    </div>
                    <div className={`text-xs font-medium px-3 py-2 rounded-lg border flex items-center gap-2 ${stats.timeslots > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <div className={`w-2 h-2 rounded-full ${stats.timeslots > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> Time Slots
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 relative z-10">
                        <Zap className="text-amber-500" size={18} /> Generate Timetable
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 relative z-10">
                        Use our algorithm to generate optimized timetables with constraint satisfaction for all your departments.
                    </p>
                    <Link to="/admin/generate" className="w-full relative z-10 block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transform">
                        <span className="flex items-center justify-center gap-2">
                            <Zap size={18} /> Start Generator Engine
                        </span>
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity className="text-emerald-500" size={18} /> Engine Analytics
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-sm text-slate-500">Connected System Users</span>
                            <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full text-xs">{stats.users} Logins</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-sm text-slate-500">Total Unique Subjects</span>
                            <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full text-xs">{stats.subjects} Courses</span>
                        </div>
                        <div className="flex items-center justify-between pb-1">
                            <span className="text-sm text-slate-500">Live Published Timetables</span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-xs">{stats.timetables.published} Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Timetable System Overview</h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Generated</p>
                        <h4 className="text-3xl font-extrabold text-slate-800">{stats.timetables.total}</h4>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Published</p>
                        <h4 className="text-3xl font-extrabold text-emerald-700">{stats.timetables.published}</h4>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">In Draft Mode</p>
                        <h4 className="text-3xl font-extrabold text-amber-700">{stats.timetables.drafts}</h4>
                    </div>
                     <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">System Health</p>
                        <h4 className="text-3xl font-extrabold text-indigo-700">{stats.setupProgress === 100 ? '100%' : 'Needs Setup'}</h4>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminOverview;
