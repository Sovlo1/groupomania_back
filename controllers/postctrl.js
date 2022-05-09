const models = require("../models");

exports.createNewPost = (req, res) => {
  let newPost;
  if (req.file) {
    newPost = {
      ...JSON.parse(req.body.post),
      fileUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
  } else {
    newPost = { ...req.body };
  }
  models.Post.create({
    newPost,
  })
    .then(() => res.status(201).json({ message: "New post created" }))
    .catch((error) => res.status(500).json({ error }));
};
