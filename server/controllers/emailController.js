const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const jwt = require('jsonwebtoken');
const { signTokenForPasswordReset } = require('../utils/auth');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Define your email controller
const emailController = {
    emailQuote: async (req, res) => {
        try {
            // console.log('Emailing quote: ', req.body);
            const { email, quote } = req.body;

            const emailText = `
Dear ${quote.name},

Thank you for your quote request! We have received it with the following details:

**Quote ID**: ${quote.quoteId}

**Company**: ${quote.companyName}  
**Address**: ${quote.address.toUpperCase()}, ${quote.city.toUpperCase()}, ${quote.province.toUpperCase()}, ${quote.postalcode.toUpperCase()}  
**Phone Number**: ${quote.phonenumber}  
**Email**: ${quote.email}
**Date**: ${quote.createdAt}
**Promo Code**: ${(quote.promoCode) ? (quote.promoCode) : ('No promo code was used.')}

**Services Requested**:
${quote.services.map(service => {
                let customOptionsText = '';
                if (service.customOptions && typeof service.customOptions === 'object') {
                    customOptionsText = Object.keys(service.customOptions).map(key => {
                        console.log('service.customOptions[key]: ', service.customOptions[key]);
                        const option = service.customOptions[key];
                        const label = option.label || key; // Use ariaLabel if available, otherwise fallback to key
                        if (typeof option.service === 'boolean') {
                            return `- ${label}`;
                        } else {
                            return `- ${label}: ${option.service}`;
                        }
                    }).join('\n');
                } else {
                    console.error('service.customOptions is not an object:', service.customOptions);
                    customOptionsText = 'No custom options were selected.';
                }

                // Use customOptionsText as needed
                // console.log(customOptionsText);
                return `
- **${service.type}** (${service.serviceLevel})

- **Custom Options**:
${customOptionsText}
`            }
            ).join('\n')}           


Please note, this is a preliminary summary, and we will send a finalized quote in a separate email. We look forward to discussing your requirements further.

Best regards,  
CleanAR Solutions
info@cleanARsolutions.ca
(437) 440-5514

            `;
            // - **Description**: ${service.description}
            // - **Cost**: $${service.customOptions.find(option => option.optionName === 'serviceCost').optionValue}

            // ${quote.services.map(service => `- ${service.type} (${service.serviceLevel}) - Cost: $${service.customOptions.get('serviceCost')}`).join('\n')}

            // **Products Included**:
            // ${quote.products.map(product => `- ${product.name} - Cost: $${product.productCost}`).join('\n')}
            // **Subtotal**: $${quote.subtotalCost}  
            // **Tax**: $${quote.tax}  
            // **Grand Total**: $${quote.grandTotal}

            const msg = {
                to: email, // Change to your recipient
                from: 'info@cleanARsolutions.ca', // Change to your verified sender
                subject: 'Your Quote from CleanAR Solutions',
                text: emailText, // plain text body

            }
            // console.log('Emailing quote message: ', msg);

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

A new quote has been created:

--------------------------------------------

Dear ${quote.name},

Thank you for your quote request! We have received it with the following details:

**Quote ID**: ${quote.quoteId}

**Company**: ${quote.companyName}  
**Address**: ${quote.address.toUpperCase()}, ${quote.city.toUpperCase()}, ${quote.province.toUpperCase()}, ${quote.postalcode.toUpperCase()}  
**Phone Number**: ${quote.phonenumber}  
**Email**: ${quote.email}
**Promo Code**: ${(quote.promoCode) ? (quote.promoCode) : ('No promo code was used.')}

**Services Requested**:
${quote.services.map(service => {
                let customOptionsText = '';

                // if (service.customOptions && typeof service.customOptions === 'object') {
                //     customOptionsText = Object.keys(service.customOptions).map(key => {
                //         const option = service.customOptions[key];
                //         if (typeof option.service === 'boolean') {
                //             return `- ${key}`;
                //         } else {
                //             return `- ${key}: ${option.service}`;
                //         }
                //     }).join('\n');
                if (service.customOptions && typeof service.customOptions === 'object') {
                    customOptionsText = Object.keys(service.customOptions).map(key => {
                        console.log('service.customOptions[key]: ', service.customOptions[key]);
                        const option = service.customOptions[key];
                        const label = option.label || key; // Use ariaLabel if available, otherwise fallback to key
                        if (typeof option.service === 'boolean') {
                            if (option.service) {
                                return `- ${label}`;
                            }
                            // return `- ${label}`;
                        } else {
                            return `- ${label}: ${option.service}`;
                        }
                    }).join('\n');
                } else {
                    console.error('service.customOptions is not an object:', service.customOptions);
                    customOptionsText = 'No custom options were selected.';
                }

                // Use customOptionsText as needed
                console.log(customOptionsText);
                return `
- **${service.type}** (${service.serviceLevel})

- **Custom Options**:
${customOptionsText}
`            }
            ).join('\n')}           


Please note, this is a preliminary summary, and we will send a finalized quote in a separate email. We look forward to discussing your requirements further.

Best regards,  
CleanAR Solutions
info@cleanARsolutions.ca
(437) 440-5514

--------------------------------------------

Make sure to follow up with the client to discuss their requirements further.

Best regards,

ClenanAR Solutions
info@cleanARsolutions.ca
(437) 440-5514`;
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

            Remember to log in to your account to request quotes, view your quotes, and manage your account.

            If you have any questions or need assistance, please don't hesitate to reach out to us. 

            Best regards,

            CleanAR Solutions
            info@cleanARsolutions.ca
            (437) 440-5514`;
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
    },
    emailPasswordResetRequest: async (req, res) => {
        const { username } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }
        console.log('user: ', user);
        const resetToken = signTokenForPasswordReset({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        user.resetToken = bcrypt.hashSync(resetToken, 10); // Store hashed token in the DB
        user.resetTokenExpires = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        // Send the reset email with SendGrid
        const msg = {
            to: user.email,
            from: 'info@cleanARsolutions.ca', // Your verified sender
            subject: 'Password Reset Request',
            text: `
        You are receiving this email because you (or someone else) has requested a password reset for your account.
        Please click on the following link, or paste this into your browser to complete the process:
        https://www.cleanARsolutions.ca/reset-password?token=${resetToken}
        If you did not request this, please ignore this email and your password will remain unchanged.
        `,
        
        // http://localhost:3000/reset-password?token=${resetToken}
    };

        try {
            await sgMail.send(msg);
            res.status(200).json({ message: 'Password reset email sent! Please check your email for next steps.' });            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error sending email' });
            
        }
    }
};

module.exports = emailController;