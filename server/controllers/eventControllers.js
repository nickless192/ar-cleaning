const Event = require('../models/Event');

const eventControllers = {
    // Create a new event
    async logEvent(req, res) {
  try {
    const { action, variant, page } = req.body;
    const userAgent = req.get('User-Agent');

    const event = new Event({ action, variant, page, userAgent });
    await event.save();

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
    },

    // Get all events
    getEvents(req, res) {
        Event.find({})
            .sort({ timestamp: -1 })
            .then(dbEventData => res.json(dbEventData))
            .catch(err => res.status(400).json(err));
    },
};

module.exports = eventControllers;