import Modal from '../ui/Modal';
import { AlertTriangle } from 'lucide-react';
export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm', busy = false }) {
    return (<Modal open={open} onClose={onClose} title={title} subtitle="Please confirm before continuing.">
        <div className="confirm-dialog">
            <div className="confirm-icon">
                <AlertTriangle size={22}/>
            </div>
            <p>
                {message}
            </p>
            <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={busy}>
                    {busy ? 'Working…' : confirmLabel}
                </button>
            </div>
        </div>
    </Modal>);
}
