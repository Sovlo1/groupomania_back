const express = require("express");
const router = express.Router();
const userControl = require("../controllers/userctrl");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/signup", userControl.signup);
router.post("/login", userControl.login);
router.put("/modifypassword", auth, userControl.changePassword);
router.put("/updateuser", auth, multer, userControl.updateUser);
router.delete("/delete", auth, userControl.deleteAccount);
router.get("/about/:id", auth, userControl.findUser);
router.post("/loggeduser", auth, userControl.fetchCurrentUser);

module.exports = router;
