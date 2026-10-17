import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import JobCard from '../../components/jobs/JobCard';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/ui/Avatar';
export default function CompanyDetailsPage() {
    const { id } = useParams(), [company, setCompany] = useState(null), [jobs, setJobs] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
    useEffect(() => {
        Promise.all([api.get(`/companies/${id}`), api.get(`/companies/${id}/jobs`)]).then(([a, b]) => {
            setCompany(a.data.data.company);
            setJobs(b.data.data.jobs);
        }).catch(e => setError(e.response?.data?.message || 'Company could not be loaded')).finally(() => setLoading(false));
    }, [id]);
    if (loading)
        return (<div className="center-page">Loading company…</div>);
    if (error || !company)
        return (<main className="container page">
            <section className="panel empty-state">
                <h1>Company not found</h1>
                <p>
                    {error || 'This company is no longer available.'}
                </p>
                <Link className="btn btn-primary" to="/companies">Back to companies</Link>
            </section>
        </main>);
    return (<main className="container page">
        <Link className="back-link" to="/companies"><ArrowLeft size={16}/> Back to companies</Link>
        <section className="company-cover panel">
            <Avatar src={company.logo} name={company.name} size="xl"/>
            <div>
                <span className="badge">
                    {company.verified ? 'Verified company' : 'Company'}
                </span>
                <h1>
                    {company.name}
                </h1>
                <div className="detail-meta">
                    <span>
                        <MapPin size={15}/>
                        {company.location || 'Location not listed'}
                    </span>
                    {company.website && <a href={company.website} target="_blank" rel="noreferrer"><Globe size={15}/> Website</a>}
                </div>
            </div>
            {company.verified && <span className="verified-tag"><CheckCircle2 size={16}/> Verified</span>}
        </section>
        <section className="section-no-top company-about">
            <h2>About {company.name}</h2>
            <p className="rich-text">
                {company.description || 'No company description yet.'}
            </p>
        </section>
        <section>
            <div className="section-head">
                <div>
                    <div className="eyebrow">OPEN ROLES</div>
                    <h2>Opportunities at {company.name}</h2>
                </div>
            </div>
            {jobs.length ? <div className="grid-3">
                {jobs.map(j => (<JobCard key={j._id} job={j}/>))}
            </div> : <EmptyState title="No open roles" message="This team does not have an open role right now."/>}
        </section>
    </main>);
}
