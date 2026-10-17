import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { Download, Linkedin, Github, Globe2, MessageCircle } from 'lucide-react';
export default function ApplicantDetailsModal({ app, onClose, onMessage }) {
    const person = app?.applicant;
    return (<Modal
        open={Boolean(app)}
        onClose={onClose}
        wide
        title={person?.name || 'Candidate'}
        subtitle={person?.headline || 'Candidate profile'}
    >
        {person ? (<div className="candidate-detail">
            <div className="candidate-top">
                <Avatar src={person.avatar} name={person.name} size="lg"/>
                <div>
                    <b>
                        {person.name}
                    </b>
                    <span>
                        {person.email}
                    </span>
                    {person.location && <span>
                        {person.location}
                    </span>}
                </div>
                <button
                    type="button"
                    className="btn btn-outline btn-sm candidate-message"
                    onClick={() => onMessage?.(person)}
                >
              <MessageCircle size={15}/> Message
            </button>
            </div>
            <div className="candidate-grid">
                <div>
                    <h4>Skills</h4>
                    <div className="chips">
                        {(person.skills || []).map((skill) => (<span className="chip" key={skill}>
                            {skill}
                        </span>))}
                    </div>
                </div>
                <div>
                    <h4>Experience</h4>
                    {person.experience?.length ? (<ul>
                        {person.experience.map((item) => (<li key={item}>
                            {item}
                        </li>))}
                    </ul>) : <p className="muted">Not added yet.</p>}
                </div>
                <div>
                    <h4>Education</h4>
                    {person.education?.length ? (<ul>
                        {person.education.map((item) => (<li key={item}>
                            {item}
                        </li>))}
                    </ul>) : <p className="muted">Not added yet.</p>}
                </div>
                <div>
                    <h4>Links</h4>
                    <div className="candidate-links">
                        {app.resumeUrl && (<a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/application-resume/${app._id}`}
                            download={`HireFlow-Resume-${app._id}.pdf`}
                        >
                    <Download size={15}/> Download resume
                  </a>)}
                        {person.social?.linkedin && (<a href={person.social.linkedin} target="_blank" rel="noreferrer">
                    <Linkedin size={15}/> LinkedIn
                  </a>)}
                        {person.social?.github && (<a href={person.social.github} target="_blank" rel="noreferrer">
                    <Github size={15}/> GitHub
                  </a>)}
                        {person.social?.portfolio && (<a href={person.social.portfolio} target="_blank" rel="noreferrer">
                    <Globe2 size={15}/> Portfolio
                  </a>)}
                        {!app.resumeUrl &&
                            !person.social?.linkedin &&
                            !person.social?.github &&
                            !person.social?.portfolio && (
                                <span className="muted">No public links added.</span>
                            )}
                    </div>
                </div>
            </div>
            {person.bio && (<div className="candidate-bio">
                <h4>About</h4>
                <p>
                    {person.bio}
                </p>
            </div>)}
        </div>) : null}
    </Modal>);
}
