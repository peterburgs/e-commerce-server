const expressJwt = require("express-jwt");

const isRevoked = async (req, payload, done) => {
  console.log("*** Payload: ", payload);
  if (!payload.isAdmin) {
    // Reject token if user is not admin
    done(null, true);
  }
  // Accept token
  done();
};

const authJwt = () => {
  const api = process.env.API_URL;
  return expressJwt({
    secret: process.env.SECRET_KEY,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    // Exclude paths
    path: [
      `${api}/users/login`,
      `${api}/users/signup`,
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
    ],
  });
};

module.exports = authJwt;
