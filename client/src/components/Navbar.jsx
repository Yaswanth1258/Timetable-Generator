import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Users, BookOpen, Clock } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
                            <Calendar className="text-indigo-500" />
                            TOS
                        </span>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                            {/* Context specific links can go here based on user.role */}
                            <span className="inline-flex items-center px-3 text-sm font-medium text-gray-500">
                                {user.role} Dashboard
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            {user.name} ({user.role})
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium rounded-lg transition-colors border border-rose-200"
                        >
                            <LogOut size={16} />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
