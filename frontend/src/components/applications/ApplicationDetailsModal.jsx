import Modal from '../ui/Modal';
import StatusBadge from './StatusBadge';
import { ExternalLink } from 'lucide-react';
export default function ApplicationDetailsModal({ application, onClose }) {
    if (!application)
        return (<Modal open={false} onClose={onClose} title="Application"/>);
    const history = [...(application.history || [])].reverse();
    return (<Modal
        open={!!application}
        onClose={onClose}
        wide
        title={application.job?.title || 'Application'}
        subtitle={application.job?.company?.name || 'Hiring team'}
    >
        <div className="application-modal-grid">
            <div className="application-summary panel-soft">
                <div>
                    <span className="eyebrow">CURRENT STATUS</span>
                    <StatusBadge status={application.status}/>
                </div>
                <div>
                    <span className="eyebrow">APPLIED</span>
                    <b>
                        {new Date(application.createdAt).toLocaleString()}
                    </b>
                </div>
            </div>
            <div>
                <h3 className="modal-section-title">Application journey</h3>
                <div className="application-timeline">
                    {history.length ? history.map((item, index) => (<div className="timeline-item" key={`${item.status}-${item.at}-${index}`}>
                        <span className="timeline-dot"/>
                        <div>
                            <b>
                                {item.status.replace('_', ' ')}
                            </b>
                            <span>
                                {item.at ? new Date(item.at).toLocaleString() : ''}
                            </span>
                            {item.note && <p>
                                {item.note}
                            </p>}
                        </div>
                    </div>)) : <p className="muted">No history recorded.</p>}
                </div>
            </div>
            {application.coverLetter && <div>
                <h3 className="modal-section-title">Your cover letter</h3>
                <p className="rich-text">
                    {application.coverLetter}
                </p>
            </div>}
            {application.resumeUrl && <a
                className="btn btn-outline"
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/application-resume/${application._id}`}
                target="_blank"
                rel="noreferrer"
            ><ExternalLink size={15}/> Open submitted resume</a>}
        </div>
    </Modal>);
}
