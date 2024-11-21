module.exports = {
    isEmail: function(email) {
        // defining regular expression for an email-type string
        const re = /^([a-zA-Z0-9_\.-]+)@([\da-zA-Z\.-]+)\.([a-zA-Z\.]{2,6})$/;
        // returns true if the email variable is indeed a proper email; returns false otherwise
        // if email is blank, also return true
        if (email === '') {
            return true;
        }
        return re.test(email);
    }
}