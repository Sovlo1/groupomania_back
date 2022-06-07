const models = require("../models");

exports.addComment = (req, res) => {
  console.log(req.body);
  console.log(JSON.parse(req.body.comment));
  console.log(req.body.postId);
  let newComment;
  if (req.file) {
    console.log("sup");
    newComment = {
      ...JSON.parse(req.body.comment),
      fileUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
  } else {
    console.log("hello");
    newComment = JSON.parse(req.body.comment);
  }
  console.log(newComment);
  models.Comment.create({
    ...newComment,
    UserId: req.auth.userId,
    PostId: req.body.postId,
  })
    .then(() => res.status(201).json({ message: "New comment created" }))
    .catch((error) => res.status(500).json({ error }));
};
