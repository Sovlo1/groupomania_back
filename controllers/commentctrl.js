const models = require("../models");

exports.addComment = (req, res) => {
  let newComment;
  if (req.file) {
    console.log("sup");
    newComment = {
      ...JSON.parse(req.body.post),
      fileUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
  } else {
    console.log("hello");
    newComment = { ...JSON.parse(req.body.comment) };
  }
  console.log(newPost);
  models.Comment.create({
    ...newPost,
    UserId: req.auth.userId,
    PostId: req.body.postId,
  })
    .then(() => res.status(201).json({ message: "New post created" }))
    .catch((error) => res.status(500).json({ error }));
};
