import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
export default function NotFoundPage() {
    return (<main className="center-page not-found">
        <div className="eyebrow">404 · NOT FOUND</div>
        <Compass size={48}/>
        <h1>That page took a different route.</h1>
        <p>Let's get you back to a useful part of HireFlow.</p>
        <Link className="btn btn-primary" to="/">Back home <ArrowRight size={16}/></Link>
    </main>);
}
