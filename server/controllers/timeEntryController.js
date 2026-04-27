const { DateTime } = require('luxon');
const Booking = require('../models/Booking');
const AppointmentTimeEntry = require('../models/AppointmentTimeEntry');
const User = require('../models/User');
const { isValidObjectId } = require('../utils/mongoSafety');

const APP_TZ = 'America/Toronto';
const MIN_MINUTES_THRESHOLD = 10;
const MAX_MINUTES_THRESHOLD = 12 * 60;
const EARLY_CHECK_IN_MINUTES = 240;

function formatToronto(date) {
  if (!date) return null;
  return DateTime.fromJSDate(new Date(date), { zone: 'utc' })
    .setZone(APP_TZ)
    .toFormat("yyyy-LL-dd HH:mm:ss 'ET'");
}

function calculateTotalMinutes(checkInAt, checkOutAt) {
  if (!checkInAt || !checkOutAt) return 0;
  const diffMs = new Date(checkOutAt).getTime() - new Date(checkInAt).getTime();
  if (diffMs <= 0) return 0;
  return Math.round(diffMs / 60000);
}

function shouldFlagForReview(totalMinutes) {
  return totalMinutes > 0 && (totalMinutes < MIN_MINUTES_THRESHOLD || totalMinutes > MAX_MINUTES_THRESHOLD);
}

function getEntryStatus(entry) {
  if (!entry) return 'not_started';
  if (entry.needsReview || ['adjusted', 'disputed'].includes(entry.status)) return 'needs_review';
  if (entry.checkOutAt) return 'checked_out';
  if (entry.checkInAt) return 'checked_in';
  return 'not_started';
}

function buildSafeLocation(location) {
  if (!location || typeof location !== 'object') return null;
  const lat = Number(location.lat);
  const lng = Number(location.lng);
  const accuracy = Number(location.accuracy);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    lat,
    lng,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
  };
}

async function isEmployeeAllowedForBooking(employeeId, booking) {
  if (!employeeId || !booking) return false;
  const employeeKey = String(employeeId);

  const assignedIds = Array.isArray(booking.assignedEmployees)
    ? booking.assignedEmployees.map((id) => String(id))
    : [];

  if (assignedIds.includes(employeeKey)) return true;
  if (booking.createdBy && String(booking.createdBy) === employeeKey) return true;

  return false;
}

async function ensureEmployeeAccess(req, res) {
  if (!req.user?._id) {
    res.status(401).json({ message: 'Authentication required' });
    return null;
  }

  const user = await User.findById(req.user._id).select('_id adminFlag roles').populate('roles', 'name');
  if (!user) {
    res.status(401).json({ message: 'User not found' });
    return null;
  }

  const roleNames = (user.roles || []).map((r) => r?.name).filter(Boolean);
  const isEmployee = roleNames.includes('employee') || roleNames.includes('staff');
  const isAdmin = Boolean(user.adminFlag) || roleNames.includes('admin');

  if (!isEmployee && !isAdmin) {
    res.status(403).json({ message: 'Employee access required' });
    return null;
  }

  return { user, isAdmin };
}

