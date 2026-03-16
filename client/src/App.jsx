import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';

// Layouts and Pages
import AdminLayout from './components/AdminLayout';
import AdminOverview from './pages/AdminOverview';
import AdminDepartments from './pages/AdminDepartments';
import AdminSubjects from './pages/AdminSubjects';
import AdminFaculty from './pages/AdminFaculty';
import AdminClassrooms from './pages/AdminClassrooms';
import AdminTimeSlots from './pages/AdminTimeSlots';
import AdminGenerate from './pages/AdminGenerate';
import AdminViewTimetable from './pages/AdminViewTimetable';
import AdminLiveUpdates from './pages/AdminLiveUpdates';
import AdminUsers from './pages/AdminUsers';
import AdminRequests from './pages/AdminRequests';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />; // Or an unauthorized page
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin Routes with nested layout */}
            <Route
                path="/admin"
                element={
                    <PrivateRoute roles={['ADMIN']}>
                        <AdminLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<AdminOverview />} />
                <Route path="departments" element={<AdminDepartments />} />
                <Route path="subjects" element={<AdminSubjects />} />
                <Route path="faculty" element={<AdminFaculty />} />
                <Route path="classrooms" element={<AdminClassrooms />} />
                <Route path="timeslots" element={<AdminTimeSlots />} />
                <Route path="generate" element={<AdminGenerate />} />
                <Route path="view" element={<AdminViewTimetable />} />
                <Route path="live" element={<AdminLiveUpdates />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="requests" element={<AdminRequests />} />
            </Route>

            <Route path="/faculty" element={
                <PrivateRoute roles={['FACULTY']}>
                    <FacultyDashboard />
                </PrivateRoute>
            } />

            <Route path="/student" element={
                <PrivateRoute roles={['STUDENT']}>
                    <StudentDashboard />
                </PrivateRoute>
            } />

            {/* Default mapping based on role or login */}
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
