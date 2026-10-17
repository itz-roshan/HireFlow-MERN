import Notification from '../models/Notification.js';
let io = null;
export const setNotificationIO = v => {
    io = v;
};
export async function notify(user, type, title, message, link = '') {
    const n = await Notification.create({ user, type, title, message, link });
    io?.to(`user:${user}`).emit('notification:new', n);
    return n;
}
