const jwt = require("jsonwebtoken");

const isAuthenticate = async (req, res, next) => {
  const authToken = req.cookies.__authToken;

  if (!authToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(authToken, process.env.jwt_secret, async (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        console.log("error: Token has expired");
        return res.status(401).json({ message: "Token expired" });
      } else if (err.name === "JsonWebTokenError") {
        console.log("error: Invalid token");
        return res.status(403).json({ message: "Invalid token" });
      } else if (err.name === "NotBeforeError") {
        console.log("error: Token not active");
        return res.status(403).json({ message: "Token not yet active" });
      } else {
        console.log("error:", err);
        return res.status(403).json({ message: "Forbidden", error:err });
      }
    }

    // Proceed if verification is successful
    req.user = user.userId;
    next();
  });
};

module.exports = isAuthenticate;
