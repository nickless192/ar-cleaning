const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Booking = require('../models/Booking');
// const { sendConfirmationEmail } = require('../utils/emailService');

const bookingControllers = {
    createBooking: async (req, res) => {
        const {
            customerName,
            customerEmail,
            serviceType,
            date,
            scheduleConfirmation,
            confirmationDate,
            reminderScheduled
        } = req.body;

        if (!customerEmail || !date) return res.status(400).json({ error: 'Missing info' });

        try {
            // 1. Send confirmation
            const newBooking = new Booking({
                customerName,
                customerEmail,
                serviceType,
                date,
                reminderScheduled,
                scheduleConfirmation: scheduleConfirmation && !confirmationDate,
                confirmationDate: confirmationDate || (scheduleConfirmation ? new Date() : null)
            });


            if (!scheduleConfirmation) {
                // await sendConfirmationEmail({ customerName, customerEmail, serviceType, date });
                const msg = {
                    to: customerEmail,
                    from: 'info@cleanarsolutions.ca', // Update with your verified sender
                    subject: '✅ Booking Confirmation - CleanAR Solutions',
                    html: `
                  <h2>Thanks for booking with CleanAR Solutions!</h2>
                  <p>Hi ${customerName},</p>
                  <p>Your service is confirmed for <strong>${date}</strong>.</p>
                  <p>Details:</p>
                  <pre>${serviceType}</pre>
                  <p>We look forward to seeing you then! 🚐🧼</p>
                `
                };

                try {
                    await sgMail.send(msg);
                    console.log(`[Email] Confirmation sent to ${customerEmail}`);
                } catch (err) {
                    console.error('[Email] Failed to send confirmation:', err);
                    throw err;
                }
            }
            // 2. Save booking and schedule reminder

            // const newBooking = await Booking.create({
            //     customerName,
            //     customerEmail,
            //     serviceType,
            //     date,
            //     scheduleConfirmation: true,
            //     reminderScheduled: true,
            // });
            const savedBooking = await newBooking.save();
            res.status(201).json(savedBooking);
        } catch (err) {
            console.error('Error creating booking:', err);
            res.status(500).json({ error: 'Failed to create booking' });
        }

    },
    getBookings: async (req, res) => {
        try {
            const bookings = await Booking.find({}).sort({ date: -1 });
            res.json(bookings);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            res.status(500).json({ error: 'Failed to fetch bookings' });
        }
    },
    deleteBooking: async (req, res) => {
        try {
            const bookingId = req.params.id;
            const deletedBooking = await Booking.findByIdAndDelete(bookingId);
            if (!deletedBooking) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            res.json(deletedBooking);
        } catch (err) {
            console.error('Error deleting booking:', err);
            res.status(500).json({ error: 'Failed to delete booking' });
        }
    },
    sendReminderEmail: async ({ customerEmail, customerName, date, serviceType }) => {
        const msg = {
            to: customerEmail,
            from: 'info@cleanarsolutions.ca', // Same here
            subject: '📅 Reminder: Your Cleaning Appointment is Tomorrow!',
            html: `
            <h2>Your service is almost here!</h2>
            <p>Hi ${customerName},</p>
            <p>This is a friendly reminder that your cleaning appointment is scheduled for <strong>${date}</strong>.</p>
            <p>Details:</p>
            <pre>${serviceType}</pre>
            <p>If you have any questions or need to reschedule, just reply to this email.</p>
            <p>See you soon! 😊</p>
          `
        };

        try {
            await sgMail.send(msg);
            console.log(`[Email] Reminder sent to ${customerEmail}`);
        } catch (err) {
            console.error('[Email] Failed to send reminder:', err);
            throw err;
        }
    }
};

module.exports = bookingControllers;