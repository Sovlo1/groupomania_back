const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.body.token;
    console.log(token);
    const decodedToken = jwt.verify(token, "RANDOMIZER");
    console.log(decodedToken);
    const userId = decodedToken.userId;
    const isAdmin = decodedToken.isAdmin;
    const isMod = decodedToken.isMod;
    req.token = { userId, isAdmin, isMod };
    next();
  } catch (error) {
    res.status(401).json({ error: error | "Unauthorized request" });
  }
};
