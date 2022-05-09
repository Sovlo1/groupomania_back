const express = require("express");
const router = express.Router();
const postControl = require("../controllers/postctrl");

router.post("/new", postControl.createNewPost)

module.exports = router;