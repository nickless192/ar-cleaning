const sgMail = require('@sendgrid/mail');
const { DateTime } = require('luxon');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
// const { sendConfirmationEmail } = require('../utils/emailService');
const APP_TZ = "America/Toronto";

/**
 * Parse an ISO-like string as Toronto wall time (NOT device/server local),
 * then convert to UTC JS Date for storage/querying.
 *
 * Works with:
 * - "2026-02-01T10:30" (datetime-local)
 * - "2026-02-01T10:30:00"
 * - "2026-02-01T10:30:00-05:00" (still ok)
 */
function parseTorontoWallTimeToUTCDate(isoString) {
  const dt = DateTime.fromISO(isoString, { zone: APP_TZ });
  if (!dt.isValid) throw new Error(`Invalid date: ${isoString}`);
  return dt.toUTC().toJSDate();
}

/** Format a stored JS Date (instant) for Toronto display */
function formatToronto(date, opts) {
  return DateTime.fromJSDate(date, { zone: "utc" })
    .setZone(APP_TZ)
    .toLocaleString(opts);
}

/** Get Toronto DateTime from stored JS Date (instant) */
function asTorontoDT(date) {
  return DateTime.fromJSDate(date, { zone: "utc" }).setZone(APP_TZ);
}

// /** Build UTC window bounds from “Toronto wall time” boundaries */
// function torontoWindowToUTC({ startToronto, endToronto }) {
//   return {
//     startUTC: startToronto.setZone(APP_TZ).toUTC().toJSDate(),
//     endUTC: endToronto.setZone(APP_TZ).toUTC().toJSDate(),
//   };
// }

const sendReminderEmail = async (booking) => {
  const { customerEmail, customerName, date } = booking;
  const tzLabel = "Toronto time (ET)";

  // const torontoDate = DateTime.fromJSDate(date, { zone: 'utc' }).setZone('America/Toronto');
  const torontoDate = asTorontoDT(date);


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

  const servicesHtml = buildServicesHtml(booking);

  const msg = {
    to: customerEmail,
    from: 'info@cleanarsolutions.ca', // Same here
    subject: `📅[REMINDER] CleanAR Solutions: Cleaning Service Confirmation for ${subjectDate}`,
    bcc: 'info@cleanarsolutions.ca',
    html: `
            <h2>Your service is almost here!</h2>
            <p>Hello,</p>
            <p>This is a friendly reminder that your cleaning appointment is scheduled for <strong>${formattedDateTime}</strong>.</p>
            <p>Details:</p>
            ${servicesHtml}
            <p style="color:#666;font-size:12px;margin-top:4px;">
            All times shown in <strong>${tzLabel}</strong>.
            </p>
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
      💲 Refer a friend and get 10% off after their first service!<br>
      😄 <a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noopener noreferrer">Leave us a review!</a>
    </td>
  </tr>
</table>

          `
  };

  try {
    // console.log(msg);
    await sgMail.send(msg);
    console.log(`[Email] Reminder sent to ${customerEmail}`);
  } catch (err) {
    console.error('[Email] Failed to send reminder:', err);
    throw err;
  }
};
// Render booking services as HTML (fallback to legacy serviceType)
const buildServicesHtml = (booking) => {
  const services = booking.services || [];

  // Legacy / fallback
  if (!services.length) {
    const name = booking.serviceType || 'Cleaning service';
    const total = booking.income != null ? booking.income.toFixed(2) : null;

    return `
      <p><strong>Service:</strong> ${name}</p>
    `;
    //  return `
    //   <p><strong>Service:</strong> ${name}</p>
    //   ${
    //     total !== null
    //       ? `<p><strong>Estimated Total:</strong> $${total} CAD</p>`
    //       : ''
    //   }
    // `;
  }

  const rows = services
    .map((s) => {
      const billing =
        s.billingType === 'hours'
          ? `${s.hours || 0} hr(s)`
          : `${s.quantity || 0} unit(s)`;

      const price =
        s.price != null ? `$${Number(s.price).toFixed(2)}` : '-';

      const amount =
        s.amount != null ? `$${Number(s.amount).toFixed(2)}` : '-';

      return `
        <tr>
          <td style="padding: 4px 8px; border: 1px solid #ddd;">
            ${s.serviceType || ''}
          </td>
          <td style="padding: 4px 8px; border: 1px solid #ddd;">
            ${s.description || ''}
          </td>
        </tr>
      `;
    })
    .join('');

  const total =
    booking.income != null ? booking.income.toFixed(2) : null;

  return `
    <p><strong>Services:</strong></p>
    <table style="width:100%; font-family: Arial, sans-serif; font-size:14px; border-collapse: collapse; margin-bottom: 8px;">
      <thead>
        <tr>
          <th style="padding: 4px 8px; border: 1px solid #ddd; text-align:left;">Service</th>
          <th style="padding: 4px 8px; border: 1px solid #ddd; text-align:left;">Description</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
  //  return `
  //   <p><strong>Services:</strong></p>
  //   <table style="width:100%; font-family: Arial, sans-serif; font-size:14px; border-collapse: collapse; margin-bottom: 8px;">
  //     <thead>
  //       <tr>
  //         <th style="padding: 4px 8px; border: 1px solid #ddd; text-align:left;">Service</th>
  //         <th style="padding: 4px 8px; border: 1px solid #ddd; text-align:left;">Description</th>
  //       </tr>
  //     </thead>
  //     <tbody>
  //       ${rows}
  //     </tbody>
  //   </table>
  //   ${
  //     total !== null
  //       ? `<p><strong>Estimated Total:</strong> $${total} CAD</p>`
  //       : ''
  //   }
  // `;
};


