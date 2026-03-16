import React, { useState } from 'react';
import TimetableGenerator from '../components/TimetableGenerator';
import TimetableViewer from '../components/TimetableViewer';

const AdminGenerate = () => {
    const [generatedTimetableId, setGeneratedTimetableId] = useState(null);

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Generate Timetable</h1>
                <p className="mt-2 text-sm text-slate-600">Configure parameters to generate an optimized timetable for a department.</p>
            </header>

            <TimetableGenerator onGenerate={setGeneratedTimetableId} />

            {generatedTimetableId && (
                <div className="mt-10 mb-10 border-t border-slate-200 pt-10">
                    <TimetableViewer timetableId={generatedTimetableId} />
                </div>
            )}
        </div>
    );
};

export default AdminGenerate;
