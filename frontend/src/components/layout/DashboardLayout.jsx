import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
export default function DashboardLayout({ children }) {
    const { user } = useAuth();
    return (<div className="dashboard-layout">
        <Sidebar role={user.role}/>
        <main className="dashboard-main">
            {children}
        </main>
    </div>);
}
