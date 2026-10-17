import { Mail, MessageCircle, ShieldCheck } from 'lucide-react';
export default function ContactPage() {
    return (<main className="container page">
        <div className="detail-grid">
            <section className="panel">
                <div className="eyebrow"><MessageCircle size={14}/> CONTACT</div>
                <h1>Talk to the HireFlow team</h1>
                <p className="muted">For this portfolio build, use the details below as a development contact surface.</p>
                <div className="contact-cards">
                    <a className="contact-card" href="mailto:hello@hireflow.local">
                        <Mail />
                        <span>
                            <b>Email</b>
                            <small>hello@hireflow.local</small>
                        </span>
                    </a>
                    <div className="contact-card">
                        <ShieldCheck />
                        <span>
                            <b>Support hours</b>
                            <small>Development environment · local time</small>
                        </span>
                    </div>
                </div>
            </section>
        </div>
    </main>);
}
