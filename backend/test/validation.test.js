import test from 'node:test';
import assert from 'node:assert/strict';
import { jobSchema, statusSchema } from '../src/validators/job.js';
import { passwordSchema, registerSchema } from '../src/validators/auth.js';
const validRegistration = {
    name: 'Roshan Kumar',
    email: 'roshan@example.com',
    password: 'Password123',
    role: 'JOB_SEEKER'
};
test('job schema rejects a reversed salary range', () => {
    assert.throws(() => jobSchema.parse({
        title: 'React Developer',
        description: 'A'.repeat(50),
        location: 'Delhi',
        workMode: 'REMOTE',
        type: 'FULL_TIME',
        minSalary: 900000,
        maxSalary: 500000,
        skills: ['React'],
        category: 'Engineering'
    }));
});
test('job status schema rejects recruiter withdrawal status', () => {
    assert.throws(() => statusSchema.parse({ status: 'WITHDRAWN' }));
});
test('password schema rejects a weak replacement password', () => {
    assert.throws(() => passwordSchema.parse({
        currentPassword: 'Old@1234',
        newPassword: 'short'
    }));
});
test('job seeker registration works without a company name', () => {
    const result = registerSchema.parse({
        ...validRegistration,
        companyName: ''
    });
    assert.equal(result.role, 'JOB_SEEKER');
    assert.equal(result.companyName, undefined);
});
test('job seeker registration works when companyName is omitted', () => {
    const result = registerSchema.parse(validRegistration);
    assert.equal(result.role, 'JOB_SEEKER');
    assert.equal(result.companyName, undefined);
});
test('recruiter registration requires a company name', () => {
    assert.throws(() => registerSchema.parse({
        ...validRegistration,
        role: 'RECRUITER',
        companyName: ''
    }), (error) => error.issues.some((issue) => issue.path[0] === 'companyName' &&
        issue.message === 'Company name must be at least 2 characters.'));
});
test('recruiter registration accepts a valid company name', () => {
    const result = registerSchema.parse({
        ...validRegistration,
        role: 'RECRUITER',
        companyName: 'HireFlow Labs'
    });
    assert.equal(result.role, 'RECRUITER');
    assert.equal(result.companyName, 'HireFlow Labs');
});
