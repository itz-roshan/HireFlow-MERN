import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Search, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';
import SearchBar from '../../components/jobs/SearchBar';
import JobCard from '../../components/jobs/JobCard';
import { api } from '../../api/client';
export default function HomePage() {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState(null);
    const [apiError, setApiError] = useState('');
    useEffect(() => {
        Promise.all([api.get('/jobs/featured'), api.get('/public/stats')]).then(([jobsResponse, statsResponse]) => {
            setJobs(jobsResponse.data.data.jobs || []);
            setStats(statsResponse.data.data);
        }).catch(() => setApiError('Unable to load live platform data. Start the HireFlow backend and refresh the page.'));
    }, []);
    const searchJobs = () => {
        window.location.href = `/jobs?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`;
    };
    return (<>
        {apiError && <div className="container">
            <div className="alert warning api-status" role="status">
                {apiError}
            </div>
        </div>}
        <section className="hero">
            <div className="hero-orb orb-a"/>
            <div className="hero-orb orb-b"/>
            <div className="hero-spark spark-a"/>
            <div className="hero-spark spark-b"/>
            <div className="container hero-grid">
                <div>
                    <div className="eyebrow light"><Sparkles size={15}/> HUMAN-FIRST HIRING</div>
                    <h1>Find work that fits your <span className="hero-highlight">future.</span>
    </h1>
                    <p className="hero-copy">Discover meaningful opportunities, show the human behind your skills, and keep every step of hiring in one calm place.</p>
                    <SearchBar {...{ search, setSearch, location, setLocation, onSearch: searchJobs }}/>
                    <div className="hero-points">
                        <span><CheckCircle2 size={16}/>One profile, many applications</span>
                        <span><CheckCircle2 size={16}/>Clear application status</span>
                    </div>
                    <div className="hero-trust"><span className="trust-dot"/> Designed for calmer, more human hiring</div>
                </div>
                <div className="hero-visual">
                    <div className="floating-card card-main">
                        <div className="mini-label">SMART MATCH PREVIEW</div>
                        <div className="match-score">
                            <strong>92%</strong>
                            <div>
                                <b>React Developer</b>
                                <span>NovaTech Labs · Hybrid</span>
                            </div>
                        </div>
                        <div className="progress">
                            <i style={{ width: '92%' }}/>
                        </div>
                        <div className="mini-row">
                            <span>React</span>
                            <span>JavaScript</span>
                            <span>REST API</span>
                        </div>
                    </div>
                    <div className="floating-card card-side">
                        <TrendingUp size={18}/>
                        <b>+28%</b>
                        <span>profile views</span>
                    </div>
                </div>
            </div>
        </section>
        <section className="container stats-row">
            <div>
                <strong>
                    {stats ? stats.openJobs.toLocaleString() : '—'}
                </strong>
                <span>Open opportunities</span>
            </div>
            <div>
                <strong>
                    {stats ? stats.hiringTeams.toLocaleString() : '—'}
                </strong>
                <span>Hiring teams</span>
            </div>
            <div>
                <strong>
                    {stats ? stats.professionals.toLocaleString() : '—'}
                </strong>
                <span>Active professionals</span>
            </div>
            <div>
                <strong>24/7</strong>
                <span>Career workspace</span>
            </div>
        </section>
        <section className="section container">
            <div className="section-head">
                <div>
                    <div className="eyebrow">FEATURED ROLES</div>
                    <h2>Opportunities worth opening</h2>
                </div>
                <Link className="btn btn-outline" to="/jobs">Explore all <ArrowRight size={16}/></Link>
            </div>
            <div className="grid-3">
                {jobs.length ? jobs.slice(0, 3).map(j => (<JobCard key={j._id} job={j}/>)) : <div className="panel">
                    <p className="muted">Start the API to load featured roles.</p>
                </div>}
            </div>
        </section>
        <section className="section soft">
            <div className="container">
                <div className="section-head">
                    <div>
                        <div className="eyebrow">WHY HIREFLOW</div>
                        <h2>Designed around how hiring actually feels</h2>
                    </div>
                </div>
                <div className="grid-3">
                    <div className="feature">
                        <Search />
                        <h3>Less noise</h3>
                        <p>Focused search, useful filters and honest job details help candidates spend energy on the right roles.</p>
                    </div>
                    <div className="feature">
                        <Users />
                        <h3>Human profiles</h3>
                        <p>Give people space to show skills, context and the work they are proud of.</p>
                    </div>
                    <div className="feature">
                        <ShieldCheck />
                        <h3>Structured workflow</h3>
                        <p>Recruiters see applications, status changes, interviews and communication in one workflow.</p>
                    </div>
                </div>
            </div>
        </section>
        <section className="section container">
            <div className="cta">
                <div>
                    <div className="eyebrow light">FOR HIRING TEAMS</div>
                    <h2>Make every candidate interaction count.</h2>
                    <p>Post a clear role, organise applicants and move from shortlist to interview without losing context.</p>
                </div>
                <Link className="btn btn-white" to="/register">Create recruiter account <ArrowRight size={17}/></Link>
            </div>
        </section>
    </>);
}
