const express = require("express");
const router = express.Router();
const postControl = require("../controllers/postctrl");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/new", auth, multer, postControl.createNewPost);
router.delete("/delete", auth, postControl.deletePost);
router.get("/posts", postControl.viewPosts);

module.exports = router;
