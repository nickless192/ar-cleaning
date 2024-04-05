module.exports = {
    isEmail: function(email) {
        // defining regular expression for an email-type string
        const re = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
        // returns true if the email variable is indeed a proper email; returns false otherwise
        return re.test(email);
    }
}