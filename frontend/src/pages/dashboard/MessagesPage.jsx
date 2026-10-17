import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../api/client';
import MessageBubble from '../../components/chat/MessageBubble';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { Plus, MessageCircle, Send, UserRound, Wifi, WifiOff } from 'lucide-react';
// Support both Mongo documents (_id) and API user objects (id).
const entityId = (value) => {
    if (!value)
        return '';
    if (typeof value === 'string' || typeof value === 'number')
        return String(value);
    return String(value._id ?? value.id ?? '');
};
export default function MessagesPage() {
    const { user } = useAuth();
    const socket = useSocket();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedConversationId = searchParams.get('conversation');
    const currentUserId = entityId(user);
    const [list, setList] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [body, setBody] = useState('');
    const [personId, setPersonId] = useState('');
    const [toast, setToast] = useState('');
    const [socketStatus, setSocketStatus] = useState('connecting');
    const otherName = useMemo(() => active?.participants?.find((person) => entityId(person) !== currentUserId)?.name || 'Conversation', [active, currentUserId]);
    const refresh = useCallback(async () => {
        try {
            const response = await api.get('/messages/conversations');
            setList(response.data.data.conversations || []);
        }
        catch (error) {
            if (error.response?.status !== 401) {
                setToast(error.response?.data?.message || 'Could not load conversations.');
            }
        }
    }, []);
    useEffect(() => {
        refresh();
    }, [refresh]);
    useEffect(() => {
        if (!requestedConversationId || !list.length)
            return;
        const found = list.find((conversation) => conversation._id === requestedConversationId);
        if (found && active?._id !== found._id)
            setActive(found);
    }, [requestedConversationId, list, active?._id]);
    useEffect(() => {
        if (!socket) {
            setSocketStatus('connecting');
            return undefined;
        }
        const onConnect = () => setSocketStatus('live');
        const onDisconnect = () => setSocketStatus('offline');
        const onConnectError = () => setSocketStatus('offline');
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        setSocketStatus(socket.connected ? 'live' : 'connecting');
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
        };
    }, [socket]);
    useEffect(() => {
        const activeId = active?._id;
        if (!activeId) {
            setMessages([]);
            return undefined;
        }
        let cancelled = false;
        setMessages([]);
        api.get(`/messages/conversations/${activeId}`)
            .then((response) => {
            if (!cancelled)
                setMessages(response.data.data.messages || []);
        })
            .catch((error) => {
            if (!cancelled) {
                setMessages([]);
                setToast(error.response?.data?.message || 'Could not load this conversation.');
            }
        });
        socket?.emit('conversation:join', activeId);
        return () => {
            cancelled = true;
            socket?.emit('conversation:leave', activeId);
        };
    }, [active?._id, socket]);
    useEffect(() => {
        if (!socket)
            return undefined;
        const onMessage = (message) => {
            const conversationId = typeof message.conversation === 'string'
                ? message.conversation
                : message.conversation?._id;
            if (String(conversationId) === String(active?._id)) {
                setMessages((current) => current.some((item) => item._id === message._id)
                    ? current
                    : [...current, message]);
            }
            refresh();
        };
        const onMessageError = ({ message }) => setToast(message || 'Message could not be sent.');
        socket.on('message:new', onMessage);
        socket.on('message:error', onMessageError);
        return () => {
            socket.off('message:new', onMessage);
            socket.off('message:error', onMessageError);
        };
    }, [socket, active?._id, refresh]);
    const selectConversation = (conversation) => {
        setActive(conversation);
        setSearchParams({ conversation: conversation._id });
    };
    const create = async () => {
        const id = personId.trim();
        if (!id)
            return setToast('Enter the candidate or recruiter user ID to start a conversation.');
        try {
            const response = await api.post('/messages/conversations', { userId: id });
            const conversation = response.data.data.conversation;
            setList((current) => [conversation, ...current.filter((item) => item._id !== conversation._id)]);
            setActive(conversation);
            setSearchParams({ conversation: conversation._id });
            setPersonId('');
        }
        catch (error) {
            setToast(error.response?.data?.message || 'Could not start conversation.');
        }
    };
    const send = () => {
        const text = body.trim();
        if (!text || !active)
            return;
        if (!socket?.connected) {
            setToast('Messaging is offline. Open HireFlow at http://localhost:5173 and check that the backend is running.');
            return;
        }
        socket.emit('message:send', { conversationId: active._id, body: text }, (result) => {
            if (!result?.ok) {
                setToast(result?.message || 'Could not send message.');
                return;
            }
            const sentMessage = result.message;
            if (sentMessage) {
                setMessages((current) => current.some((item) => item._id === sentMessage._id)
                    ? current
                    : [...current, sentMessage]);
            }
            setBody('');
            refresh();
        });
    };
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">MESSAGES</div>
                <h1>Conversations</h1>
                <p>Keep candidate and recruiter communication in one calm, professional place.</p>
            </div>
            <div
                className="chat-connection"
                title={socketStatus === 'offline' ? 'Check the app hostname and backend server.' : ''}
            >
                {socketStatus === 'live'
            ? <><Wifi size={14}/> Live</>
            : <><WifiOff size={14}/> {socketStatus === 'offline' ? 'Offline' : 'Connecting…'}</>}
            </div>
        </div>
        {socketStatus === 'offline' && (<div className="alert warning" role="status">
          Live messaging is disconnected. Use <b>http://localhost:5173</b> consistently and make sure the backend is running on port 5000.
        </div>)}
        <div className="chat-shell">
            <aside className="chat-list">
                <div className="chat-new">
                    <input
                        value={personId}
                        onChange={(event) => setPersonId(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && create()}
                        placeholder="Candidate/recruiter user ID"
                        aria-label="Candidate or recruiter user ID"
                    />
                    <button className="btn btn-primary btn-sm" onClick={create} aria-label="Start conversation">
                        <Plus size={15}/>
                    </button>
                </div>
                {list.length ? list.map((conversation) => (<button
                    key={conversation._id}
                    className={active?._id === conversation._id ? 'active' : ''}
                    onClick={() => selectConversation(conversation)}
                >
                    <MessageCircle />
                    <div>
                        <b>
                            {conversation.participants.filter((person) => entityId(person) !== currentUserId).map((person) => person.name).join(', ') || 'Conversation'}
                        </b>
                        <span>
                            {conversation.lastMessage || 'Start a conversation'}
                        </span>
                    </div>
                </button>)) : (<EmptyState
                    title="No conversations"
                    message="Message a recruiter from a job page or a candidate from the applicant workspace."
                />)}
            </aside>
            <section className="chat-main">
                {active ? <>
                    <div className="chat-head">
                        <b>
                            {otherName}
                        </b>
                        <span className="muted"> · private conversation</span>
                    </div>
                    <div className="messages">
                        {messages.length
                ? messages.map((message) => (<MessageBubble
                            key={message._id}
                            message={message}
                            mine={entityId(message.sender) === currentUserId}
                        />))
                : <div className="chat-placeholder">
                            <UserRound size={34}/>
                            <h3>Start the conversation</h3>
                            <p>Keep the first message specific and respectful.</p>
                        </div>}
                    </div>
                    <div className="chat-compose">
                        <input
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && send()}
                            placeholder="Write a thoughtful message…"
                            maxLength={2000}
                            disabled={socketStatus !== 'live'}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={send}
                            aria-label="Send message"
                            disabled={!socket?.connected || !body.trim()}
                        >
                            <Send size={16}/>
                        </button>
                    </div>
                </> : <div className="chat-placeholder">
                    <MessageCircle size={40}/>
                    <h3>Select a conversation</h3>
                    <p>Your messages will appear here.</p>
                </div>}
            </section>
        </div>
        <Toast message={toast} onClose={() => setToast('')}/>
    </DashboardLayout>);
}
