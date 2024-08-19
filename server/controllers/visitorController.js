const {VisitorCount} = require('../models');

// Fetch visitor count
const visitorController = {

getVisitorCount: async (req, res) => {
    try {
        const page = req.params.page;
        const visitorCount = await VisitorCount.findOne({ page });
        res.json({ count: visitorCount ? visitorCount.count : 0 });
    } catch (err) {
        res.status(500).send({ error: 'Failed to retrieve visitor count' });
    }
},

// Increment visitor count
incrementVisitorCount: async (req, res) => {
    try {
        const page = req.body.page;
        const visitorCount = await VisitorCount.findOneAndUpdate(
            { page },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        res.json({ message: 'Visitor count incremented', count: visitorCount.count });
    } catch (err) {
        res.status(500).send({ error: 'Failed to increment visitor count' });
 
    }

}
};

module.exports = visitorController;
