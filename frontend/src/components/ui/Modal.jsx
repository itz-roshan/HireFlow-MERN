import { X } from 'lucide-react';
import { useEffect } from 'react';
export default function Modal({ open, onClose, title, subtitle, children, wide = false }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = e => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    if (!open)
        return null;
    return (<div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
        <section className={`modal-card ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true">
            <button className="modal-close" aria-label="Close" onClick={onClose}>
                <X size={18}/>
            </button>
            <div className="modal-heading">
                <h2>
                    {title}
                </h2>
                {subtitle && <p>
                    {subtitle}
                </p>}
            </div>
            {children}
        </section>
    </div>);
}
