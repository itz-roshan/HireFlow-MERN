import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/jobs/SearchBar';
import JobCard from '../../components/jobs/JobCard';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import { api } from '../../api/client';
export default function JobsPage() {
    const [sp, setSp] = useSearchParams();
    const [search, setSearch] = useState(sp.get('search') || '');
    const [location, setLocation] = useState(sp.get('location') || '');
    const [type, setType] = useState('');
    const [workMode, setWorkMode] = useState('');
    const [jobs, setJobs] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const load = async (p = 1) => {
        setLoading(true);
        setError('');
        try {
            const r = await api.get('/jobs', { params: { page: p, search, location, type, workMode } });
            const d = r.data.data;
            setJobs(d.jobs);
            setPage(d.pagination.page);
            setPages(d.pagination.pages);
            setSp({ ...search && { search }, ...location && { location }, ...type && { type }, ...workMode && { workMode } });
        }
        catch (e) {
            setError(e.response?.data?.message || 'Unable to load jobs');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    return (<main className="container page">
        <div className="page-heading">
            <div>
                <div className="eyebrow">OPPORTUNITIES</div>
                <h1>Explore jobs</h1>
                <p>Search by skill, place and work mode. Every listing has a human team behind it.</p>
            </div>
        </div>
        <SearchBar {...{ search, setSearch, location, setLocation, onSearch: () => load(1) }}/>
        <div className="filters-row">
            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="">All job types</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
            </select>
            <select value={workMode} onChange={e => setWorkMode(e.target.value)}>
                <option value="">All work modes</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
            </select>
            <button className="btn btn-outline btn-sm" onClick={() => load(1)}>Apply filters</button>
        </div>
        {error && <div className="alert error">
            {error}
        </div>}
        {loading ? <div className="center-page">
            <Spinner />
        </div> : jobs.length ? <>
            <div className="grid-3">
                {jobs.map(j => (<JobCard key={j._id} job={j}/>))}
            </div>
            {pages > 1 && <div className="pagination">
                {Array.from({ length: pages }, (_, i) => (<button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => load(i + 1)}>
                    {i + 1}
                </button>))}
            </div>}
        </> : <EmptyState title="No roles matched" message="Try a broader keyword or remove a filter."/>}
    </main>);
}