const bookingControllers = {
  // createBooking: async (req, res) => {
  //     const {
  //         customerName,
  //         customerEmail,
  //         serviceType,
  //         date,
  //         userId,
  //         customerId,
  //         // scheduleConfirmation,
  //         // confirmationDate,
  //         // reminderScheduled,
  //         // disableConfirmation,
  //         income
  //     } = req.body;

  //     const torontoLocal = DateTime.fromISO(date, { zone: 'America/Toronto' });
  //     const parsedDate = new Date(torontoLocal);
  //     // const confirmationDateLocal = confirmationDate ? DateTime.fromISO(confirmationDate, { zone: 'America/Toronto' }) : null;
  //     // if (confirmationDateLocal) {
  //     //     confirmationDateLocal.setZone('America/Toronto');
  //     // }

  //     if (!customerEmail || !date) return res.status(400).json({ error: 'Missing info' });

  //     try {
  //         // create new booking
  //         const newBooking = new Booking({
  //             customerName,
  //             customerEmail,
  //             serviceType,
  //             createdBy: userId,
  //             updatedBy: userId,
  //             date: parsedDate,
  //             customerId: customerId || null,
  //             // reminderScheduled,
  //             // scheduleConfirmation: scheduleConfirmation,
  //             // scheduledConfirmationDate: confirmationDateLocal,
  //             reminderDate: null,
  //             confirmationSent: false,
  //             reminderSent: false,
  //             // disableConfirmation: disableConfirmation || false,
  //             income: income || 0
  //         });
  //         const savedBooking = await newBooking.save();

  //         // if a customerId is provided, i need to push it to the customer's bookings array
  //         if (customerId) {
  //             await Customer.findByIdAndUpdate(customerId, { $push: { bookings: savedBooking._id } });
  //         }
  //         res.status(201).json(savedBooking);
  //     } catch (err) {
  //         console.error('Error creating booking:', err);
  //         res.status(500).json({ error: 'Failed to create booking' });
  //     }

  // },
  createBooking: async (req, res) => {
    const {
      customerName,
      customerEmail,
      serviceType,    // optional, we can derive from services[0]
      date,
      userId,
      customerId,
      income,         // optional, used as fallback
      services = [],  // NEW: array of service lines
      tax,
      discount,
    } = req.body;

    if (!customerEmail || !date) {
      return res.status(400).json({ error: 'Missing info' });
    }

    try {
      // --- Date handling in Toronto timezone ---
      const torontoLocal = DateTime.fromISO(date, { zone: 'America/Toronto' });
      // const parsedDate = torontoLocal.toJSDate();
      const parsedDate = parseTorontoWallTimeToUTCDate(date);

      // --- Normalize services array (if provided) ---
      let normalizedServices = [];
      if (Array.isArray(services)) {
        normalizedServices = services
          .map((s) => {
            const billingType = s.billingType === 'hours' ? 'hours' : 'quantity';
            const hours = Number(s.hours) || 0;
            const quantity = Number(s.quantity) || 0;
            const price = Number(s.price) || 0;

            let amount;
            if (billingType === 'hours') {
              amount = hours * price;
            } else {
              amount = quantity * price;
            }

            return {
              serviceType: s.serviceType || '',
              description: s.description || '',
              billingType,
              hours,
              quantity,
              price,
              amount,
            };
          })
          // Optionally filter out completely empty rows
          .filter(
            (s) =>
              s.serviceType ||
              s.description ||
              s.amount > 0
          );
      }

      // --- Compute total income ---
      const totalFromServices = normalizedServices.reduce(
        (sum, s) => sum + (s.amount || 0),
        0
      );

      // If services present, trust totalFromServices; otherwise fallback to income from body
      const parsedIncome =
        typeof income === 'number' ? income : Number(income) || 0;
      const finalIncome =
        normalizedServices.length > 0 ? totalFromServices : parsedIncome;

      // --- Summary serviceType (for legacy views / quick display) ---
      const summaryServiceType =
        serviceType ||
        (normalizedServices[0] && normalizedServices[0].serviceType) ||
        'Service(s)';

      // --- Create new booking ---
      const newBooking = new Booking({
        customerName,
        customerEmail,
        serviceType: summaryServiceType,
        services: normalizedServices, // NEW: detailed lines
        createdBy: userId,
        updatedBy: userId,
        date: parsedDate,
        customerId: customerId || null,
        reminderDate: null,
        confirmationSent: false,
        reminderSent: false,
        income: finalIncome,
        tax: typeof tax === 'number' ? tax : Number(tax) || 0,
        discount: typeof discount === 'number' ? discount : Number(discount) || 0,
      });

      const savedBooking = await newBooking.save();

      // if a customerId is provided, push booking into the customer's bookings array
      if (customerId) {
        await Customer.findByIdAndUpdate(customerId, {
          $push: { bookings: savedBooking._id },
        });
        //  // TODO: make sure this does not overlap with the current sendConfirmationEmail function
        // await NotificationService.sendBookingConfirmationCustomer(savedBooking._id);
      }

      res.status(201).json(savedBooking);
    } catch (err) {
      console.error('Error creating booking:', err);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  },
  getBookings: async (req, res) => {
    try {
      const bookings = await Booking.find({}).populate('updatedBy', 'firstName lastName email').populate('createdBy', 'firstName lastName email').sort({ date: -1 });
      res.json(bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  },
  pendingBookings: async (req, res) => {
    try {
      const bookings = await Booking.find({ status: 'pending' });
      res.json(bookings);
    } catch (err) {
      console.error('Error fetching pending bookings:', err);
      res.status(500).json({ error: 'Failed to fetch pending bookings' });
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
      updatedBooking.updatedAt = new Date(); // Update the updatedAt field
      updatedBooking.updatedBy = req.body.updatedBy; // Assuming userId is passed in the
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
      updatedBooking.updatedAt = new Date(); // Update the updatedAt field
      updatedBooking.updatedBy = req.body.updatedBy; // Assuming userId is passed in the request body
      await updatedBooking.save(); // Save the updated booking
      res.json(updatedBooking);
    } catch (err) {
      console.error('Error hiding booking:', err);
      res.status(500).json({ error: 'Failed to hide booking' });
    }
  },
  cancelBooking: async (req, res) => {
    try {
      const bookingId = req.params.id;
      const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' }, { new: true });
      if (!updatedBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      updatedBooking.updatedAt = new Date(); // Update the updatedAt field
      updatedBooking.updatedBy = req.body.updatedBy; // Assuming userId is passed in the request body
      await updatedBooking.save(); // Save the updated booking
      res.json(updatedBooking);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  },
  confirmBooking: async (req, res) => {
    // console.log('Confirm booking request:', req.body);
    try {
      const bookingId = req.params.id;
      const {
        scheduleConfirmation,
        confirmationDate,
        reminderScheduled,
        disableConfirmation,
        // customerSuggestedBookingAcknowledged,
        status
      } = req.body; // Use payload if available, otherwise fall back to req.body
      // console.log('Confirm booking body:', req.body);
      // const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
      //     status,
      //     scheduleConfirmation: scheduleConfirmation || false,
      //     scheduledConfirmationDate: confirmationDate ? DateTime.fromISO(confirmationDate, { zone: 'America/Toronto' }).toJSDate() : null,
      //     reminderScheduled: reminderScheduled || false,
      //     disableConfirmation: disableConfirmation || false

      // }, { new: true });
      // if (!updatedBooking) {
      //     return res.status(404).json({ error: 'Booking not found' });
      // }
      // updatedBooking.updatedAt = new Date(); // Update the updatedAt field
      // updatedBooking.updatedBy = req.body.updatedBy; // Assuming userId is passed in the request body
      // await updatedBooking.save(); // Save the updated booking
      // res.json(updatedBooking);

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status,
          scheduleConfirmation: scheduleConfirmation || false,
          // scheduledConfirmationDate: confirmationDate
          //   ? DateTime.fromISO(confirmationDate, { zone: 'America/Toronto' }).toJSDate()
          //   : new Date(),
          scheduledConfirmationDate: confirmationDate
            ? parseTorontoWallTimeToUTCDate(confirmationDate)
            : new Date(),
          reminderScheduled: reminderScheduled || false,
          disableConfirmation: disableConfirmation || false,
          updatedAt: new Date(),
          updatedBy: req.body.updatedBy
        },
        { new: true }
      );
      // if (customerSuggestedBookingAcknowledged) {
      //     updatedBooking.customerSuggestedBookingAcknowledged = true;
      // }
      // updatedBooking.save();
      res.status(200).json(updatedBooking);
    } catch (err) {
      console.error('Error confirming booking:', err);
      res.status(500).json({ error: 'Failed to confirm booking' });
    }
  },
  pendBookingById: async (req, res) => {
    try {
      const bookingId = req.params.id;
      const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
        status: 'pending',
        updatedAt: new Date(),
        updatedBy: req.body.updatedBy,
        scheduledConfirmationDate: null,
        reminderScheduled: false,
        confirmationSent: false,
        reminderSent: false,
        disableConfirmation: false
      }, { new: true });
      if (!updatedBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      updatedBooking.updatedAt = new Date(); // Update the updatedAt field
      updatedBooking.updatedBy = req.body.updatedBy; // Assuming userId is passed in the request body
      await updatedBooking.save(); // Save the updated booking
      res.json(updatedBooking);
    } catch (err) {
      console.error('Error pending booking:', err);
      res.status(500).json({ error: 'Failed to pending booking' });
    }
  },
  sendScheduledConfirmationEmail: async () => {
    const now = new Date();

    const confirmations = await Booking.find({
      scheduledConfirmationDate: { $lte: now },
      // scheduleConfirmation: true, // so it auto sends after confirmed, or after the confirmation date
      confirmationSent: false,
      disableConfirmation: false,
      // status: { $ne: 'cancelled' } // Exclude cancelled bookings
      status: { $eq: 'confirmed' } // include confirmed bookings
    });

    for (const booking of confirmations) {
      if (booking.scheduledConfirmationDate !== null) {
        try {
          // const torontoDate = DateTime.fromJSDate(booking.date, { zone: 'utc' }).setZone('America/Toronto');
          const torontoDate = asTorontoDT(booking.date);

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
          const servicesHtml = buildServicesHtml(booking);
          await sgMail.send({
            to: booking.customerEmail,
            from: 'info@cleanarsolutions.ca',
            bcc: 'info@cleanarsolutions.ca', // Update with your verified sender
            subject: `✅ CleanAR Solutions: Booking Confirmation for ${subjectDate}`,
            html: `
                  <h2>Thanks for booking with CleanAR Solutions!</h2>
                  <p>Hello,</p>
                  <p>Your service is confirmed for <strong>${formattedDateTime}</strong>.</p>
                  <p>Details:</p>
                  ${servicesHtml}
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
      💲 Refer a friend and get 10% off after their first service!<br>
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
          booking.updatedBy = booking.createdBy || null; // Assuming createdBy is set to the user who created the booking
          booking.updatedAt = now; // Update the updatedAt field
          await booking.save();
        } catch (err) {
          console.error('Error sending confirmation:', err);
        }
      }
    }
  },
  sendScheduledReminder: async () => {
    //  for testing purposes, run every 10 seconds
    // cron.schedule('*/10 * * * * *', async () => {
    console.log('[CRON] Checking for reminders due in 24h...');
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    try {
      const dueBookings = await Booking.find({
        date: { $gte: now, $lte: in24h },
        reminderScheduled: true,
        reminderSent: false,
        // status: { $ne: 'cancelled' } // Exclude cancelled bookings
        status: { $eq: 'confirmed' } // Include confirmed bookings
      });

      console.log(`Found ${dueBookings.length} bookings due for reminders.`);

      for (let booking of dueBookings) {
        // console.log(booking);
        await sendReminderEmail(booking);
        booking.reminderDate = now; // Update reminder date
        // booking.reminderScheduled = false;
        booking.reminderSent = true; // Mark as reminder sent
        booking.updatedBy = booking.createdBy || null; // Assuming createdBy is set to the user who created the booking
        booking.updatedAt = now; // Update the updatedAt field
        await booking.save();
        // console.log(`Reminder sent to ${booking.customerEmail}`);
      }
    } catch (err) {
      console.error('Reminder CRON error:', err);
    }
  },
  updateBookingWithNotes: async (req, res) => {
    const bookingId = req.params.id;
    const { notes, updatedBy } = req.body;

    try {
      const updatedBooking = await Booking.findByIdAndUpdate(bookingId,
        { notes, updatedBy, updatedAt: new Date() },
        { new: true }
      );
      if (!updatedBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(updatedBooking);
    } catch (err) {
      console.error('Error updating booking notes:', err);
      res.status(500).json({ error: 'Failed to update booking notes' });
    }
  },
  updateBookingDate: async (req, res) => {
    const bookingId = req.params.id;
    const { date, updatedBy, customerSuggestedBookingAcknowledged } = req.body;

    try {
      const updatedBooking = await Booking.findByIdAndUpdate(bookingId,
        // { date: new Date(date), updatedBy, updatedAt: new Date() },
        {
          // date: new Date(date),
          date: parseTorontoWallTimeToUTCDate(date),
          updatedBy,
          updatedAt: new Date(),
          status: 'pending',
          scheduledConfirmationDate: null,
          reminderScheduled: false,
          confirmationSent: false,
          reminderSent: false,
          disableConfirmation: false
        },
        { new: true }
      );
      if (!updatedBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      if (customerSuggestedBookingAcknowledged) {
        updatedBooking.customerSuggestedBookingAcknowledged = true;
      }
      updatedBooking.save();

      res.status(200).json(updatedBooking);
    } catch (err) {
      console.error('Error updating booking date:', err);
      res.status(500).json({ error: 'Failed to update booking date' });
    }
  },
  updateBooking: async (req, res) => {
    try {
      const bookingId = req.params.id;

      // Pull out fields we want to normalize
      const {
        services,
        date,
        income,
        serviceType,
        customerSuggestedBookingAcknowledged,
        ...restBody
      } = req.body;

      // --- 1) Build base update payload from the rest of the body ---
      const updateData = {
        ...restBody,
        updatedAt: new Date(),
      };

      // --- 2) Date handling (if client sent a new date) ---
      if (date) {
        try {
          // const torontoLocal = DateTime.fromISO(date, { zone: 'America/Toronto' });
          // updateData.date = torontoLocal.toJSDate();
          updateData.date = parseTorontoWallTimeToUTCDate(date);

        } catch (e) {
          console.warn('Invalid date passed to updateBooking:', date);
        }
      }

      // --- 3) Normalize services[] and recompute income if provided ---
      let normalizedServices = null;
      let finalIncome;

      if (Array.isArray(services)) {
        normalizedServices = services
          .map((s) => {
            const billingType = s.billingType === 'hours' ? 'hours' : 'quantity';
            const hours = Number(s.hours) || 0;
            const quantity = Number(s.quantity) || 0;
            const price = Number(s.price) || 0;

            const amount =
              billingType === 'hours' ? hours * price : quantity * price;

            return {
              serviceType: s.serviceType || '',
              description: s.description || '',
              billingType,
              hours,
              quantity,
              price,
              amount,
            };
          })
          // optionally drop totally empty rows
          .filter(
            (s) =>
              s.serviceType ||
              s.description ||
              s.amount > 0
          );

        const totalFromServices = normalizedServices.reduce(
          (sum, s) => sum + (s.amount || 0),
          0
        );
        finalIncome = totalFromServices;

        updateData.services = normalizedServices;
        updateData.income = finalIncome;
        updateData.serviceType =
          serviceType ||
          (normalizedServices[0] && normalizedServices[0].serviceType) ||
          'Service(s)';
      } else if (income !== undefined) {
        // No services array, but income was manually updated
        const parsedIncome =
          typeof income === 'number' ? income : Number(income) || 0;
        finalIncome = parsedIncome;
        updateData.income = finalIncome;

        if (serviceType) {
          updateData.serviceType = serviceType;
        }
      } else if (serviceType) {
        // Only summary serviceType changed
        updateData.serviceType = serviceType;
      }

      // --- 4) Perform main update ---
      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        updateData,
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // --- 5) Special handling for customerSuggestedBookingAcknowledged ---
      if (customerSuggestedBookingAcknowledged) {
        updated.customerSuggestedBookingAcknowledged = true;
        updated.status = 'pending';
        updated.scheduledConfirmationDate = null;
        updated.reminderScheduled = false;
        updated.confirmationSent = false;
        updated.reminderSent = false;
        updated.disableConfirmation = false;
        await updated.save();
      }

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating booking:', err);
      res.status(500).json({ error: 'Failed to update booking' });
    }
  },

  // updateBooking: async (req, res) => {
  //     try {
  //         const bookingId = req.params.id;
  //         const customerSuggestedBookingAcknowledged = req.body.customerSuggestedBookingAcknowledged;
  //         const updated = await Booking.findByIdAndUpdate(bookingId, {
  //             ...req.body,
  //             updatedAt: new Date()
  //         }, { new: true });
  //         if (!updated) return res.status(404).json({ error: 'Booking not found' });
  //         if (customerSuggestedBookingAcknowledged) {
  //             updated.customerSuggestedBookingAcknowledged = true;
  //             updated.status = 'pending';
  //             updated.scheduledConfirmationDate = null;
  //             updated.reminderScheduled = false;
  //             updated.confirmationSent = false;
  //             updated.reminderSent = false;
  //             updated.disableConfirmation = false;
  //         }
  //         updated.save();
  //         res.status(200).json(updated);
  //     } catch (err) {
  //         console.error('Error updating booking:', err);
  //         res.status(500).json({ error: 'Failed to update booking' });
  //     }
  // },
  submitNewDateRequest: async (req, res) => {
    const bookingId = req.params.id;
    const { newDate, comment, serviceType } = req.body;
    // the update to either newDate or serviceType is done if theyre not missing
    // if (!newDate || !serviceType) {
    //     return res.status(400).json({ error: 'New date and service type are required' });
    // } 

    try {
      // Here you would typically send the new date request to the relevant service
      // For demonstration, we'll just log it
      console.log(`New date request for booking ${bookingId}:`, newDate, comment, serviceType);
      await Booking.findByIdAndUpdate(bookingId, {
        customerSuggestedBookingDate: newDate,
        customerSuggestedBookingComment: comment,
        customerSuggestedServiceType: serviceType,
        customerSuggestedBookingAcknowledged: false
      });

      res.status(200).json({ message: 'New date request submitted successfully' });
    } catch (err) {
      console.error('Error submitting new date request:', err);
      res.status(500).json({ error: 'Failed to submit new date request' });
    }
  },
  submitNewBookingRequest: async (req, res) => {
    try {
      // ✅ Assume auth middleware sets req.user for logged-in customers
      // If your auth stores it differently, adjust accordingly.
      // const user = req.user;

      // if (!user?._id) {
      //   return res.status(401).json({ error: "Unauthorized" });
      // }
      const userId = req.body.userId; // For testing, we can pass userId in body. In production, get from req.user

      const {
        customerSuggestedBookingDate,
        customerSuggestedServiceType,
        customerSuggestedBookingComment,
      } = req.body;

      if (!customerSuggestedBookingDate || !customerSuggestedServiceType) {
        return res.status(400).json({ error: "Missing date or service type" });
      }

      // ✅ Convert Toronto wall time -> UTC JS Date (same approach as createBooking)
      let suggestedDateUTC;
      try {
        suggestedDateUTC = parseTorontoWallTimeToUTCDate(customerSuggestedBookingDate);
      } catch (e) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      // ✅ Find the linked Customer for this user
      // IMPORTANT: adapt this query to YOUR actual link field.
      // Common patterns:
      //  - Customer.userId
      //  - Customer.user
      //  - Customer.authUserId
      console.log("userId received:", userId);
      console.log("typeof userId:", typeof userId);
      const customer = await Customer.findOne({ user: userId });
      if (!customer) {
        // return res.status(404).json({ error: "Customer profile not found" });
        userDoc = await User.findById(userId);
        if (!userDoc) return res.status(404).json({ error: "User not found" });

        customer = await Customer.create({
          user: userDoc._id,
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          email: userDoc.email,
          status: "active",
        });
      }

      // ✅ Create a booking that represents a request:
      // - keep "actual" booking date/serviceType empty until admin confirms
      // - set suggested fields
      // - keep status pending
      // const newBooking = new Booking({
      //   customerName: customer.name || user.firstName || "",
      //   customerEmail: customer.email || user.email || "",

      //   customerId: customer._id,

      //   // actual booking fields (admin will set later)
      //   date: null,
      //   serviceType: "",

      //   // suggested fields (customer request)
      //   customerSuggestedBookingDate: suggestedDateUTC,
      //   customerSuggestedServiceType: String(customerSuggestedServiceType || "").trim(),
      //   customerSuggestedBookingComment: String(customerSuggestedBookingComment || "").trim(),
      //   customerSuggestedBookingAcknowledged: false,

      //   status: "pending",
      //   hidden: false,

      //   // who initiated it (customer user)
      //   createdBy: user._id,
      //   updatedBy: user._id,

      //   // leave services/income/tax/discount defaults
      //   reminderDate: null,
      //   confirmationSent: false,
      //   reminderSent: false,
      //   updatedAt: new Date(),
      //   createdAt: new Date(),
      // });
      const customerFullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
      const newBooking = new Booking({
        customerName: customerFullName,
        customerEmail: customer.email || "",

        customerId: customer._id,

        date: null,
        serviceType: "",

        customerSuggestedBookingDate: suggestedDateUTC,
        customerSuggestedServiceType: String(customerSuggestedServiceType || "").trim(),
        customerSuggestedBookingComment: String(customerSuggestedBookingComment || "").trim(),
        customerSuggestedBookingAcknowledged: false,

        status: "pending",
        hidden: false,

        // use userId since you don't have req.user yet
        createdBy: userId,
        updatedBy: userId,
      });

      const savedBooking = await newBooking.save();

      // ✅ link into customer.bookings like your admin createBooking does
      await Customer.findByIdAndUpdate(customer._id, {
        $push: { bookings: savedBooking._id },
      });

      return res.status(201).json(savedBooking);
    } catch (err) {
      console.error("Error submitting new booking request:", err);
      return res.status(500).json({ error: "Failed to submit booking request" });
    }
  },
};

module.exports = bookingControllers;