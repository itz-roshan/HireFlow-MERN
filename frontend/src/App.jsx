import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/public/HomePage';
import JobsPage from './pages/public/JobsPage';
import JobDetailsPage from './pages/public/JobDetailsPage';
import CompaniesPage from './pages/public/CompaniesPage';
import CompanyDetailsPage from './pages/public/CompanyDetailsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import SeekerDashboard from './pages/dashboard/SeekerDashboard';
import RecruiterDashboard from './pages/dashboard/RecruiterDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProfilePage from './pages/dashboard/ProfilePage';
import AccountPage from './pages/dashboard/AccountPage';
import SavedJobsPage from './pages/dashboard/SavedJobsPage';
import ApplicationsPage from './pages/dashboard/ApplicationsPage';
import InterviewsPage from './pages/dashboard/InterviewsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import MessagesPage from './pages/dashboard/MessagesPage';
import CompanyPage from './pages/recruiter/CompanyPage';
import MyJobsPage from './pages/recruiter/MyJobsPage';
import JobEditorPage from './pages/recruiter/JobEditorPage';
import ApplicantsPage from './pages/recruiter/ApplicantsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminSkillsPage from './pages/admin/AdminSkillsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import NotFoundPage from './pages/misc/NotFoundPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import './styles/global.css';
function Protected({ roles, children }) {
    return (<ProtectedRoute roles={roles}>
        {children}
    </ProtectedRoute>);
}
function DashboardByRole() {
    const { user, loading } = useAuth();
    if (loading)
        return null;
    if (!user)
        return (<Navigate to="/login" replace/>);
    if (user.role === 'RECRUITER')
        return (<RecruiterDashboard />);
    if (user.role === 'ADMIN')
        return (<AdminDashboard />);
    return (<SeekerDashboard />);
}
export default function App() {
    return (<BrowserRouter>
        <AuthProvider>
            <SocketProvider>
                <NotificationProvider>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage />}/>
                        <Route path="/jobs" element={<JobsPage />}/>
                        <Route path="/jobs/:id" element={<JobDetailsPage />}/>
                        <Route path="/companies" element={<CompaniesPage />}/>
                        <Route path="/companies/:id" element={<CompanyDetailsPage />}/>
                        <Route path="/about" element={<AboutPage />}/>
                        <Route path="/contact" element={<ContactPage />}/>
                        <Route path="/login" element={<LoginPage />}/>
                        <Route path="/register" element={<RegisterPage />}/>
                        <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
                        <Route path="/reset-password" element={<ResetPasswordPage />}/>
                        <Route path="/dashboard" element={<DashboardByRole />}/>
                        <Route path="/profile" element={<Protected roles={['JOB_SEEKER']}>
                                <ProfilePage />
                            </Protected>}/>
                        <Route path="/account" element={<Protected roles={['RECRUITER', 'ADMIN']}>
                                <AccountPage />
                            </Protected>}/>
                        <Route path="/saved-jobs" element={<Protected roles={['JOB_SEEKER']}>
                                <SavedJobsPage />
                            </Protected>}/>
                        <Route path="/applications" element={<Protected roles={['JOB_SEEKER']}>
                                <ApplicationsPage />
                            </Protected>}/>
                        <Route path="/interviews" element={<Protected roles={['JOB_SEEKER', 'RECRUITER']}>
                                <InterviewsPage />
                            </Protected>}/>
                        <Route path="/notifications" element={<Protected roles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                                <NotificationsPage />
                            </Protected>}/>
                        <Route path="/messages" element={<Protected roles={['JOB_SEEKER', 'RECRUITER']}>
                                <MessagesPage />
                            </Protected>}/>
                        <Route path="/company" element={<Protected roles={['RECRUITER']}>
                                <CompanyPage />
                            </Protected>}/>
                        <Route path="/my-jobs" element={<Protected roles={['RECRUITER']}>
                                <MyJobsPage />
                            </Protected>}/>
                        <Route path="/my-jobs/new" element={<Protected roles={['RECRUITER']}>
                                <JobEditorPage />
                            </Protected>}/>
                        <Route path="/my-jobs/:id/edit" element={<Protected roles={['RECRUITER']}>
                                <JobEditorPage />
                            </Protected>}/>
                        <Route path="/applicants" element={<Protected roles={['RECRUITER']}>
                                <ApplicantsPage />
                            </Protected>}/>
                        <Route path="/admin" element={<Protected roles={['ADMIN']}>
                                <AdminDashboard />
                            </Protected>}/>
                        <Route path="/admin/users" element={<Protected roles={['ADMIN']}>
                                <AdminUsersPage />
                            </Protected>}/>
                        <Route path="/admin/companies" element={<Protected roles={['ADMIN']}>
                                <AdminCompaniesPage />
                            </Protected>}/>
                        <Route path="/admin/jobs" element={<Protected roles={['ADMIN']}>
                                <AdminJobsPage />
                            </Protected>}/>
                        <Route path="/admin/applications" element={<Protected roles={['ADMIN']}>
                                <AdminApplicationsPage />
                            </Protected>}/>
                        <Route path="/admin/reports" element={<Protected roles={['ADMIN']}>
                                <AdminReportsPage />
                            </Protected>}/>
                        <Route path="/admin/categories" element={<Protected roles={['ADMIN']}>
                                <AdminCategoriesPage />
                            </Protected>}/>
                        <Route path="/admin/skills" element={<Protected roles={['ADMIN']}>
                                <AdminSkillsPage />
                            </Protected>}/>
                        <Route path="/admin/audit-logs" element={<Protected roles={['ADMIN']}>
                                <AdminAuditLogsPage />
                            </Protected>}/>
                        <Route path="*" element={<NotFoundPage />}/>
                    </Routes>
                    <Footer />
                </NotificationProvider>
            </SocketProvider>
        </AuthProvider>
    </BrowserRouter>);
}
