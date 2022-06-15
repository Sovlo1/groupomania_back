const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "RANDOMIZER");
    const userId = decodedToken.userId;
    const isAdmin = decodedToken.isAdmin;
    const isMod = decodedToken.isMod;
    req.auth = { userId, isAdmin, isMod };
    if (
      req.body.userId &&
      req.body.userId != userId &&
      isAdmin !== true &&
      isMod !== true
    ) {
      throw "Invalid user ID";
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ error: error | "Unauthorized request" });
  }
};
