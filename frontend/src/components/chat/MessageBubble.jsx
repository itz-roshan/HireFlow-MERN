export default function MessageBubble({ message, mine }) {
    return (<div className={`message ${mine ? 'mine' : ''}`}>
        <b>
            {message.sender?.name || 'Participant'}
        </b>
        <p>
            {message.body}
        </p>
        <span>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
    </div>);
}
