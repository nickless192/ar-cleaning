const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_KEY;
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token
        .split(' ')
        .pop()
        .trim();
    }

    console.log("token", token)


    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    }
    catch {
      console.log('Invalid token');
    }

    return req;
  },
  signToken: function ({ username, _id, adminFlag, firstName, lastName, email, telephone, howDidYouHearAboutUs, address, city, province, postalcode, companyName }) {
    const payload = { username, _id, adminFlag, firstName, lastName, email, telephone, howDidYouHearAboutUs, address, city, province, postalcode, companyName };
    // for testing
    // console.log(payload);

    return jwt.sign(
      { data: payload },
      secret,
      { expiresIn: expiration }
    );
  },
  verifyToken: function (token) {
    return jwt.verify(token, secret, { maxAge: expiration });
  },
  signTokenForPasswordReset: function ({ userId }) {
    const payload = { userId };
    return jwt.sign(
      { data: payload },
      secret,
      { expiresIn: '1h' }
    );
  }
};