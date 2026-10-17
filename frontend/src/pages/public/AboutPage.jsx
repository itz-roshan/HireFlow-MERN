import { HeartHandshake, LockKeyhole, Sparkles, Users } from 'lucide-react';
export default function AboutPage() {
    return (<main className="container page">
        <section className="about-hero panel">
            <div className="eyebrow"><Sparkles size={14}/> ABOUT H I R E F L O W</div>
            <h1>Hiring should feel more human.</h1>
            <p>HireFlow is a recruitment platform concept built around clarity, context and respectful communication between candidates and hiring teams.</p>
        </section>
        <section className="section-no-top">
            <div className="grid-3">
                <div className="feature">
                    <HeartHandshake />
                    <h3>Human context</h3>
                    <p>Profiles make room for skills, experience and the story behind the resume.</p>
                </div>
                <div className="feature">
                    <LockKeyhole />
                    <h3>Trust by design</h3>
                    <p>Role-based access, protected resumes and auditable moderation belong in the foundation.</p>
                </div>
                <div className="feature">
                    <Users />
                    <h3>One workflow</h3>
                    <p>Search, applications, interviews, notifications and messaging stay connected.</p>
                </div>
            </div>
        </section>
    </main>);
}
