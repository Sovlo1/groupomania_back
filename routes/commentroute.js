const express = require("express");
const router = express.Router();
const commentControl = require("../controllers/commentctrl");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

// router.get("/comments", commentControl.viewComments);
router.post("/new", multer, auth, commentControl.addComment);

module.exports = router;
