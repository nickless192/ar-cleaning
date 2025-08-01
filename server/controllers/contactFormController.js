const ContactForm = require("../models/ContactForm");

const contactFormController = {
  createNewFrom: async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    try {
      const newEntry = new ContactForm({
        name,
        email,
        phone,
        subject,
        message,
      });

      await newEntry.save();

      res.status(200).json({ message: "Message received!" });
    } catch (error) {
      console.error("Contact form submission failed:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  },
  getForms: async (req, res) => {
    // const { status } = req.query;

    // const filter = status ? { status } : {};
    const query = { deleted: { $ne: true } };
    if (req.query.status) {
      query.status = req.query.status;
    }


    try {
      const results = await ContactForm.find(query).sort({ createdAt: -1 });
      res.json(results);
      // const messages = await ContactForm.find(filter).sort({ createdAt: -1 });
      // res.json(messages);
    } catch (error) {
      console.error("Failed to fetch contact forms:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  updateFormStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    try {
      const updated = await ContactForm.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updated) return res.status(404).json({ message: "Contact form not found" });

      res.json(updated);
    } catch (error) {
      console.error("Status update failed:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  archiveForm: async (req, res) => {
    try {
      const updated = await ContactForm.findByIdAndUpdate(
        req.params.id,
        { deleted: true },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Archived successfully", data: updated });
    } catch (err) {
      console.error("Archiving error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = contactFormController;
