const { google } = require('googleapis');
const { getAuthClient } = require("../middleware/googleAuth");

// Parse the JSON credentials stored as a string in the environment variable
// const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const auth = getAuthClient();


const reviewController = {
    async getReviews(req, res) {
        try {

            // const client = await auth.getClient();

            // Business Information API
            const myBusiness = google.mybusinessbusinessinformation({
                version: "v1",
                auth: auth,
            });

            // Reviews are actually under the "My Business Account Management API"
            const reviews = google.mybusinessaccountmanagement({
                version: "v1",
                auth: auth,
            });

            const response = await reviews.accounts.locations.reviews.list({
                parent: `accounts/${process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID}/locations/${process.env.GOOGLE_MY_BUSINESS_LOCATION_ID}`,
            });

            res.json(response.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },
    async listAccounts(req, res) {
        try {

            // const auth = getAuthClient();
            // Use the correct API client for the Account Management API
            const myBusinessAccountManagement = google.mybusinessaccountmanagement({
                version: 'v1',
                auth: auth,
            });

            // Call the API to list accounts
            const response = await myBusinessAccountManagement.accounts.list();
            console.log(response.data);

            res.json(response.data);

            // return response.data;
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    },
    async listLocations(req, res) {
        try {

            const myBusinessAccountManagement = google.mybusinessaccountmanagement({
                version: "v1",
                auth: auth,
            });

            const accountsResp = await myBusinessAccountManagement.accounts.list();
            console.log("Available accounts:", accountsResp.data);

            const accountName = accountsResp.data.accounts[0].name;
            // console.log("accountId", accountId);
            console.log("accountname", accountName);

            const myBusinessInformation = google.mybusinessbusinessinformation({
                version: 'v1',
                auth: auth,
            });

            // const accounts = await myBusinessInformation.accounts.list();
            // console.log("accounts data", accounts.data);
            const res2 = await myBusinessInformation.accounts.locations.list({
                parent: accountName,
            });
            console.log("locations data", res2.data);

            // Call the API to list locations for the given accountId
            const response = await myBusinessInformation.accounts.locations.list({
                parent: accountName
            });

            console.log(response.data);
            res.json(response.data);

            // return response.data;
        } catch (error) {
            console.error('Error fetching locations:', error.message);
        }
    },
};

module.exports = reviewController;