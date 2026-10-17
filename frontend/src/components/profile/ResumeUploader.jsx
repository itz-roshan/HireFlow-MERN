import { FileText, Upload, ExternalLink, Trash2 } from 'lucide-react';
export default function ResumeUploader({ resumeUrl, userId, onUpload, onRemove, busy }) {
    const viewUrl = userId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/resume/me` : '';
    return (<div className="resume-manager">
        <div className="resume-icon">
            <FileText size={24}/>
        </div>
        <div className="resume-copy">
            <b>
                {resumeUrl ? 'Current resume' : 'Add your resume'}
            </b>
            <span>
                {resumeUrl ? 'Your latest PDF is ready for recruiters.' : 'Upload a PDF so recruiters can review your profile.'}
            </span>
            {resumeUrl && <a href={viewUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/> View current resume</a>}
        </div>
        <div className="resume-actions">
            <label className={`btn btn-outline ${busy ? 'disabled' : ''}`}>
                <Upload size={15}/>
                {busy ? 'Uploading…' : resumeUrl ? 'Replace PDF' : 'Upload PDF'}
                <input hidden type="file" accept="application/pdf" disabled={busy} onChange={e => {
                        const file = e.target.files?.[0];
                        if (file)
                onUpload(file);
                        e.target.value = '';
                    }}/>
            </label>
            {resumeUrl && <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove} disabled={busy}><Trash2 size={14}/> Remove</button>}
        </div>
    </div>);
}
