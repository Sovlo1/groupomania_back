const express = require("express");
const router = express.Router();
const postControl = require("../controllers/postctrl");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/new", auth, multer, postControl.createNewPost);
router.delete("/delete", auth, postControl.deletePost);
router.get("/posts", auth, postControl.viewPosts);
router.get("/:id", auth, multer, postControl.viewSinglePost);
router.put("/edit/:id", auth, multer, postControl.updatePost);
router.put("/like/:id", auth, postControl.likePost);

module.exports = router;
