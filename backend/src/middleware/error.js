import { ZodError } from 'zod';
function fieldErrorsFromIssues(issues = []) {
    const fieldErrors = {};
    for (const issue of issues) {
        const key = issue.path?.length ? issue.path.join('.') : '_form';
        if (!fieldErrors[key])
            fieldErrors[key] = issue.message;
    }
    return fieldErrors;
}
function mongooseFieldErrors(error) {
    const fieldErrors = {};
    for (const [path, detail] of Object.entries(error.errors || {})) {
        if (!fieldErrors[path])
            fieldErrors[path] = detail.message;
    }
    return fieldErrors;
}
export function notFound(req, res) {
    res.status(404).json({
        success: false,
        message: `We couldn't find ${req.method} ${req.originalUrl}.`,
        code: 'ROUTE_NOT_FOUND'
    });
}
export function errorHandler(err, req, res, next) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
    if (err instanceof ZodError) {
        const fieldErrors = fieldErrorsFromIssues(err.issues);
        const first = Object.values(fieldErrors)[0] || 'Please check the highlighted fields.';
        return res.status(400).json({
            success: false,
            message: first,
            code: 'VALIDATION_ERROR',
            fieldErrors,
            issues: err.issues.map(({ path, message, code }) => ({ path, message, code }))
        });
    }
    if (err.code === 11000) {
        const paths = Object.keys(err.keyPattern || {});
        const fieldErrors = Object.fromEntries(paths.map((path) => [path, `${path} is already in use.`]));
        return res.status(409).json({
            success: false,
            message: Object.values(fieldErrors)[0] || 'A unique value is already in use.',
            code: 'DUPLICATE_RESOURCE',
            fieldErrors
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'One or more identifiers are invalid.', code: 'INVALID_IDENTIFIER' });
    }
    if (err.name === 'ValidationError') {
        const fieldErrors = mongooseFieldErrors(err);
        return res.status(400).json({
            success: false,
            message: Object.values(fieldErrors)[0] || 'Please correct the highlighted fields.',
            code: 'DATABASE_VALIDATION_ERROR',
            fieldErrors
        });
    }
    if (err.name === 'MulterError') {
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'The uploaded file is too large.' : 'The file upload could not be processed.';
        return res.status(status).json({ success: false, message, code: err.code });
    }
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.statusCode ? err.message : 'Something went wrong on the HireFlow server.',
        code: err.statusCode ? (err.code || 'REQUEST_FAILED') : 'INTERNAL_SERVER_ERROR'
    });
}
