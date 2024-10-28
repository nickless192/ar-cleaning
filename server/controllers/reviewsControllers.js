const { google } = require('googleapis');

// Parse the JSON credentials stored as a string in the environment variable
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const auth = new google.auth.GoogleAuth({
    credentials: credentials,  // Use the parsed credentials
    scopes: ['https://www.googleapis.com/auth/business.manage'],
});

const reviewController = {
    async getReviews(req, res) {
        try {
            const client = google.mybusiness({
                version: 'v4',
                auth: auth,
            });
            const response = await client.accounts.locations.reviews.list({
                name: `accounts/${process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID}/locations/${process.env.GOOGLE_MY_BUSINESS_LOCATION_ID}`,
            });
            res.json(response.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },
    async listAccounts(req, res) {
        try {
            const client = await auth.getClient();

            // Use the correct API client for the Account Management API
            const myBusinessAccountManagement = google.mybusinessaccountmanagement({
                version: 'v1',
                auth: client,
            });

            // Call the API to list accounts
            const response = await myBusinessAccountManagement.accounts.list();
            console.log(response.data);

            res.json(response.data);

            return response.data;
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    },
    async listLocations(req, res) {
        try {
            // const accountId = process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID;
            const accountId = req.params.accountId;
            const client = await auth.getClient();
            // Use the correct API client for the Business Information API
            const myBusinessInformation = google.mybusinessbusinessinformation({
                version: 'v1',
                auth: client,
            });

            // Call the API to list locations for the given accountId
            const response = await myBusinessInformation.accounts.locations.list({
                parent: `accounts/${accountId}`,
            });

            console.log(response.data);

            return response.data;
        } catch (error) {
            console.error('Error fetching locations:', error.message);
        }
    },
};

module.exports = reviewController;