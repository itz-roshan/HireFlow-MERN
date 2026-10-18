import { Link } from 'react-router-dom';
export default function Footer() {
    return (<footer className="footer">
        <div className="container footer-grid">
            <div>
                <div className="brand">
                    <span className="brand-mark">H</span>
                    <span>Hire<span>Flow</span>
    </span>
                </div>
                <p>Thoughtful hiring tools for people and teams.</p>
            </div>
            <div>
                <h4>Platform</h4>
                <Link to="/jobs">Find jobs</Link>
                <Link to="/companies">Companies</Link>
            </div>
            <div>
                <h4>For teams</h4>
                <Link to="/register">Post a job</Link>
                <Link to="/dashboard">Recruiter workspace</Link>
            </div>
        </div>
        <div className="container footer-bottom">
            <span>itz-roshan © 2026 HireFlow</span>
            <span>Connect. Hire. Grow.</span>
        </div>
    </footer>);
}