async function getEmployeeAppointments(req, res) {
  try {
    const access = await ensureEmployeeAccess(req, res);
    if (!access) return;

    const employeeId = access.user._id;

    const nowToronto = DateTime.now().setZone(APP_TZ);
    const startOfTodayUTC = nowToronto.startOf('day').toUTC().toJSDate();
    const endOfTodayUTC = nowToronto.endOf('day').toUTC().toJSDate();

    const baseFilter = {
      status: { $ne: 'cancelled' },
      $or: [{ assignedEmployees: employeeId }, { createdBy: employeeId }],
    };

    const onlyToday = req.path.endsWith('/today');
    if (onlyToday) {
      baseFilter.date = { $gte: startOfTodayUTC, $lte: endOfTodayUTC };
    }

    const bookings = await Booking.find(baseFilter)
      .select('_id customerName serviceAddress date serviceType services status assignedEmployees')
      .sort({ date: 1 })
      .lean();

    const bookingIds = bookings.map((b) => b._id);
    const entries = await AppointmentTimeEntry.find({
      bookingId: { $in: bookingIds },
      employeeId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const latestByBooking = new Map();
    for (const entry of entries) {
      const key = String(entry.bookingId);
      if (!latestByBooking.has(key)) latestByBooking.set(key, entry);
    }

    const list = bookings.map((booking) => {
      const entry = latestByBooking.get(String(booking._id)) || null;
      return {
        ...booking,
        serviceSummary: booking.serviceType || (booking.services || []).map((s) => s.serviceType).filter(Boolean).join(', ') || 'Service',
        appointmentTimeToronto: formatToronto(booking.date),
        timeEntry: entry
          ? {
              _id: entry._id,
              status: getEntryStatus(entry),
              checkInAt: entry.checkInAt,
              checkOutAt: entry.checkOutAt,
              checkInAtToronto: formatToronto(entry.checkInAt),
              checkOutAtToronto: formatToronto(entry.checkOutAt),
              totalMinutes: entry.totalMinutes,
              needsReview: entry.needsReview,
            }
          : null,
      };
    });

    list.sort((a, b) => {
      const aIsToday = DateTime.fromJSDate(new Date(a.date), { zone: 'utc' }).setZone(APP_TZ).hasSame(nowToronto, 'day');
      const bIsToday = DateTime.fromJSDate(new Date(b.date), { zone: 'utc' }).setZone(APP_TZ).hasSame(nowToronto, 'day');
      if (aIsToday !== bIsToday) return aIsToday ? -1 : 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return res.json({ appointments: list });
  } catch (err) {
    console.error('[timeEntryController.getEmployeeAppointments]', err);
    return res.status(500).json({ message: 'Failed to load appointments' });
  }
}

async function checkIn(req, res) {
  try {
    const access = await ensureEmployeeAccess(req, res);
    if (!access) return;

    const bookingId = req.params.id;
    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(bookingId).select('_id date status assignedEmployees createdBy');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status === 'cancelled') {
      return res.status(409).json({ message: 'Cannot check in to a cancelled booking' });
    }

    const hasAccess = await isEmployeeAllowedForBooking(access.user._id, booking);
    if (!hasAccess && !access.isAdmin) {
      return res.status(403).json({ message: 'You are not assigned to this appointment' });
    }

    const bookingAtToronto = DateTime.fromJSDate(new Date(booking.date), { zone: 'utc' }).setZone(APP_TZ);
    const nowToronto = DateTime.now().setZone(APP_TZ);
    if (nowToronto < bookingAtToronto.minus({ minutes: EARLY_CHECK_IN_MINUTES })) {
      return res.status(409).json({ message: 'Check-in is not available this early for the appointment' });
    }

    const existing = await AppointmentTimeEntry.findOne({ bookingId, employeeId: access.user._id }).sort({ createdAt: -1 });
    if (existing?.checkInAt) {
      return res.status(409).json({ message: 'You are already checked in for this appointment. Ask an admin to adjust if needed.' });
    }

    const nowUTC = new Date();
    const entry = await AppointmentTimeEntry.create({
      bookingId,
      employeeId: access.user._id,
      checkInAt: nowUTC,
      checkInLocation: buildSafeLocation(req.body?.location),
      checkInSource: req.body?.source === 'mobile' ? 'mobile' : 'web',
      checkInDevice: {
        userAgent: String(req.headers['user-agent'] || '').slice(0, 255),
        platform: String(req.body?.devicePlatform || '').slice(0, 120),
      },
      status: 'checked_in',
    });

    return res.status(201).json({
      entryId: entry._id,
      checkInAt: entry.checkInAt,
      checkInAtToronto: formatToronto(entry.checkInAt),
      status: 'checked_in',
    });
  } catch (err) {
    console.error('[timeEntryController.checkIn]', err);
    return res.status(500).json({ message: 'Failed to check in' });
  }
}

async function checkOut(req, res) {
  try {
    const access = await ensureEmployeeAccess(req, res);
    if (!access) return;

    const bookingId = req.params.id;
    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(bookingId).select('_id assignedEmployees createdBy status');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const hasAccess = await isEmployeeAllowedForBooking(access.user._id, booking);
    if (!hasAccess && !access.isAdmin) {
      return res.status(403).json({ message: 'You are not assigned to this appointment' });
    }

    const entry = await AppointmentTimeEntry.findOne({
      bookingId,
      employeeId: access.user._id,
      checkInAt: { $ne: null },
      checkOutAt: null,
    }).sort({ createdAt: -1 });

    if (!entry) {
      return res.status(409).json({ message: 'Cannot check out before check in' });
    }

    const nowUTC = new Date();
    const totalMinutes = calculateTotalMinutes(entry.checkInAt, nowUTC);
    if (totalMinutes <= 0) {
      return res.status(409).json({ message: 'Check-out timestamp must be after check-in' });
    }

    const notes = req.body?.employeeNotes || {};
    entry.checkOutAt = nowUTC;
    entry.checkOutLocation = buildSafeLocation(req.body?.location);
    entry.checkOutSource = req.body?.source === 'mobile' ? 'mobile' : 'web';
    entry.checkOutDevice = {
      userAgent: String(req.headers['user-agent'] || '').slice(0, 255),
      platform: String(req.body?.devicePlatform || '').slice(0, 120),
    };
    entry.employeeNotes = {
      workCompleted: String(notes.workCompleted || '').slice(0, 2000),
      issuesFound: String(notes.issuesFound || '').slice(0, 2000),
      suppliesNeeded: String(notes.suppliesNeeded || '').slice(0, 2000),
      accessIssue: String(notes.accessIssue || '').slice(0, 2000),
      extraTimeRequired: String(notes.extraTimeRequired || '').slice(0, 2000),
      general: String(notes.general || '').slice(0, 2000),
    };
    entry.totalMinutes = totalMinutes;
    entry.needsReview = shouldFlagForReview(totalMinutes);
    entry.status = 'checked_out';

    await entry.save();

    return res.json({
      entryId: entry._id,
      checkOutAt: entry.checkOutAt,
      checkOutAtToronto: formatToronto(entry.checkOutAt),
      totalMinutes: entry.totalMinutes,
      needsReview: entry.needsReview,
      status: getEntryStatus(entry),
    });
  } catch (err) {
    console.error('[timeEntryController.checkOut]', err);
    return res.status(500).json({ message: 'Failed to check out' });
  }
}

function parseDateQuery(value) {
  if (!value) return null;
  const dt = DateTime.fromISO(String(value), { zone: 'utc' });
  if (!dt.isValid) return null;
  return dt.toJSDate();
}

async function getAdminTimeEntries(req, res) {
  try {
    const filter = {};
    const { employeeId, bookingId, status, dateFrom, dateTo } = req.query;

    if (employeeId && isValidObjectId(employeeId)) filter.employeeId = employeeId;
    if (bookingId && isValidObjectId(bookingId)) filter.bookingId = bookingId;
    if (status) filter.status = status;

    const start = parseDateQuery(dateFrom);
    const end = parseDateQuery(dateTo);
    if (start || end) {
      filter.checkInAt = {};
      if (start) filter.checkInAt.$gte = start;
      if (end) filter.checkInAt.$lte = end;
    }

    const entries = await AppointmentTimeEntry.find(filter)
      .populate('employeeId', 'firstName lastName email')
      .populate('bookingId', 'customerName serviceAddress date serviceType')
      .sort({ checkInAt: -1 })
      .lean();

    const currentlyCheckedIn = entries.filter((entry) => entry.checkInAt && !entry.checkOutAt);

    const payrollSummary = entries
      .filter((entry) => entry.status === 'approved')
      .reduce((acc, entry) => {
        const key = String(entry.employeeId?._id || entry.employeeId || 'unknown');
        if (!acc[key]) {
          acc[key] = {
            employeeId: key,
            employeeName: [entry.employeeId?.firstName, entry.employeeId?.lastName].filter(Boolean).join(' ').trim(),
            totalMinutes: 0,
            totalHours: 0,
          };
        }
        acc[key].totalMinutes += Number(entry.totalMinutes || 0);
        acc[key].totalHours = Number((acc[key].totalMinutes / 60).toFixed(2));
        return acc;
      }, {});

    const formatted = entries.map((entry) => ({
      ...entry,
      checkInAtToronto: formatToronto(entry.checkInAt),
      checkOutAtToronto: formatToronto(entry.checkOutAt),
      employeeStatus: getEntryStatus(entry),
    }));

    return res.json({
      entries: formatted,
      currentlyCheckedIn,
      payrollSummary: Object.values(payrollSummary),
    });
  } catch (err) {
    console.error('[timeEntryController.getAdminTimeEntries]', err);
    return res.status(500).json({ message: 'Failed to load time entries' });
  }
}

async function patchAdminTimeEntry(req, res) {
  try {
    const entryId = req.params.id;
    if (!isValidObjectId(entryId)) return res.status(400).json({ message: 'Invalid time entry id' });

    const { reason, checkInAt, checkOutAt, status, adminNotes } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: 'Edit reason is required' });
    }

    const entry = await AppointmentTimeEntry.findById(entryId);
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });

    const changes = [];
    const pushChange = (field, from, to) => {
      if (String(from || '') !== String(to || '')) {
        changes.push({ field, from, to });
      }
    };

    if (checkInAt) {
      const parsed = new Date(checkInAt);
      if (Number.isNaN(parsed.getTime())) return res.status(400).json({ message: 'Invalid checkInAt value' });
      if (!entry.originalCheckInAt) entry.originalCheckInAt = entry.checkInAt;
      pushChange('checkInAt', entry.checkInAt, parsed);
      entry.checkInAt = parsed;
    }

    if (checkOutAt) {
      const parsed = new Date(checkOutAt);
      if (Number.isNaN(parsed.getTime())) return res.status(400).json({ message: 'Invalid checkOutAt value' });
      if (!entry.originalCheckOutAt) entry.originalCheckOutAt = entry.checkOutAt;
      pushChange('checkOutAt', entry.checkOutAt, parsed);
      entry.checkOutAt = parsed;
    }

    if (status) {
      pushChange('status', entry.status, status);
      entry.status = status;
    }

    if (typeof adminNotes === 'string') {
      pushChange('adminNotes', entry.adminNotes, adminNotes);
      entry.adminNotes = adminNotes;
    }

    const totalMinutes = calculateTotalMinutes(entry.checkInAt, entry.checkOutAt);
    pushChange('totalMinutes', entry.totalMinutes, totalMinutes);
    entry.totalMinutes = totalMinutes;
    entry.needsReview = shouldFlagForReview(totalMinutes);

    entry.editedBy = req.user._id;
    if (changes.length > 0) {
      entry.editHistory.push({
        editedAt: new Date(),
        editedBy: req.user._id,
        reason: String(reason).trim(),
        changes,
      });
    }

    if (!['approved', 'disputed'].includes(entry.status)) {
      entry.status = 'adjusted';
    }

    await entry.save();

    return res.json({ entry });
  } catch (err) {
    console.error('[timeEntryController.patchAdminTimeEntry]', err);
    return res.status(500).json({ message: 'Failed to update time entry' });
  }
}

