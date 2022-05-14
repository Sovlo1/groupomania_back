const models = require("../models");

exports.viewPosts = (req, res) => {
  models.Post.findAll()
    .then((posts) => res.status(201).json(posts))
    .catch((error) => res.status(500).json({ error }));
};

exports.createNewPost = (req, res) => {
  console.log(req.auth);
  let newPost;
  if (req.file) {
    newPost = {
      ...req.body,
      fileUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
  } else {
    newPost = { ...req.body };
  }
  models.Post.create({
    ...newPost,
    UserId: req.auth.userId,
  })
    .then(() => res.status(201).json({ message: "New post created" }))
    .catch((error) => res.status(500).json({ error }));
};

exports.deletePost = (req, res) => {
  models.Post.findOne({
    where: {
      id: req.body.id,
    },
  })
    .then((post) => {
      console.log(post.UserId);
      if (
        req.auth.userId == post.UserId ||
        req.auth.isAdmin == true ||
        req.auth.isMod == true
      ) {
        models.Post.destroy({
          where: {
            id: req.body.id,
          },
        });
      } else {
        res.status(401).json({ message: "Unauthorized operation" });
      }
    })
    .then(() => res.status(200).json({ message: "Deleted post" }))
    .catch((error) => res.status(500).json({ error }));
};
