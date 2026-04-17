const { Quote, QuickQuote } = require('../models');
const {
    assertNoOperatorKeys,
    pickAllowedFields,
    validateObjectId,
} = require('../utils/mongoSafety');

const QUOTE_FIELDS = [
    'name', 'description', 'email', 'companyName', 'phonenumber', 'address', 'city',
    'province', 'postalcode', 'howDidYouHearAboutUs', 'howDidYouHearAboutUsSupport',
    'promoCode', 'products', 'services', 'subtotalCost', 'grandTotal', 'tax', 'userId'
];

const QUICK_QUOTE_FIELDS = [
    'name', 'email', 'companyName', 'phonenumber', 'postalcode', 'promoCode',
    'products', 'services', 'userId', 'acknowledgedByUser', 'acknowledgedAt', 'acknowledgedBy'
];

const quoteController = {
    getQuotes: async (req, res) => {
        try {
            const quotes = await Quote.find();
            res.json(quotes);
        } catch (error) {
            console.error('Error getting quotes: ', error);
            res.status(500).json({ message: 'Error getting quotes' });
        }
    },
    createQuote: async (req, res) => {
        try {
            assertNoOperatorKeys(req.body);
            const createData = pickAllowedFields(req.body, QUOTE_FIELDS);
            const newQuote = new Quote({
                ...createData,
                userId: createData.userId || null // Ensure userId is null if not provided
            });

            const savedQuote = await newQuote.save();

            if (!req.body.userId) {
                savedQuote.userId = savedQuote.quoteId;
                await savedQuote.save();
            }

            res.status(200).json(savedQuote);
        } catch (error) {
            console.error('Error creating quote: ', error);
            res.status(500).json({ message: 'Error creating quote' });
        }
    },
    getQuoteById: async (req, res) => {
        try {
            console.log('Getting quote by id: ', req.params.quoteId);
            if (!validateObjectId(req.params.quoteId)) {
                return res.status(400).json({ message: 'Invalid quote ID' });
            }
            const quote = await Quote.findOne({ quoteId: req.params.quoteId });
            // const quote = await Quote.findById(req.params.quoteId);
            if (!quote) {
                return res.status(404).json({ message: 'Quote not found' });
            }
            res.status(200).json(quote);
        } catch (error) {
            console.error('Error getting quote by id: ', error);
            res.status(500).json({ message: 'Error getting quote by id' });
        }
    },
    getUserQuotes: async (req, res) => {
        try {
            if (!validateObjectId(req.params.userId)) {
                return res.status(400).json({ message: 'Invalid user ID' });
            }
            const quotes = await QuickQuote.find({ userId: req.params.userId }).sort({ createdAt: -1 });
            res.json(quotes);
        } catch (error) {
            console.error('Error getting user quotes: ', error);
            res.status(500).json({ message: 'Error getting user quotes' });
        }
    },
    updateQuote: async (req, res) => {
        try {
            if (!validateObjectId(req.params.quoteId)) {
                return res.status(400).json({ message: 'Invalid quote ID' });
            }
            assertNoOperatorKeys(req.body);
            const updateData = pickAllowedFields(req.body, QUOTE_FIELDS);
            const quote = await Quote.findByIdAndUpdate(req.params.quoteId, updateData, { new: true, runValidators: true });
            res.json(quote);
        } catch (error) {
            console.error('Error updating quote: ', error);
            res.status(500).json({ message: 'Error updating quote' });
        }
    },
    deleteQuote: async (req, res) => {
        try {
            if (!validateObjectId(req.params.quoteId)) {
                return res.status(400).json({ message: 'Invalid quote ID' });
            }
            const quote = await Quote.findByIdAndDelete(req.params.quoteId);
            res.json(quote);
        } catch (error) {
            console.error('Error deleting quote: ', error);
            res.status(500).json({ message: 'Error deleting quote' });
        }
    },
    createQuoteRequest: async (req, res) => {
        try {
            assertNoOperatorKeys(req.body);
            const createData = pickAllowedFields(req.body, QUICK_QUOTE_FIELDS);
            const newQuickQuote = new QuickQuote({
                ...createData,
                userId: createData.userId || null // Ensure userId is null if not provided
            });

            const savedQuickQuote = await newQuickQuote.save();

            if (!req.body.userId) {
                savedQuickQuote.userId = savedQuickQuote.quoteId;
                await savedQuickQuote.save();
            }

            res.status(200).json(savedQuickQuote);
        } catch (error) {
            console.error('Error creating quick quote: ', error);
            res.status(500).json({ message: 'Error creating quick quote' });
        }
    },
    // GET /api/quotes?page=1&limit=10
    getPaginatedQuickQuotes: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const quotes = await QuickQuote.find({})
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit);
            // .limit(limit);
            const total = await QuickQuote.countDocuments();
            res.json({
                quotes,
                total,
                page,
                pages: Math.ceil(total / limit),
            });
        } catch (error) {
            console.error('Error getting paginated quotes: ', error);
            res.status(500).json({ message: 'Error getting paginated quotes' });
        }
    },
    deleteQuoteRequest: async (req, res) => {
        try {
            if (!validateObjectId(req.params.quoteId)) {
                return res.status(400).json({ message: 'Invalid quote ID' });
            }
            const quickQuote = await QuickQuote.findByIdAndDelete(req.params.quoteId);
            if (!quickQuote) {
                return res.status(404).json({ message: 'Quick quote not found' });
            }
            res.json(quickQuote);
        } catch (error) {
            console.error('Error deleting quick quote: ', error);
            res.status(500).json({ message: 'Error deleting quick quote' });
        }
    },
    acknowledgeQuickQuote: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.body.userId;
            if (!validateObjectId(id)) {
                return res.status(400).json({ message: 'Invalid quote ID' });
            }
            if (!validateObjectId(userId)) {
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            const quote = await QuickQuote.findById(id);
            if (!quote) {
                return res.status(404).json({ message: 'Quote not found' });
            }

            if (quote.acknowledgedByUser) {
                // You can return 200 if you prefer idempotency
                return res.status(409).json({ message: 'Quote already acknowledged' });
            }

            quote.acknowledgedByUser = true;
            quote.acknowledgedAt = new Date();
            quote.acknowledgedBy = userId;


            await quote.save();

            return res.status(200).json({
                message: 'Quote acknowledged successfully',
                quote,
            });
        } catch (err) {
            next(err);
        }
    },
    getUnacknowledgedQuotes: async (req, res, next) => {
  try {
    const unacknowledged = await QuickQuote.find({ acknowledgedByUser: false }).sort({ createdAt: -1 });
    res.status(200).json({ quotes: unacknowledged });
  } catch (err) {
    next(err);
  }
}

}

module.exports = quoteController;
