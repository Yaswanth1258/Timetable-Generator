import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import TimetableGenerator from '../components/TimetableGenerator';
import TimetableViewer from '../components/TimetableViewer';
import ResourceManager from '../components/ResourceManager';
import { Database } from 'lucide-react';

const AdminDashboard = () => {
    const [generatedTimetableId, setGeneratedTimetableId] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
                    <p className="mt-2 text-sm text-slate-600">Manage resources and generate optimized timetables.</p>
                </header>

                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <Database className="text-indigo-600" />
                        Data & Resource Management
                    </h2>
                    <ResourceManager />
                </div>

                <div className="mt-10 mb-10 border-t border-slate-200 pt-10">
                    <TimetableGenerator onGenerate={setGeneratedTimetableId} />
                </div>

                {generatedTimetableId && (
                    <div className="mt-10 mb-10 border-t border-slate-200 pt-10">
                        <TimetableViewer timetableId={generatedTimetableId} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
