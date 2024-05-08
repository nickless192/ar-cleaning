const {Quote} = require('../models');

const quoteController = {
    getQuotes: async (req, res) => {
        try {
            const quotes = await Quote.find();
            res.json(quotes);
        } catch (error) {
            console.error('Error getting quotes: ', error);
            res.status(500).json({message: 'Error getting quotes'});
        }
    },
    createQuote: async (req, res) => {
        try {
            const quote = await Quote.create(req.body);
            res.json(quote);
        } catch (error) {
            console.error('Error creating quote: ', error);
            res.status(500).json({message: 'Error creating quote'});
        }
    },
    getQuoteById: async (req, res) => {
        try {
            const quote = await Quote.findById(req.params.quoteId);
            res.json(quote);
        } catch (error) {
            console.error('Error getting quote by id: ', error);
            res.status(500).json({message: 'Error getting quote by id'});
        }
    },
    updateQuote: async (req, res) => {
        try {
            const quote = await Quote.findByIdAndUpdate(req.params.quoteId, req.body, {new: true});
            res.json(quote);
        } catch (error) {
            console.error('Error updating quote: ', error);
            res.status(500).json({message: 'Error updating quote'});
        }
    },
    deleteQuote: async (req, res) => {
        try {
            const quote = await Quote.findByIdAndDelete(req.params.quoteId);
            res.json(quote);
        } catch (error) {
            console.error('Error deleting quote: ', error);
            res.status(500).json({message: 'Error deleting quote'});
        }
    }
};

module.exports = quoteController;
