import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
export default function AdminAuditLogsPage() {
    const { data } = useFetch(() => api.get('/admin/audit-logs'), []);
    const logs = data?.logs || [];
    return (<DashboardLayout>
        <div className="dash-head">
            <div>
                <div className="eyebrow">ADMIN · AUDIT</div>
                <h1>Audit history</h1>
                <p>A factual trail of sensitive platform actions.</p>
            </div>
        </div>
        <section className="panel">
            {logs.length ? <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>When</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>Metadata</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(l => (<tr key={l._id}>
                            <td>
                                {new Date(l.createdAt).toLocaleString()}
                            </td>
                            <td>
                                <b>
                                    {l.actor?.name || 'System'}
                                </b>
                                <span>
                                    {l.actor?.email || ''}
                                </span>
                            </td>
                            <td>
                                <span className="badge">
                                    {l.action}
                                </span>
                            </td>
                            <td>
                                {l.entityType}
                                <span>
                                    {String(l.entityId || '')}
                                </span>
                            </td>
                            <td>
                                <code>
                                    {JSON.stringify(l.metadata || {})}
                                </code>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div> : <EmptyState title="No audit events" message="Sensitive actions will be logged here."/>}
        </section>
    </DashboardLayout>);
}
