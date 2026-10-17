import { SearchX } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', message = 'Try another option or come back later.' }) {
    return (<div className="empty-state">
        <SearchX size={42}/>
        <h3>
            {title}
        </h3>
        <p>
            {message}
        </p>
    </div>);
}