async function approveAdminTimeEntry(req, res) {
  try {
    const entryId = req.params.id;
    if (!isValidObjectId(entryId)) return res.status(400).json({ message: 'Invalid time entry id' });

    const entry = await AppointmentTimeEntry.findById(entryId);
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });

    entry.status = 'approved';
    entry.approvedAt = new Date();
    entry.approvedBy = req.user._id;
    await entry.save();

    return res.json({ entry });
  } catch (err) {
    console.error('[timeEntryController.approveAdminTimeEntry]', err);
    return res.status(500).json({ message: 'Failed to approve time entry' });
  }
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function exportApprovedTimeEntries(req, res) {
  try {
    const entries = await AppointmentTimeEntry.find({ status: 'approved' })
      .populate('employeeId', 'firstName lastName email')
      .populate('bookingId', 'customerName serviceAddress')
      .sort({ checkInAt: -1 })
      .lean();

    const header = [
      'entryId',
      'employeeName',
      'employeeEmail',
      'bookingId',
      'clientName',
      'serviceAddress',
      'checkInUTC',
      'checkOutUTC',
      'checkInToronto',
      'checkOutToronto',
      'totalMinutes',
      'status',
    ];

    const lines = [header.join(',')];
    for (const entry of entries) {
      const row = [
        entry._id,
        [entry.employeeId?.firstName, entry.employeeId?.lastName].filter(Boolean).join(' '),
        entry.employeeId?.email || '',
        entry.bookingId?._id || entry.bookingId,
        entry.bookingId?.customerName || '',
        entry.bookingId?.serviceAddress || '',
        entry.checkInAt ? new Date(entry.checkInAt).toISOString() : '',
        entry.checkOutAt ? new Date(entry.checkOutAt).toISOString() : '',
        formatToronto(entry.checkInAt) || '',
        formatToronto(entry.checkOutAt) || '',
        entry.totalMinutes || 0,
        entry.status,
      ].map(csvEscape);
      lines.push(row.join(','));
    }

    const fileDate = DateTime.now().toFormat('yyyyLLdd_HHmmss');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="time-entries-approved-${fileDate}.csv"`);
    return res.send(lines.join('\n'));
  } catch (err) {
    console.error('[timeEntryController.exportApprovedTimeEntries]', err);
    return res.status(500).json({ message: 'Failed to export time entries' });
  }
}

module.exports = {
  getEmployeeAppointments,
  checkIn,
  checkOut,
  getAdminTimeEntries,
  patchAdminTimeEntry,
  approveAdminTimeEntry,
  exportApprovedTimeEntries,
  __testables: {
    formatToronto,
    calculateTotalMinutes,
    shouldFlagForReview,
    getEntryStatus,
  },
};
