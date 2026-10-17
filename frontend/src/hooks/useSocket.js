import { useSocketContext } from '../context/SocketContext';
export function useSocket() {
    return useSocketContext()?.socket || null;
}
