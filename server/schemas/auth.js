const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'Ifitaintradiantitaintforyoursoul';
const expiration = '2h';

module.exports = {
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  }),
  
  authMiddleware: function ({ req }) {
    let token = req.body.token || req.query.token || req.headers.authorization;
    console.log('Token in middleware:', token)
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      console.log('No token provided');
      return { user: null };
    }

    try {
      // Verify the token and extract the user data from it
      const data = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
      console.log('Token verified, user data:', data);
      return { user: data }; // Return user data to be used in resolvers
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.log('Invalid token: TokenExpiredError');
        return { user: null };
      } else {
        console.log('Invalid token:', err);
        return { user: null };
      }
    }
  },

  signToken: function (user) {
    return jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      secret,
      { expiresIn: expiration }
    );
  },
};
