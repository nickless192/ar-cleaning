const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Define your email controller
const emailController = {
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
    },
    emailQuoteNotification: async (req, res) => {

        try {
            // console.log('Emailing quote: ', req.body);
            const { email, quote } = req.body;
            const emailText = `This is an automated notification email from CleanAR Solutions.

            A new quote has been created with the following details:
            Quote ID: ${quote.quoteId}
            User Id: ${quote.userId}
            Name: ${quote.name}
            Email: ${quote.email}
            Phone: ${quote.telephone}
            Address: ${quote.address}
            City: ${quote.city}
            Province: ${quote.province}
            Postal Code: ${quote.postalcode}
            Company Name: ${quote.companyName}

            To view and manage this quote, please click on the link below and enter the quote ID above:
            https://www.cleanARsolutions.ca/view-quotes

Best regards,

ClenanAR Solutions`;
            const msg = {
                to: ['omar.rguez26@gmail.com', 'filiberto_2305@outlook.com', 'info@cleanARsolutions.ca'], // Change to your recipient
                from: 'info@cleanARsolutions.ca', // Change to your verified sender
                subject: 'User Quote Notification: Your Quote from CleanAR Solutions',
                text: emailText, // plain text body

            }

            sgMail
                .send(msg)
                .then(() => {
                    res.status(201).json({ message: 'Notification Email sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing Notification quote' });
                })
        } catch (error) {
            console.error('Error emailing quote: ', error);
            res.status(500).json({ message: 'Error emailing quote' });
        }
    },
    emailNewUser: async (req, res) => {
        try {
            // console.log('Emailing new user: ', req.body);
            const { email, user } = req.body;
            const emailText = `Dear ${user.firstName} ${user.lastName},

            Welcome to CleanAR Solutions! We are excited to have you join our community and look forward to providing you with exceptional cleaning services. 

            If you have any questions or need assistance, please don't hesitate to reach out to us. 

            Best regards,

            CleanAR Solutions`;
            const msg = {
                to: email, // Change to your recipient
                from: 'info@cleanARsolutions.ca', // Change to your verified sender
                subject: 'Welcome to CleanAR Solutions',
                text: emailText, // plain text body

            }
            sgMail
                .send(msg)
                .then(() => {
                    res.status(201).json({ message: 'Email sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing new user' });
                })
        } catch (error) {
            console.error('Error emailing new user: ', error);
            res.status(500).json({ message: 'Error emailing new user' });
        }
    },
    emailNewUserNotification: async (req, res) => {
        try {
            // console.log('Emailing new user: ', req.body);
            // const { email, user } = req.body;
            const emailText = `This is an automated notification email from CleanAR Solutions.

            An new user has joined our community!

            Best regards,

            CleanAR Solutions`;
            const msg = {
                to: ['omar.rguez26@gmail.com', 'filiberto_2305@outlook.com', 'info@cleanARsolutions.ca'], // Change to your recipient
                from: 'info@cleanARsolutions.ca', // Change to your verified sender
                subject: 'New User Notification: Welcome to CleanAR Solutions',
                text: emailText, // plain text body

            }
            sgMail
                .send(msg)
                .then(() => {
                    res.status(201).json({ message: 'Notification Email sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing new user notification' });
                })
        } catch (error) {
            console.error('Error emailing new user notification: ', error);
            res.status(500).json({ message: 'Error emailing new user notification' });
        }
    }
};

module.exports = emailController;