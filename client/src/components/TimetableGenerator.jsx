import React, { useState, useEffect } from 'react';
import { Sparkles, CalendarDays, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const TimetableGenerator = ({ onGenerate }) => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepts, setSelectedDepts] = useState([]);

    // Optional resources for fine-grained control
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassrooms, setSelectedClassrooms] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

    // Form fields
    const [versionName, setVersionName] = useState('Spring 2025 v1');
    const [academicYear, setAcademicYear] = useState('2024-25');
    const [semester, setSemester] = useState('3');
    const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

    // Algorithm Params
    const [populationSize, setPopulationSize] = useState(30);
    const [generations, setGenerations] = useState(100);
    const [mutationRate, setMutationRate] = useState(15);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [deptRes, subRes, facRes, classRes, slotRes] = await Promise.all([
                    api.get('/admin/departments'),
                    api.get('/admin/subjects'),
                    api.get('/admin/faculty'),
                    api.get('/admin/classrooms'),
                    api.get('/admin/timeslots')
                ]);
                setDepartments(deptRes.data);

                // Initialize resources
                setSubjects(subRes.data);
                setSelectedSubjects(subRes.data.map(s => s._id));

                setFaculty(facRes.data);
                setSelectedFaculty(facRes.data.map(f => f._id));

                setClassrooms(classRes.data);
                setSelectedClassrooms(classRes.data.map(c => c._id));

                setTimeSlots(slotRes.data);
                setSelectedTimeSlots(slotRes.data.map(t => t._id));
            } catch (err) {
                console.error("Failed to fetch resources", err);
            }
        };
        fetchResources();
    }, []);

    const toggleDepartment = (deptId) => {
        if (selectedDepts.includes(deptId)) {
            setSelectedDepts(selectedDepts.filter(id => id !== deptId));
        } else {
            setSelectedDepts([...selectedDepts, deptId]);
        }
    };

    const toggleDay = (day) => {
        if (workingDays.includes(day)) {
            setWorkingDays(workingDays.filter(d => d !== day));
        } else {
            setWorkingDays([...workingDays, day]);
        }
    };

    const toggleSubject = (id) => {
        if (selectedSubjects.includes(id)) setSelectedSubjects(selectedSubjects.filter(i => i !== id));
        else setSelectedSubjects([...selectedSubjects, id]);
    };

    const toggleFaculty = (id) => {
        if (selectedFaculty.includes(id)) setSelectedFaculty(selectedFaculty.filter(i => i !== id));
        else setSelectedFaculty([...selectedFaculty, id]);
    };

    const toggleClassroom = (id) => {
        if (selectedClassrooms.includes(id)) setSelectedClassrooms(selectedClassrooms.filter(i => i !== id));
        else setSelectedClassrooms([...selectedClassrooms, id]);
    };

    const toggleTimeSlot = (id) => {
        if (selectedTimeSlots.includes(id)) setSelectedTimeSlots(selectedTimeSlots.filter(i => i !== id));
        else setSelectedTimeSlots([...selectedTimeSlots, id]);
    };

    const handleGenerate = async () => {
        if (selectedDepts.length === 0) {
            setError('Please select at least one department.');
            return;
        }
        if (workingDays.length === 0) {
            setError('Please select at least one working day.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const { data } = await api.post('/timetable/generate', {
                departments: selectedDepts,
                semester,
                workingDays,
                selectedSubjects,
                selectedFaculty,
                selectedClassrooms,
                selectedTimeSlots,
                // These parameters could be used by advanced backend engine
                populationSize,
                generations,
                mutationRate,
                versionName,
                academicYear
            });
            setResult(data);
            if (onGenerate && data.timetable) {
                onGenerate(data.timetable._id); // Send back first generated timetable ID for viewing
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate timetable. Ensure enough resources exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-sm flex items-center gap-4">
                <Sparkles size={32} className="text-white/80" />
                <div>
                    <h2 className="text-2xl font-bold mb-1">Timetable Generator</h2>
                    <p className="text-indigo-100 text-sm">Genetic Algorithm + Constraint Satisfaction Problem</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {result && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-start gap-3">
                    <CheckCircle className="shrink-0 mt-0.5" size={20} />
                    <p className="text-sm font-semibold">{result.message}</p>
                </div>
            )}

            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <CalendarDays className="text-indigo-500" size={18} /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">Version Name <span className="text-red-500">*</span></label>
                        <input type="text" value={versionName} onChange={e => setVersionName(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Spring 2025 v1" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">Academic Year <span className="text-red-500">*</span></label>
                        <input type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">Semester <span className="text-red-500">*</span></label>
                        <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem.toString()}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Select Departments */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Select Departments <span className="text-red-500">*</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.map(dept => (
                        <div
                            key={dept._id}
                            onClick={() => toggleDepartment(dept._id)}
                            className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-colors ${selectedDepts.includes(dept._id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${selectedDepts.includes(dept._id) ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300'}`}>
                                {selectedDepts.includes(dept._id) && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{dept.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{dept.code} • 60 students</p>
                            </div>
                        </div>
                    ))}
                    {departments.length === 0 && <p className="text-sm text-slate-500">No departments available.</p>}
                </div>
            </div>

            {/* Working Days */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Working Days <span className="text-red-500">*</span></h3>
                <div className="flex flex-wrap gap-4">
                    {allDays.map(day => (
                        <label key={day} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${workingDays.includes(day) ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300'}`}>
                                {workingDays.includes(day) && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <input type="checkbox" className="hidden" checked={workingDays.includes(day)} onChange={() => toggleDay(day)} />
                            {day}
                        </label>
                    ))}
                </div>
            </div>

            {/* Advanced Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Advanced Resource Selection
                </h3>

                <div className="space-y-6">
                    {/* Subjects */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-slate-700">Subjects to Schedule</h4>
                            <button onClick={() => setSelectedSubjects(selectedSubjects.length === subjects.length ? [] : subjects.map(s => s._id))} className="text-xs text-indigo-600 font-semibold hover:underline">
                                {selectedSubjects.length === subjects.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {subjects.map(sub => (
                                <label key={sub._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                    <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" checked={selectedSubjects.includes(sub._id)} onChange={() => toggleSubject(sub._id)} />
                                    <span className="text-sm font-medium text-slate-700 truncate">{sub.name} ({sub.code})</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Faculty */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-slate-700">Available Faculty</h4>
                            <button onClick={() => setSelectedFaculty(selectedFaculty.length === faculty.length ? [] : faculty.map(s => s._id))} className="text-xs text-indigo-600 font-semibold hover:underline">
                                {selectedFaculty.length === faculty.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {faculty.map(fac => (
                                <label key={fac._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                    <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" checked={selectedFaculty.includes(fac._id)} onChange={() => toggleFaculty(fac._id)} />
                                    <span className="text-sm font-medium text-slate-700 truncate">{fac.user?.name || 'Unknown Faculty'}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Classrooms */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-slate-700">Available Classrooms</h4>
                            <button onClick={() => setSelectedClassrooms(selectedClassrooms.length === classrooms.length ? [] : classrooms.map(s => s._id))} className="text-xs text-indigo-600 font-semibold hover:underline">
                                {selectedClassrooms.length === classrooms.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {classrooms.map(room => (
                                <label key={room._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                    <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" checked={selectedClassrooms.includes(room._id)} onChange={() => toggleClassroom(room._id)} />
                                    <span className="text-sm font-medium text-slate-700 truncate">{room.name} ({room.type})</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Time Slots */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-slate-700">Base Time Slots</h4>
                            <button onClick={() => setSelectedTimeSlots(selectedTimeSlots.length === timeSlots.length ? [] : timeSlots.map(s => s._id))} className="text-xs text-indigo-600 font-semibold hover:underline">
                                {selectedTimeSlots.length === timeSlots.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {timeSlots.map(slot => (
                                <label key={slot._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                    <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" checked={selectedTimeSlots.includes(slot._id)} onChange={() => toggleTimeSlot(slot._id)} />
                                    <span className="text-sm font-medium text-slate-700 truncate">{slot.label} ({slot.startTime}-{slot.endTime})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Algorithm Parameters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Algorithm Parameters (Advanced Engine Features)
                </h3>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs font-bold text-slate-800">Population Size</label>
                            <span className="text-xs font-bold text-indigo-600">{populationSize}</span>
                        </div>
                        <input type="range" min="10" max="200" value={populationSize} onChange={e => setPopulationSize(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                        <p className="text-[10px] text-slate-400 mt-1">Number of candidate solutions per generation</p>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs font-bold text-slate-800">Generations</label>
                            <span className="text-xs font-bold text-indigo-600">{generations}</span>
                        </div>
                        <input type="range" min="10" max="500" value={generations} onChange={e => setGenerations(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                        <p className="text-[10px] text-slate-400 mt-1">Number of evolution cycles</p>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs font-bold text-slate-800">Mutation Rate</label>
                            <span className="text-xs font-bold text-indigo-600">{mutationRate}%</span>
                        </div>
                        <input type="range" min="1" max="50" value={mutationRate} onChange={e => setMutationRate(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                        <p className="text-[10px] text-slate-400 mt-1">Probability of random changes</p>
                    </div>
                </div>
            </div>

            {/* Readiness */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Selected Resources Payload</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                        <p className="text-xs font-bold text-indigo-800 mb-1">Subjects Selected</p>
                        <p className="text-2xl font-bold text-indigo-800">{selectedSubjects.length} <span className="text-sm font-normal opacity-70">/ {subjects.length}</span></p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                        <p className="text-xs font-bold text-indigo-800 mb-1">Faculty Selected</p>
                        <p className="text-2xl font-bold text-indigo-800">{selectedFaculty.length} <span className="text-sm font-normal opacity-70">/ {faculty.length}</span></p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                        <p className="text-xs font-bold text-indigo-800 mb-1">Classrooms Selected</p>
                        <p className="text-2xl font-bold text-indigo-800">{selectedClassrooms.length} <span className="text-sm font-normal opacity-70">/ {classrooms.length}</span></p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                        <p className="text-xs font-bold text-indigo-800 mb-1">Time Slots Available</p>
                        <p className="text-2xl font-bold text-indigo-800">{selectedTimeSlots.length * workingDays.length}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-75 disabled:cursor-not-allowed text-lg tracking-wide"
            >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                {loading ? 'Running Optimization Engine...' : 'Generate Optimal Timetables'}
            </button>
        </div>
    );
};

export default TimetableGenerator;
