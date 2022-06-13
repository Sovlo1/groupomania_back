const models = require("../models");

exports.addComment = (req, res) => {
  let newComment;
  if (req.file) {
    newComment = {
      ...JSON.parse(req.body.comment),
      fileUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
  } else {
    newComment = JSON.parse(req.body.comment);
  }
  models.Comment.create({
    ...newComment,
    UserId: req.auth.userId,
    PostId: req.body.postId,
  })
    .then(() => res.status(201).json({ message: "New comment created" }))
    .catch((error) => res.status(500).json({ error }));
};

exports.deleteComment = (req, res) => {
  models.Comment.findOne({
    where: {
      id: req.body.commentId,
    },
  })
    .then((comment) => {
      if (
        req.auth.userId == comment.UserId ||
        req.auth.isAdmin == true ||
        req.auth.isMod == true
      ) {
        models.Comment.destroy({
          where: {
            id: req.body.commentId,
          },
        });
      } else {
        res.status(401).json({ message: "Unauthorized operation" });
      }
    })
    .then(() => res.status(200).json({ message: "Deleted post" }))
    .catch((error) => res.status(500).json({ error }));
};
