export default function StatusBadge({ status }) {
    const tone = status === 'HIRED' ? 'success' : ['REJECTED', 'WITHDRAWN'].includes(status) ? 'danger' : '';
    return (<span className={`status-pill ${tone}`}>
        {String(status || 'UNKNOWN').replace(/_/g, ' ')}
    </span>);
}
