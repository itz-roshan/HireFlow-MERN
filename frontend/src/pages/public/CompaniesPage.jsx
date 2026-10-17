import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { api } from '../../api/client';
import Avatar from '../../components/ui/Avatar';
export default function CompaniesPage() {
    const [c, setC] = useState([]), [q, setQ] = useState('');
    useEffect(() => {
        api.get('/companies').then(r => setC(r.data.data.companies)).catch(() => { });
    }, []);
    const filtered = c.filter(x => x.name.toLowerCase().includes(q.toLowerCase()));
    return (<main className="container page">
        <div className="page-heading">
            <div>
                <div className="eyebrow">HIRING TEAMS</div>
                <h1>Explore companies</h1>
                <p>Meet the teams behind the roles you may want to build your future with.</p>
            </div>
            <div className="compact-search">
                <Search size={16}/>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search companies"/>
            </div>
        </div>
        {filtered.length ? <div className="grid-3">
            {filtered.map(x => (<Link className="company-card" key={x._id} to={`/companies/${x._id}`}>
                <Avatar src={x.logo} name={x.name} size="lg"/>
                <div className="company-card-copy">
                    <h3>
                        {x.name}
                    </h3>
                    <p>
                        {x.location || 'Location not listed'}
                    </p>
                    <span>{x.verified ? 'Verified company' : 'Company'} <ArrowRight size={15}/></span>
                </div>
            </Link>))}
        </div> : <div className="panel empty-state">
            <h3>No companies found</h3>
            <p>Try a different search.</p>
        </div>}
    </main>);
}
