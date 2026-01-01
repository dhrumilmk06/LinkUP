import { Resend } from "resend";
import { ENV } from "./env.js";
import 'dotenv/config'

if (!ENV.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY environment variable. Set RESEND_API_KEY in your .env or environment.');
}

export const resendClient = new Resend(ENV.RESEND_API_KEY)

// Helper to trim and strip surrounding quotes
const sanitizeEnv = (v) => {
    if (!v) return ''
    return String(v).trim().replace(/^['"]+|['"]+$/g, '')
}

const rawEmailFrom = ENV.EMAIL_FROM
const emailFrom = sanitizeEnv(rawEmailFrom)
if (!emailFrom) {
    throw new Error('Missing EMAIL_FROM environment variable. Set EMAIL_FROM to a verified email (example: no-reply@yourdomain.com). Note: avoid including surrounding quotes in the .env value.');
}

// Basic validation for the email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(emailFrom)) {
    throw new Error(`Invalid EMAIL_FROM value (${String(rawEmailFrom)}). It must be a valid email like no-reply@yourdomain.com. Remove extra characters and surrounding quotes if present.`)
}

const rawName = ENV.EMAIL_FROM_NAME
const name = sanitizeEnv(rawName)

// Helpful warning: common gotcha is using an unverified sample domain like "resend.dev"
if (emailFrom.endsWith('@resend.dev')) {
    console.warn('Warning: EMAIL_FROM is using the resend.dev domain. To send to arbitrary recipients, verify your sending domain at https://resend.com/domains and update EMAIL_FROM to an address at that domain.');
}

export const sender = {
    email: emailFrom,
    name: name || ''
}