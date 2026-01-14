// services/notificationService.js
const NotificationTemplate = require('../models/NotificationTemplate');
const UserNotificationSettings = require('../models/UserNotificationSettings');
const CompanyNotificationDefaults = require('../models/CompanyNotificationDefaults');
const { sendMail} = require('../utils/mailer.js');
const NotificationLog = require('../models/NotificationLog');
const User = require('../models/User');
const Booking = require('../models/Booking'); // adjust path if needed

/* ============================
   HELPERS
============================ */

const formatDateTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleString('en-CA', {
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const renderTemplateString = (template, context = {}) => {
    if (!template) return '';

    // Very simple {{key}} replacement
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
        return context[key] !== undefined && context[key] !== null
            ? String(context[key])
            : '';
    });
};

// Map template key -> user preference key in UserNotificationSettings.preferences
const resolvePreferenceKey = (templateKey) => {
    switch (templateKey) {
        case 'booking_confirmation_customer':
            return 'bookingConfirmation';
        case 'booking_reminder_customer':
            return 'bookingReminder';
        case 'admin_upcoming_bookings_digest':
            return 'adminUpcomingBookings';
        default:
            // fallback for any marketing/lifecycle email
            return 'marketing';
    }
};

const getCompanyDefaultsDoc = async () => {
    let defaults = await CompanyNotificationDefaults.findOne();
    if (!defaults) {
        defaults = await CompanyNotificationDefaults.create({});
    }
    return defaults;
};

const getUserSettingsDoc = async (userId) => {
    if (!userId) return null;
    return UserNotificationSettings.findOne({ user: userId });
};

const shouldSendEmailForTemplate = async (template, user) => {
    if (!user || !user.email) return false;
    if (!template?.enabled) return false;

    const prefKey = resolvePreferenceKey(template.key);
    const [defaults, userSettings] = await Promise.all([
        getCompanyDefaultsDoc(),
        getUserSettingsDoc(user._id),
    ]);

    const userPrefs = userSettings?.preferences || {};
    const company = defaults || {};

    // Base object for this preference
    const userPref = userPrefs[prefKey];
    const companyPref =
        (company[prefKey] && company[prefKey]) ||
        (company.marketing && prefKey === 'marketing' ? company.marketing : null);

    // Transactional emails: usually always on, unless user explicitly turned off
    if (template.type === 'transactional') {
        if (userPref && userPref.email === false) return false;
        return true; // default allowed
    }

    // Marketing emails: require consent
    // Priority: user pref -> company default -> default true
    if (template.type === 'marketing') {
        if (userPref && userPref.email !== undefined) {
            return !!userPref.email;
        }

        if (companyPref && companyPref.enabled !== undefined) {
            return !!companyPref.enabled;
        }

        return true; // fallback
    }

    // Fallback – be safe and allow
    return true;
};

/* ============================
   CORE SEND FUNCTION
============================ */

const sendNotificationEmail = async (templateKey, { user, to, context = {} }) => {
    if (!user && !to) return;

    // 1) Load template
    const template = await NotificationTemplate.findOne({
        key: templateKey,
        enabled: true,
    });

    if (!template) {
        console.warn(
            `[NotificationService] No template found for key: ${templateKey}`
        );
        return;
    }

    // 2) Decide recipient
    const recipient = to || user?.email;
    if (!recipient) return;

    // 3) Check preferences
    const canSend = user ? await shouldSendEmailForTemplate(template, user) : true;
    if (!canSend) {
        console.log(
            `[NotificationService] Email suppressed by preferences for user=${user?._id} template=${templateKey}`
        );
        return;
    }

    // 4) Render subject + html
    const subject = renderTemplateString(template.subject, context);
    const html = renderTemplateString(template.html, context);
    const text = ''; // optional: could generate a plain-text version

    // 5) Create log (queued)
    const log = await NotificationLog.create({
        user: user?._id || null,
        type: template.key,
        channel: 'email',
        to: recipient,
        status: 'queued',
        payload: context,
    });

    try {
        const response = await sendMail({
            to: recipient,
            subject,
            text,
            html,
        });

        log.status = 'sent';
        log.providerId = response?.headers?.['x-message-id'] || '';
        await log.save();
    } catch (err) {
        console.error('[NotificationService] Failed to send email:', err);
        log.status = 'failed';
        log.error = err.message;
        await log.save();
    }
};

