import React, { useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard,
    Book,
    BookOpen,
    Users,
    Building,
    Clock,
    Zap,
    Calendar,
    Activity,
    LogOut,
    CalendarDays,
    FileQuestion
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children }) => {
    return (
        <NavLink
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
            }
        >
            <Icon size={18} />
            {children}
        </NavLink>
    );
};

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    // Determine current page title
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/admin') return 'Dashboard';
        if (path.includes('/departments')) return 'Departments';
        if (path.includes('/subjects')) return 'Subjects';
        if (path.includes('/faculty')) return 'Faculty';
        if (path.includes('/classrooms')) return 'Classrooms';
        if (path.includes('/timeslots')) return 'Time Slots';
        if (path.includes('/generate')) return 'Generate';
        if (path.includes('/view')) return 'View Timetable';
        if (path.includes('/live')) return 'Live Updates';
        if (path.includes('/users')) return 'User Management';
        if (path.includes('/requests')) return 'Faculty Requests';
        return 'Admin Portal';
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111827] flex flex-col hidden md:flex">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                        <CalendarDays size={24} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold tracking-wide">TimetableIQ</h2>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Optimization System</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <SidebarLink to="/admin" icon={LayoutDashboard}>Dashboard</SidebarLink>
                    <SidebarLink to="/admin/departments" icon={Book}>Departments</SidebarLink>
                    <SidebarLink to="/admin/subjects" icon={BookOpen}>Subjects</SidebarLink>
                    <SidebarLink to="/admin/faculty" icon={Users}>Faculty</SidebarLink>
                    <SidebarLink to="/admin/classrooms" icon={Building}>Classrooms</SidebarLink>
                    <SidebarLink to="/admin/timeslots" icon={Clock}>Time Slots</SidebarLink>
                    <SidebarLink to="/admin/users" icon={Users}>Logins/Users</SidebarLink>

                    <div className="mt-8 mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Engine</div>
                    <SidebarLink to="/admin/generate" icon={Zap}>Generate</SidebarLink>
                    <SidebarLink to="/admin/view" icon={Calendar}>View Timetable</SidebarLink>
                    <SidebarLink to="/admin/live" icon={Activity}>Live Updates</SidebarLink>
                    <SidebarLink to="/admin/requests" icon={FileQuestion}>Requests</SidebarLink>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-900 text-indigo-200 flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-slate-500 truncate uppercase">{user?.role || 'ADMIN'}</p>
                        </div>
                        <button onClick={logout} className="text-slate-400 hover:text-white transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-400">{user?.email}</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
