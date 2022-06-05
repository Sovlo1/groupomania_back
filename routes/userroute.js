const express = require("express");
const router = express.Router();
const userControl = require("../controllers/userctrl");
const token = require("../middleware/token");

router.post("/signup", userControl.signup);
router.post("/login", userControl.login);
router.put("/modifyPwd", userControl.changePassword);
router.delete("/delete", userControl.deleteAccount);
router.get("/test", userControl.UserAssociatedPosts);
router.get("/about/:id", userControl.findUser);
router.post("/loggeduser", token, userControl.fetchCurrentUser);

module.exports = router;
