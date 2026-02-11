// utils/mailer.js
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ to, subject, text, html }) => {
    const msg = {
        to,
        from: process.env.MAIL_FROM || 'info@cleanarsolutions.ca',
        subject,
        text,
        html,
    };

    const [response] = await sgMail.send(msg);
    return response;
};

module.exports = { sendMail };
