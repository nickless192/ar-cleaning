const { Quote } = require('../models');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


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
            const quote = await Quote.findById(req.params.quoteId);
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
    emailQuote: async (req, res) => {
        try {
            // console.log('Emailing quote: ', req.body);
            const { email, quote } = req.body;
            const emailText = `Dear ${quote.name},

Thanks for your quote request! Your new quote request has been created with the following details:

Quote ID: ${quote.quoteId}

To view and manage this quote, please click on the link below and enter the quote ID above:

https://www.cleanARsolutions.ca/view-quotes

We will be in touch with you shortly to discuss your quote further.

Best regards,

ClenanAR Solutions`;
            const msg = {
                to: email, // Change to your recipient
                from: 'info@cleanARsolutions.ca', // Change to your verified sender
                subject: 'Your Quote from CleanAR Solutions',
                text: emailText, // plain text body

            }

           
            sgMail
                .send(msg)
                .then(() => {
                    res.status(201).json({ message: 'Email sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing quote' });
                })
        } catch (error) {
            console.error('Error emailing quote: ', error);
            res.status(500).json({ message: 'Error emailing quote' });
        }
    }
};

module.exports = quoteController;
