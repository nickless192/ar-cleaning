const {VisitorLog, VisitorCount} = require('../models');
// const {VisitorCount} = require('../models');

// Fetch visitor count
const visitorController = {

// getVisitorCount: async (req, res) => {
//     try {
//         const page = req.params.page;
//         const visitorCount = await VisitorCount.findOne({ page });
//         res.json({ count: visitorCount ? visitorCount.count : 0 });
//     } catch (err) {
//         res.status(500).send({ error: 'Failed to retrieve visitor count' });
//     }
// },

// Increment visitor count
// incrementVisitorCount: async (req, res) => {
//     try {
//         const page = req.body.page;
//         const visitorCount = await VisitorCount.findOneAndUpdate(
//             { page },
//             { $inc: { count: 1 } },
//             { new: true, upsert: true }
//         );
//         res.json({ message: 'Visitor count incremented', count: visitorCount.count });
//     } catch (err) {
//         res.status(500).send({ error: 'Failed to increment visitor count' });
 
//     }

// },
logVisit: async (req, res) => {
    try {
        const page = req.body.page;
        const newVisit = new VisitorLog({ page});
        await newVisit.save();
        res.json({ message: 'Visit logged successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Failed to log visit' });
    }
},
getDailyVisitors: async (req, res) => {
    try {
        // const page = req.body.page;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of the day
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // End of the day
        const pages = ['index', 'request-quote', 'career'];
        const dailyVisits = {};
        for (const page of pages) {
            dailyVisits[page] = await VisitorLog.countDocuments({
                page: page,
                visitDate: { $gte: today, $lt: tomorrow }
            });
        }

        // const dailyVisits = await VisitorLog.countDocuments({
        //     page: page,
        //     visitDate: { $gte: today, $lt: tomorrow }
        // });
        console.log(dailyVisits);
        res.json(dailyVisits);
    } catch (err) {
        res.status(500).send({ error: 'Failed to retrieve daily visitor stats' });
    }
},
migrateData: async (req, res) => {
    try {
        // Define the pages you want to migrate data for
        const pages = ['index', 'request-quote', 'career'];
        
        // Specify the date to assign the counts to (e.g., today)
        const chosenDate = new Date(); // Use current date, or modify if needed
        chosenDate.setHours(0, 0, 0, 0); // Reset the time to midnight for consistency

        // Loop through each page and migrate its visit count
        for (const page of pages) {
            // Fetch the existing count for each page
            const visitorCount = await VisitorCount.findOne({ page });

            if (!visitorCount) {
                console.log(`No data to migrate for page: ${page}`);
                continue;
            }
            // console.log(visitorCount);
            // console.log(visitorCount.count);
            const totalCount = visitorCount.count;
            console.log(`Migrating ${totalCount} visits for page: ${page}`);

            // Log each visit for the page with the chosen date
            for (let i = 0; i < totalCount; i++) {
                const newLog = new VisitorLog({
                    page,
                    visitDate: chosenDate
                });
                await newLog.save();
            }

            console.log(`Successfully migrated ${totalCount} visits to ${page} on ${chosenDate}.`);
        }
        console.log('Migration complete');
        res.status(200).json({ message: 'Migration successful' });
    } catch (err) {
        console.error('Migration failed:', err);
        res.status(500).json({ error: 'Migration failed' });
    } 
    // finally {
    //     mongoose.connection.close();
    // }
}
};

module.exports = visitorController;
