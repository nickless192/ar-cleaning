const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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
                            return `- ${label.toUpperCase()}`;
                        } else {
                            return `- ${label.toUpperCase()}: ${option.service}`;
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


To view and manage this quote, please click on the link below and enter the Quote ID provided above:

https://www.cleanARsolutions.ca/view-quotes

Please note, this is a preliminary summary, and we will send a finalized quote in a separate email. We look forward to discussing your requirements further.

Best regards,  
CleanAR Solutions

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
                            return `- ${label.toUpperCase()}`;
                        } else {
                            return `- ${label.toUpperCase()}: ${option.service}`;
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


To view and manage this quote, please click on the link below and enter the Quote ID provided above:

https://www.cleanARsolutions.ca/view-quotes

Please note, this is a preliminary summary, and we will send a finalized quote in a separate email. We look forward to discussing your requirements further.

Best regards,  
CleanAR Solutions

--------------------------------------------

Make sure to follow up with the client to discuss their requirements further.

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