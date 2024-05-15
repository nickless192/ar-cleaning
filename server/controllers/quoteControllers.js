const {Quote} = require('../models');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({ // create reusable transporter object using the default SMTP transport
    host: 'smtp.gmail.com',
    // port: 465,
    port: 587,
    secure: false, // true for 465, false for other ports
    // secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
});

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
    },
    emailQuote: async (req, res) => {
        try {
            // console.log('Emailing quote: ', req.body);
            const {email, quote} = req.body;
            const quoteString = JSON.stringify(quote, null, 2);
            const mailOptions = {
                from: 'omar.rguez26@gmail.com', // sender address
                to: email, // list of receivers
                subject: 'Your Quote', // Subject line
                text: `Here is your quote: ${quoteString}` // plain text body
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error emailing quote: ', error);
                    res.status(500).json({message: 'Error emailing quote'});
                } else {
                    console.log('Email sent: ', info.response);
                    res.json({message: 'Email sent'});
                }
            });
        } catch (error) {
            console.error('Error emailing quote: ', error);
            res.status(500).json({message: 'Error emailing quote'});
        }
    }
};

module.exports = quoteController;
