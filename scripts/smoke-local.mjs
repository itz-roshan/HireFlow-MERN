const base = process.env.SMOKE_BASE_URL || 'http://localhost:5000';
function parseCookies(headers) {
    const raw = headers.getSetCookie?.() || [];
    return raw.map((x) => x.split(';')[0]).join('; ');
}
async function request(path, options = {}, cookie = '') {
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    if (cookie)
        headers.set('Cookie', cookie);
    if (options.body && !headers.has('Content-Type'))
        headers.set('Content-Type', 'application/json');
    const res = await fetch(`${base}${path}`, { ...options, headers });
    const text = await res.text();
    let body = {};
    try {
        body = text ? JSON.parse(text) : {};
    }
    catch {
        body = { raw: text };
    }
    return { res, body };
}
function assertOk(name, result) {
    if (!result.res.ok || result.body.success === false)
        throw new Error(`${name} failed: HTTP ${result.res.status} ${result.body.message || ''}`);
}
async function login(email, password) {
    const result = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    assertOk(`login ${email}`, result);
    return parseCookies(result.res.headers);
}
try {
    const health = await request('/api/health');
    assertOk('API health', health);
    const db = await request('/api/health/db');
    assertOk('DB health', db);
    const jobs = await request('/api/jobs?search=React&page=1&limit=5');
    assertOk('job search', jobs);
    const job = jobs.body.data?.jobs?.[0];
    if (!job?._id)
        throw new Error('Seed smoke test expected a React job');
    const candidateCookie = await login('user@hireflow.local', 'User@12345');
    const me = await request('/api/auth/me', {}, candidateCookie);
    assertOk('candidate me', me);
    const notifications = await request('/api/notifications', {}, candidateCookie);
    assertOk('candidate notifications', notifications);
    if ((notifications.body.data?.notifications || []).length < 1)
        throw new Error('Expected seeded candidate notifications');
    const saved = await request(`/api/saved-jobs/${job._id}`, { method: 'POST' }, candidateCookie);
    assertOk('save job', saved);
    const apply = await request('/api/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId: job._id, coverLetter: 'Smoke test application.', expectedSalary: 700000, noticePeriod: 'Immediate' })
    }, candidateCookie);
    assertOk('apply job', apply);
    const applicationId = apply.body.data?.application?._id;
    if (!applicationId)
        throw new Error('Application id missing from apply response');
    const recruiterCookie = await login('recruiter@hireflow.local', 'Recruiter@12345');
    const applicants = await request('/api/applications/recruiter', {}, recruiterCookie);
    assertOk('recruiter applicants', applicants);
    const app = (applicants.body.data?.applications || []).find((x) => x._id === applicationId);
    if (!app)
        throw new Error('Recruiter could not fetch newly created application');
    const status = await request(
        `/api/applications/${applicationId}/status`,
        {
            method: 'PATCH',
            body: JSON.stringify({ status: 'UNDER_REVIEW', note: 'Smoke test' })
        },
        recruiterCookie
    );
    assertOk('application status', status);
    const interviewDate = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const interview = await request('/api/interviews', {
        method: 'POST',
        body: JSON.stringify({
            applicationId,
            date: interviewDate.toISOString(),
            duration: 30,
            type: 'ONLINE',
            meetingLink: 'https://meet.google.com/smoke-test'
        })
    }, recruiterCookie);
    assertOk('schedule interview', interview);
    const candidateAfterInterview = await request('/api/interviews', {}, candidateCookie);
    assertOk('candidate interviews', candidateAfterInterview);
    if ((candidateAfterInterview.body.data?.interviews || []).length < 1)
        throw new Error('Candidate could not fetch scheduled interview');
    const adminCookie = await login('admin@hireflow.local', 'Admin@12345');
    const overview = await request('/api/admin/overview', {}, adminCookie);
    assertOk('admin overview', overview);
    const reports = await request('/api/admin/reports', {}, adminCookie);
    assertOk('admin reports', reports);
    console.log('SMOKE PASS: health → DB → search → candidate → save → apply → recruiter → status → interview → candidate fetch → admin fetch.');
}
catch (error) {
    console.error(`SMOKE FAIL: ${error.message}`);
    process.exitCode = 1;
}
