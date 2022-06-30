const express = require("express");
const router = express.Router();
const commentControl = require("../controllers/commentctrl");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/new", multer, auth, commentControl.addComment);
router.delete("/delete", auth, commentControl.deleteComment);
router.get("/:id", auth, commentControl.viewSingleComment);

module.exports = router;
