// services/NotificationService.js
const NotificationTemplate = require('../models/NotificationTemplate');
const UserNotificationSettings = require('../models/UserNotificationSettings');
const CompanyNotificationDefaults = require('../models/CompanyNotificationDefaults');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const NotificationLog = require('../models/NotificationLog');

const canSendEmail = async (user, type) => {
    // load user settings and company defaults
    const defaults = await CompanyNotificationDefaults.findOne();
    const userSettings = await UserNotificationSettings.findOne({ user: user._id });

    // decide based on type; e.g. for booking_confirmation:
    const pref =
        userSettings?.preferences?.bookingConfirmation ??
        defaults?.bookingConfirmation ??
        { email: true };

    return !!pref.email;
};

const renderTemplate = (html, context) => {
    // plug in Handlebars/Mustache/etc; for now simple replace example
    return html
        .replace(/{{customerName}}/g, context.customerName)
        .replace(/{{bookingDate}}/g, context.bookingDate);
};

const NotificationService = {
    send: async (type, { booking, user, extra }) => {
        if (!user?.email) return;

        const ok = await canSendEmail(user, type);
        if (!ok) return;

        const template = await NotificationTemplate.findOne({ key: type, enabled: true });
        if (!template) return;

        const context = {
            customerName: booking.customerName,
            bookingDate: booking.startTime.toLocaleString('en-CA', { timeZone: 'America/Toronto' }),
            bookingAddress: booking.location,
            // ... other fields
            ...extra,
        };

        const subject = renderTemplate(template.subject, context);
        const html = renderTemplate(template.html, context);

        const log = await NotificationLog.create({
            user: user._id,
            type,
            channel: 'email',
            to: user.email,
            status: 'pending',
            payload: { bookingId: booking._id },
        });

        try {
            const msg = {
                to: user.email,
                from: 'info@cleanARsolutions.ca',
                subject,
                html,
                text: '', // optional plain text

            }
            sgMail
                .send(msg)
                .then(async (res) => {
                    res.status(201).json({ message: 'Email sent' });
                    log.status = 'sent';
                    log.providerId = res?.headers?.['x-message-id'] || '';
                    await log.save();
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing quote' });
                })

        } catch (err) {
            log.status = 'failed';
            log.error = err.message;
            await log.save();
        }
    },
};

module.exports = NotificationService;
