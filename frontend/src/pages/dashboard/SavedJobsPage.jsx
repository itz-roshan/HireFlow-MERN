import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import JobCard from '../../components/jobs/JobCard';
import EmptyState from '../../components/common/EmptyState';
export default function SavedJobsPage() {
    const { data, reload } = useFetch(() => api.get('/saved-jobs'), []);
    const remove = async (j) => {
        await api.delete(`/saved-jobs/${j._id}`);
        reload();
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">SHORTLISTED FOR LATER</div>
                <h1>Saved jobs</h1>
                <p>Keep interesting roles close while you compare your options.</p>
            </div>
        </div>
        {data?.saved?.length ? <div className="grid-3">
            {data.saved.map(s => (<JobCard key={s._id} job={s.job} saved onSave={remove}/>))}
        </div> : <section className="panel">
            <EmptyState title="Nothing saved yet" message="Use Save on a job card to revisit it later."/>
        </section>}
    </DashboardLayout>);
}
