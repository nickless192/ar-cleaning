const sgMail = require('@sendgrid/mail');
const { DateTime } = require('luxon');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Booking = require('../models/Booking');
// const { sendConfirmationEmail } = require('../utils/emailService');

const sendReminderEmail = async ({ customerEmail, customerName, date, serviceType }) => {

    const torontoDate = DateTime.fromJSDate(date, { zone: 'utc' }).setZone('America/Toronto');

    const subjectDate = torontoDate.toLocaleString({
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const formattedDateTime = torontoDate.toLocaleString({
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const msg = {
        to: customerEmail,
        from: 'info@cleanarsolutions.ca', // Same here
        subject: `📅[REMINDER] CleanAR Solutions: Cleaning Service Confirmation for ${subjectDate}`,
        html: `
            <h2>Your service is almost here!</h2>
            <p>Hi ${customerName},</p>
            <p>This is a friendly reminder that your cleaning appointment is scheduled for <strong>${formattedDateTime}</strong>.</p>
            <p>Details:</p>
            <p>${serviceType}</p>
            <p>Please don't hesitate to reach out if you have any questions or need help preparing the area.</p>
            <p>Thank you for your cooperation, and we look forward to providing you with excellent service!</p>
            <p>See you soon! 😊</p>
            <table style="width:100%; font-family: Arial, sans-serif; font-size:14px; border-collapse: collapse;">
  <tr>
    <td style="vertical-align: top; width: 50%; padding-right: 10px;">
      <strong>The CleanAR Solutions Team</strong><br>
      📞 (437) 440-5514<br>
      📧 <a href="mailto:info@cleanARsolutions.ca">info@cleanARsolutions.ca</a><br>
      🌐 <a href="https://www.cleanARsolutions.ca/index" target="_blank">www.cleanARsolutions.ca/index</a>
    </td>

    <td style="vertical-align: top; width: 50%; padding-left: 10px;">
      📱 <a href="https://www.instagram.com/cleanarsolutions/" target="_blank">Follow us on Instagram</a><br>
      💲 Refer a friend and get 10% off their first service!<br>
      😄 <a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noopener noreferrer">Leave us a review!</a>
    </td>
  </tr>
</table>

          `
    };

    try {
        await sgMail.send(msg);
        console.log(`[Email] Reminder sent to ${customerEmail}`);
    } catch (err) {
        console.error('[Email] Failed to send reminder:', err);
        throw err;
    }
};

const bookingControllers = {
    createBooking: async (req, res) => {
        const {
            customerName,
            customerEmail,
            serviceType,
            date,
            scheduleConfirmation,
            confirmationDate,
            reminderScheduled,
            disableConfirmation,
            income
        } = req.body;

        const torontoLocal = DateTime.fromISO(date, { zone: 'America/Toronto' });
        const parsedDate = new Date(torontoLocal);

        if (!customerEmail || !date) return res.status(400).json({ error: 'Missing info' });

        try {
            // 1. Send confirmation
            const newBooking = new Booking({
                customerName,
                customerEmail,
                serviceType,
                date: parsedDate,
                reminderScheduled,
                scheduleConfirmation: scheduleConfirmation || !confirmationDate,
                confirmationDate: confirmationDate || (scheduleConfirmation ? new Date() : null),
                reminderDate: null,
                confirmationSent: false,
                reminderSent: false,
                disableConfirmation: disableConfirmation || false,
                income: income || 0
            });


            if (!scheduleConfirmation && !disableConfirmation) {
                // await sendConfirmationEmail({ customerName, customerEmail, serviceType, date });
                const torontoDate = DateTime.fromJSDate(parsedDate, { zone: 'utc' }).setZone('America/Toronto');
                const subjectDate = torontoDate.toLocaleString({
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

                const formattedDateTime = torontoDate.toLocaleString({
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                const msg = {
                    to: customerEmail,
                    from: 'info@cleanarsolutions.ca', // Update with your verified sender
                    subject: `✅ CleanAR Solutions: Booking Confirmation for ${subjectDate}`,
                    html: `
                  <h2>Thanks for booking with CleanAR Solutions!</h2>
                  <p>Hi ${customerName},</p>
                  <p>Your service is confirmed for <strong>${formattedDateTime}</strong>.</p>
                  <p>Details:</p>
                  <p>${serviceType}</p>
                  <p>We look forward to seeing you then! 🚐🧼</p>
                  <table style="width:100%; font-family: Arial, sans-serif; font-size:14px; border-collapse: collapse;">

  <tr>
    <td style="vertical-align: top; width: 50%; padding-right: 10px;">
      <strong>The CleanAR Solutions Team</strong><br>
      📞 (437) 440-5514<br>
      📧 <a href="mailto:info@cleanARsolutions.ca">info@cleanARsolutions.ca</a><br>
      🌐 <a href="https://www.cleanARsolutions.ca/index" target="_blank">www.cleanARsolutions.ca/index</a>
    </td>

    <td style="vertical-align: top; width: 50%; padding-left: 10px;">
      📱 <a href="https://www.instagram.com/cleanarsolutions/" target="_blank">Follow us on Instagram</a><br>
      💲 Refer a friend and get 10% off their first service!<br>
      😄 <a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noopener noreferrer">Leave us a review!</a>
    </td>
  </tr>
</table>
                `
                };

                try {
                    await sgMail.send(msg);
                    newBooking.confirmationSent = true; // Mark as confirmation sent
                    newBooking.confirmationDate = new Date(); // Set confirmation date
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
    completeBooking: async (req, res) => {
        try {
            const bookingId = req.params.id;
            // const { income } = req.body; // Expecting income to be passed in request body
            const { status } = req.body; // Expecting status to be passed in request body
            const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status: status }, { new: true });
            if (!updatedBooking) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            //save
            await updatedBooking.save();
            res.json(updatedBooking);
        } catch (err) {
            console.error('Error completing booking:', err);
            res.status(500).json({ error: 'Failed to complete booking' });
        }
    },
    hideBooking: async (req, res) => {
        try {
            const bookingId = req.params.id;
            const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { hidden: true }, { new: true });
            if (!updatedBooking) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            res.json(updatedBooking);
        } catch (err) {
            console.error('Error hiding booking:', err);
            res.status(500).json({ error: 'Failed to hide booking' });
        }
    },

    //     sendReminderEmail: async ({ customerEmail, customerName, date, serviceType }) => {

    //         const subjectDate = date.toLocaleDateString('en-US', {
    //             weekday: 'long',  // "Wednesday"
    //             month: 'long',    // "July"
    //             day: 'numeric',   // "2"
    //             year: 'numeric'   // "2025"
    //         });

    //         const formattedDateTime = date.toLocaleString('en-US', {
    //             weekday: 'long',
    //             month: 'long',
    //             day: 'numeric',
    //             year: 'numeric',
    //             hour: 'numeric',
    //             minute: '2-digit',
    //             hour12: true,
    //             timeZone: 'America/Toronto' // optional, but helpful for timezone accuracy
    //         });

    //         const msg = {
    //             to: customerEmail,
    //             from: 'info@cleanarsolutions.ca', // Same here
    //             subject: `📅[REMINDER] CleanAR Solutions: Cleaning Service Confirmation for ${subjectDate}`,
    //             html: `
    //             <h2>Your service is almost here!</h2>
    //             <p>Hi ${customerName},</p>
    //             <p>This is a friendly reminder that your cleaning appointment is scheduled for <strong>${formattedDateTime}</strong>.</p>
    //             <p>Details:</p>
    //             <p>${serviceType}</p>
    //             <p>Please don't hesitate to reach out if you have any questions or need help preparing the area.</p>
    //             <p>Thank you for your cooperation, and we look forward to providing you with excellent service!</p>
    //             <p>See you soon! 😊</p>
    //             <table style="width:100%; font-family: Arial, sans-serif; font-size:14px; border-collapse: collapse;">
    //   <tr>
    //     <td style="vertical-align: top; width: 50%; padding-right: 10px;">
    //       <strong>The CleanAR Solutions Team</strong><br>
    //       📞 (437) 440-5514<br>
    //       📧 <a href="mailto:info@cleanARsolutions.ca">info@cleanARsolutions.ca</a><br>
    //       🌐 <a href="https://www.cleanARsolutions.ca/index" target="_blank">www.cleanARsolutions.ca/index</a>
    //     </td>

    //     <td style="vertical-align: top; width: 50%; padding-left: 10px;">
    //       📱 <a href="https://www.instagram.com/cleanarsolutions/" target="_blank">Follow us on Instagram</a><br>
    //       💲 Refer a friend and get 10% off their first service!<br>
    //       😄 <a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noopener noreferrer">Leave us a review!</a>
    //     </td>
    //   </tr>
    // </table>

    //           `
    //         };

    //         try {
    //             await sgMail.send(msg);
    //             console.log(`[Email] Reminder sent to ${customerEmail}`);
    //         } catch (err) {
    //             console.error('[Email] Failed to send reminder:', err);
    //             throw err;
    //         }
    //     },
    sendConfirmationEmailCron: async () => {
        const now = new Date();

        const confirmations = await Booking.find({
            confirmationDate: { $lte: now },
            scheduleConfirmation: true,
            confirmationSent: false
        });

        for (const booking of confirmations) {
            if (booking.confirmationDate !== null) {
                try {
                    const torontoDate = DateTime.fromJSDate(booking.date, { zone: 'utc' }).setZone('America/Toronto');

                    const subjectDate = torontoDate.toLocaleString({
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    });

                    const formattedDateTime = torontoDate.toLocaleString({
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });
                    await sgMail.send({
                        to: booking.customerEmail,
                        from: 'info@cleanarsolutions.ca',
                        subject: `✅ CleanAR Solutions: Booking Confirmation for ${subjectDate}`,
                        html: `
                  <h2>Thanks for booking with CleanAR Solutions!</h2>
                  <p>Hi ${booking.customerName},</p>
                  <p>Your service is confirmed for <strong>${formattedDateTime}</strong>.</p>
                  <p>Details:</p>
                  <p>${booking.serviceType}</p>
                  <p>We look forward to seeing you then! 🚐🧼</p>
                  <table style="width:100%; font-family: Arial, sans-serif; font-size:14px; border-collapse: collapse;">
  <tr>
    <td style="vertical-align: top; width: 50%; padding-right: 10px;">
      <strong>The CleanAR Solutions Team</strong><br>
      📞 (437) 440-5514<br>
      📧 <a href="mailto:info@cleanARsolutions.ca">info@cleanARsolutions.ca</a><br>
      🌐 <a href="https://www.cleanARsolutions.ca/index" target="_blank">www.cleanARsolutions.ca/index</a>
    </td>

    <td style="vertical-align: top; width: 50%; padding-left: 10px;">
      📱 <a href="https://www.instagram.com/cleanarsolutions/" target="_blank">Follow us on Instagram</a><br>
      💲 Refer a friend and get 10% off their first service!<br>
      😄 <a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noopener noreferrer">Leave us a review!</a>
    </td>
  </tr>
</table>
                `
                    });

                    // booking.confirmationSent = true;
                    booking.confirmationDate = now; // Update confirmation date
                    // booking.scheduleConfirmation = false; // Mark as no longer scheduled
                    booking.confirmationSent = true; // Mark as confirmation sent
                    await booking.save();
                } catch (err) {
                    console.error('Error sending confirmation:', err);
                }
            }
        }
    },
    sendReminderCron: async () => {
        //  for testing purposes, run every 10 seconds
        // cron.schedule('*/10 * * * * *', async () => {
        console.log('[CRON] Checking for reminders due in 24h...');
        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        // const windowStart = new Date(in24h.getTime() - 24 * 60 * 60 * 1000);
        // const windowEnd = new Date(in24h.getTime() + 24 * 60 * 60 * 1000);

        try {
            const dueBookings = await Booking.find({
                date: { $gte: now, $lte: in24h },
                reminderScheduled: true,
                reminderSent: false,
            });

            console.log(`Found ${dueBookings.length} bookings due for reminders.`);

            for (let booking of dueBookings) {
                await sendReminderEmail(booking);
                booking.reminderDate = now; // Update reminder date
                // booking.reminderScheduled = false;
                booking.reminderSent = true; // Mark as reminder sent
                await booking.save();
                console.log(`Reminder sent to ${booking.customerEmail}`);
            }
        } catch (err) {
            console.error('Reminder CRON error:', err);
        }
    }
};

module.exports = bookingControllers;