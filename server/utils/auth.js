const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_KEY;
const expiration = '5h'; // '5h'

const buildUserPayload = (dbUserData) => {
  if (!dbUserData) return {};

  // Handle both plain object and Mongoose doc
  const user = dbUserData.toObject ? dbUserData.toObject() : dbUserData;

  // Derive role names if roles are populated (Role docs) or strings
  let roleNames = [];
  if (Array.isArray(user.roles)) {
    roleNames = user.roles.map((r) => {
      if (!r) return null;
      if (typeof r === 'string') return r;        // already a name or id
      if (r.name) return r.name;                  // populated Role doc
      return null;
    }).filter(Boolean);
  }

  return {
    _id: user._id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    adminFlag: !!user.adminFlag,
    testerFlag: !!user.testerFlag,
    roles: roleNames,
  };
};

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
  signToken: function (dbUserData) {
    const payload = dbUserData;
    // const payload = buildUserPayload(dbUserData);
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