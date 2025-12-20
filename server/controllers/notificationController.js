// controllers/notificationController.js
// const {
//     NotificationTemplate,
//     UserNotificationSettings,
//     CompanyNotificationDefaults,
// } = require('../models/notificationModels');
const NotificationTemplate = require('../models/NotificationTemplate');
const UserNotificationSettings = require('../models/UserNotificationSettings');
const CompanyNotificationDefaults = require('../models/CompanyNotificationDefaults');

/* ============================
   TEMPLATES CONTROLLERS
============================ */

const getTemplates = async (req, res) => {
    try {
        const templates = await NotificationTemplate.find().sort({ key: 1 });
        return res.status(200).json(templates);
    } catch (err) {
        console.error('[NotificationController] getTemplates error:', err);
        return res.status(500).json({ message: 'Failed to fetch templates.' });
    }
};

const createTemplate = async (req, res) => {
    try {
        const { key, name, type, subject, html, enabled } = req.body;

        const existing = await NotificationTemplate.findOne({ key });
        if (existing) {
            return res
                .status(400)
                .json({ message: 'Template with this key already exists.' });
        }

        const template = await NotificationTemplate.create({
            key,
            name,
            type,
            subject,
            html,
            enabled,
        });

        return res.status(201).json(template);
    } catch (err) {
        console.error('[NotificationController] createTemplate error:', err);
        return res
            .status(500)
            .json({ message: 'Failed to create template.', error: err.message });
    }
};

const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, subject, html, enabled } = req.body;

        const template = await NotificationTemplate.findByIdAndUpdate(
            id,
            { name, type, subject, html, enabled },
            { new: true }
        );

        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }

        return res.status(200).json(template);
    } catch (err) {
        console.error('[NotificationController] updateTemplate error:', err);
        return res
            .status(500)
            .json({ message: 'Failed to update template.', error: err.message });
    }
};

/* ============================
   USER SETTINGS CONTROLLERS
============================ */

// assumes you have authMiddleware that sets req.user
const getMyNotificationSettings = async (req, res) => {
    try {
        const userId = req.user._id;

        let settings = await UserNotificationSettings.findOne({
            user: userId,
        }).lean();

        if (!settings) {
            // no custom user settings yet, maybe fetch company defaults for UI
            const companyDefaults =
                (await CompanyNotificationDefaults.findOne().lean()) || null;
            return res.status(200).json({
                user: userId,
                preferences: {},
                companyDefaults,
            });
        }

        return res.status(200).json(settings);
    } catch (err) {
        console.error(
            '[NotificationController] getMyNotificationSettings error:',
            err
        );
        return res.status(500).json({
            message: 'Failed to fetch notification settings.',
            error: err.message,
        });
    }
};

const updateMyNotificationSettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const preferences = req.body.preferences || {};

        const settings = await UserNotificationSettings.findOneAndUpdate(
            { user: userId },
            { preferences },
            { upsert: true, new: true }
        );

        return res.status(200).json(settings);
    } catch (err) {
        console.error(
            '[NotificationController] updateMyNotificationSettings error:',
            err
        );
        return res.status(500).json({
            message: 'Failed to update notification settings.',
            error: err.message,
        });
    }
};

/* ============================
   COMPANY DEFAULTS CONTROLLERS
============================ */

const getCompanyNotificationDefaults = async (req, res) => {
    try {
        let defaults = await CompanyNotificationDefaults.findOne().lean();

        if (!defaults) {
            defaults = await CompanyNotificationDefaults.create({});
        }

        return res.status(200).json(defaults);
    } catch (err) {
        console.error(
            '[NotificationController] getCompanyNotificationDefaults error:',
            err
        );
        return res.status(500).json({
            message: 'Failed to fetch company notification defaults.',
            error: err.message,
        });
    }
};

const updateCompanyNotificationDefaults = async (req, res) => {
    try {
        const body = req.body || {};

        // there should only be one document; use findOneAndUpdate with upsert
        const defaults = await CompanyNotificationDefaults.findOneAndUpdate(
            {},
            body,
            { upsert: true, new: true }
        );

        return res.status(200).json(defaults);
    } catch (err) {
        console.error(
            '[NotificationController] updateCompanyNotificationDefaults error:',
            err
        );
        return res.status(500).json({
            message: 'Failed to update company notification defaults.',
            error: err.message,
        });
    }
};

const testSendTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user; // assumes authMiddleware sets this

        if (!user || !user.email) {
            return res
                .status(400)
                .json({ message: 'Logged-in user with a valid email is required.' });
        }

        const template = await NotificationTemplate.findById(id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }

        // Example context – future you & Omar will know what keys are available
        const context = {
            customerName: 'Test Customer',
            adminName: user.name || 'Admin',
            bookingId: 'TEST-123',
            bookingDateTime: 'Jan 1, 2026, 10:00 AM',
            bookingAddress: '123 Test Street, Toronto',
            bookingStatus: 'confirmed',
            bookingNotes: 'This is a test booking.',
            bookingsCount: 3,
            days: 7,
            bookingsListHtml:
                '<ul><li>Test booking 1</li><li>Test booking 2</li><li>Test booking 3</li></ul>',
        };

        await NotificationService.sendNotificationEmail(template.key, {
            user,
            context,
        });

        return res.status(200).json({
            message: `Test email sent to ${user.email}`,
        });
    } catch (err) {
        console.error(
            '[NotificationController] testSendTemplate error:',
            err
        );
        return res.status(500).json({
            message: 'Failed to send test email.',
            error: err.message,
        });
    }
};

module.exports = {
    // templates
    getTemplates,
    createTemplate,
    updateTemplate,
    testSendTemplate,

    // user settings
    getMyNotificationSettings,
    updateMyNotificationSettings,

    // company defaults
    getCompanyNotificationDefaults,
    updateCompanyNotificationDefaults,

};
