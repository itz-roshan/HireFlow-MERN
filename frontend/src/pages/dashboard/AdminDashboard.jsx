import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, Building2, BriefcaseBusiness, FileText, Flag } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
export default function AdminDashboard() {
    const { data } = useFetch(() => api.get('/admin/overview'), []);
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">PLATFORM ADMIN</div>
                <h1>HireFlow overview</h1>
                <p>Watch activity, quality and platform health.</p>
            </div>
        </div>
        <div className="stats-grid five">
            <StatCard icon={<Users />} label="Users" value={data?.users ?? '—'}/>
            <StatCard icon={<Building2 />} label="Companies" value={data?.companies ?? '—'}/>
            <StatCard icon={<BriefcaseBusiness />} label="Jobs" value={data?.jobs ?? '—'}/>
            <StatCard icon={<FileText />} label="Applications" value={data?.applications ?? '—'}/>
            <StatCard icon={<Flag />} label="Open reports" value={data?.openReports ?? '—'}/>
        </div>
        <section className="panel">
            <h2>Moderation center</h2>
            <p className="muted">Use the admin sidebar to review users, jobs, reports and audit history.</p>
        </section>
    </DashboardLayout>);
}
;
