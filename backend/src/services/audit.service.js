import AuditLog from '../models/AuditLog.js';
export const audit = (actor, action, entityType, entityId, metadata = {}) => AuditLog.create({ actor, action, entityType, entityId, metadata });
