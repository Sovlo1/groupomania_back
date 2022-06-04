const express = require("express");
const router = express.Router();
const userControl = require("../controllers/userctrl");
const auth = require("../middleware/auth");

router.post("/signup", userControl.signup);
router.post("/login", userControl.login);
router.put("/modifyPwd", userControl.changePassword);
router.delete("/delete", userControl.deleteAccount);
router.get("/test", userControl.UserAssociatedPosts);
router.get("/about/:id", userControl.findUser);
router.post("/loggeduser", userControl.fetchCurrentUser);

module.exports = router;
