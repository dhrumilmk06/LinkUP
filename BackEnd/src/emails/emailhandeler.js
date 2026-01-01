import { resendClient, sender } from "../lib/resend.js"
import {createWelcomeEmailTemplate} from '../emails/emailtemplate.js'


export const sendWelcomeEmail = async (email, name, clientURL) => {
    try {
        const fromHeader = sender.name ? `${sender.name} <${sender.email}>` : sender.email

        const res = await resendClient.emails.send({
            from: fromHeader,
            to: email,
            subject: 'Welcome to LinkUP!',
            html: createWelcomeEmailTemplate(name, clientURL)
        })

        // The Resend client may return an object like { data, error } instead of throwing.
        if (res?.error) {
            const err = res.error
            if (err?.statusCode === 403 && /verify a domain/i.test(err?.message)) {
                console.error("Resend validation error: You must verify a sending domain at https://resend.com/domains and set EMAIL_FROM to an email on that domain. Original error:", err)
            } else {
                console.error("Resend returned an error while sending Welcome Email:", err)
            }
            throw new Error("Failed to send Welcome Email: " + (err?.message || JSON.stringify(err)))
        }

        console.log("Welcome Email Sent Successfully", res.data)
        return res.data
    } catch (err) {
        if (err?.statusCode === 403 && /verify a domain/i.test(err?.message)) {
            console.error("Resend validation error: You must verify a sending domain at https://resend.com/domains and set EMAIL_FROM to an email on that domain. Original error:", err)
        } else {
            console.error("Error sending Welcome Email:", err)
        }
        throw new Error("Failed to send Welcome Email: " + (err?.message || err))
    }
}