/* ============================
   DOMAIN-SPECIFIC HELPERS
============================ */

// 1) Customer booking confirmation
const sendBookingConfirmationCustomer = async (bookingId) => {
    const booking = await Booking.findById(bookingId).populate('customer');
    if (!booking) return;

    const customer = booking.customer || null;
    if (!customer) return;

    const context = {
        customerName: booking.customerName || customer.name || '',
        bookingId: booking._id.toString(),
        bookingDateTime: formatDateTime(booking.startTime),
        bookingAddress: booking.location || '',
        bookingStatus: booking.status,
        bookingNotes: booking.notes || '',
    };

    await sendNotificationEmail('booking_confirmation_customer', {
        user: customer,
        context,
    });
};

// 2) Customer booking reminder (e.g. 24h before)
const sendBookingReminderCustomer = async (bookingId) => {
    const booking = await Booking.findById(bookingId).populate('customer');
    if (!booking) return;

    const customer = booking.customer || null;
    if (!customer) return;

    const context = {
        customerName: booking.customerName || customer.name || '',
        bookingId: booking._id.toString(),
        bookingDateTime: formatDateTime(booking.startTime),
        bookingAddress: booking.location || '',
        bookingStatus: booking.status,
        bookingNotes: booking.notes || '',
    };

    await sendNotificationEmail('booking_reminder_customer', {
        user: customer,
        context,
    });
};

// 3) Admin upcoming bookings digest (per admin)
const sendAdminUpcomingBookingsDigest = async ({ admins, bookings, days }) => {
    if (!admins || !admins.length) return;

    // Build HTML for list of bookings – you can also push this into the template
    const listHtml = bookings
        .map((b) => {
            return `
                <li>
                    <strong>${formatDateTime(b.startTime)}</strong><br/>
                    Customer: ${b.customerName || 'N/A'}<br/>
                    Status: ${b.status}<br/>
                    ${b.location ? `Location: ${b.location}<br/>` : ''}
                    ${b.notes ? `Notes: ${b.notes}<br/>` : ''}
                </li>
            `;
        })
        .join('');

    const contextBase = {
        days,
        bookingsCount: bookings.length,
        bookingsListHtml: `<ul>${listHtml}</ul>`,
    };

    // You might want to personalize per admin later (name, etc.)
    for (const admin of admins) {
        const context = {
            ...contextBase,
            adminName: admin.name || '',
        };

        await sendNotificationEmail('admin_upcoming_bookings_digest', {
            user: admin,
            context,
        });
    }
};

/* ============================
   FIND BOOKINGS & TRIGGER DIGEST
   (for cron / controllers)
============================ */

const sendAdminUpcomingBookingsDigestForPeriod = async (days = 1) => {
    const now = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);

    const bookings = await Booking.find({
        startTime: { $gte: now, $lte: to },
        status: { $in: ['confirmed', 'pending'] },
    })
        .sort({ startTime: 1 })
        .lean();

    const admins = await User.find({
        adminFlag: true,
        email: { $exists: true, $ne: '' },
    }).lean();
    console.log(`[NotificationService] Found ${admins.length} admins and ${bookings.length} bookings for upcoming digest. days=${days}`);

    if (!admins.length || !bookings.length) {
        console.log(
            `[NotificationService] No admins or bookings found for upcoming digest. days=${days}`
        );
        return;
    }

    await sendAdminUpcomingBookingsDigest({ admins, bookings, days });
};

module.exports = {
    sendNotificationEmail,
    sendBookingConfirmationCustomer,
    sendBookingReminderCustomer,
    sendAdminUpcomingBookingsDigest,
    sendAdminUpcomingBookingsDigestForPeriod,
    formatDateTime,
};
