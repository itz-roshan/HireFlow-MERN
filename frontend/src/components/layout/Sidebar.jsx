import { NavLink } from 'react-router-dom';
import { BarChart3, Bell, Bookmark, BriefcaseBusiness, Building2, CalendarDays, MessageCircle, Shield, UserRound, Users, ClipboardCheck } from 'lucide-react';
export default function Sidebar({ role }) {
    const seeker = [
        ['/dashboard', 'Overview', BarChart3],
        ['/profile', 'Profile', UserRound],
        ['/saved-jobs', 'Saved Jobs', Bookmark],
        ['/applications', 'Applications', BriefcaseBusiness],
        ['/interviews', 'Interviews', CalendarDays],
        ['/messages', 'Messages', MessageCircle],
        ['/notifications', 'Notifications', Bell]
    ], recruiter = [
        ['/dashboard', 'Overview', BarChart3],
        ['/company', 'Company', Building2],
        ['/account', 'My account', UserRound],
        ['/my-jobs', 'My Jobs', BriefcaseBusiness],
        ['/applicants', 'Applicants', Users],
        ['/interviews', 'Interviews', CalendarDays],
        ['/messages', 'Messages', MessageCircle],
        ['/notifications', 'Notifications', Bell]
    ], admin = [
        ['/admin', 'Overview', Shield],
        ['/admin/users', 'Users', Users],
        ['/admin/companies', 'Companies', Building2],
        ['/admin/jobs', 'Jobs', BriefcaseBusiness],
        ['/admin/applications', 'Applications', ClipboardCheck],
        ['/admin/reports', 'Reports', Bell],
        ['/admin/categories', 'Categories', BriefcaseBusiness],
        ['/admin/skills', 'Skills', Bookmark],
        ['/admin/audit-logs', 'Audit Logs', BarChart3],
        ['/account', 'My account', UserRound]
    ], items = role === 'JOB_SEEKER' ? seeker : role === 'RECRUITER' ? recruiter : admin;
    return (<aside className="sidebar">
        <p className="side-kicker">WORKSPACE</p>
        {items.map(([to, label, Icon]) => (<NavLink key={to} to={to} className="side-link">
            <Icon size={17}/>
            {label}
        </NavLink>))}
    </aside>);
}
