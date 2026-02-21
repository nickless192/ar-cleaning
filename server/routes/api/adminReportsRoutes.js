const router = require("express").Router();
const cron = require("node-cron");
const { sendDailyEventsReportEmail } = require("../../controllers/eventsReportController");

// Manually trigger (admin)
router.post("/send-daily-events", async (req, res) => {
    try {
        const { date } = req.body || {}; // optional: "YYYY-MM-DD"
        const result = await sendDailyEventsReportEmail({ dateStr: date });
        return res.status(200).json(result);
    } catch (e) {
        console.error("send-daily-events error:", e);
        return res.status(500).json({ ok: false, error: "Failed to send daily events report" });
    }
});


// Runs daily at 7:30 AM Toronto time

cron.schedule(
    // isDev ? "*/10 * * * * *" : '0 8 * * 1', // Dev: every 10 sec | Prod: every monday at 8 am    
    "30 7 * * *",
    async () => {
        try {
            const result = await sendDailyEventsReportEmail();
            console.log("[DailyEventsReportCron] done:", result);
        } catch (e) {
            console.error("[DailyEventsReportCron] failed:", e);
        }
    },
    { timezone: "America/Toronto" }
);

// console.log("[DailyEventsReportCron] scheduled at 07:30 America/Toronto");





module.exports = router;
