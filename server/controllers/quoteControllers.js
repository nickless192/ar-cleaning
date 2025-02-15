const { Quote, QuickQuote } = require('../models');

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
            const newQuote = new Quote({
                ...req.body,
                userId: req.body.userId || null // Ensure userId is null if not provided
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
            const quotes = await Quote.find({ userId: req.params.userId });
            res.json(quotes);
        } catch (error) {
            console.error('Error getting user quotes: ', error);
            res.status(500).json({ message: 'Error getting user quotes' });
        }
    },
    updateQuote: async (req, res) => {
        try {
            const quote = await Quote.findByIdAndUpdate(req.params.quoteId, req.body, { new: true });
            res.json(quote);
        } catch (error) {
            console.error('Error updating quote: ', error);
            res.status(500).json({ message: 'Error updating quote' });
        }
    },
    deleteQuote: async (req, res) => {
        try {
            const quote = await Quote.findByIdAndDelete(req.params.quoteId);
            res.json(quote);
        } catch (error) {
            console.error('Error deleting quote: ', error);
            res.status(500).json({ message: 'Error deleting quote' });
        }
    },
    createQuickQuote: async (req, res) => {
        try {
            const newQuickQuote = new QuickQuote({
                ...req.body,
                userId: req.body.userId || null // Ensure userId is null if not provided
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
    }
        
    


};

module.exports = quoteController;
