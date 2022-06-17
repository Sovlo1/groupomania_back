const { sequelize } = require("../models");
const models = require("../models");

exports.viewPosts = (req, res) => {
  models.Post.findAll({
    include: [
      { model: models.Comment, include: { model: models.User } },
      { model: models.User },
      { model: models.Like },
    ],
    order: sequelize.literal("id ASC"),
  })
    .then((posts) => {
      res.status(201).json(posts);
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.viewSinglePost = (req, res) => {
  models.Post.findAll({
    where: {
      id: req.params.id,
    },
  })
    .then((post) => res.status(200).json(post))
    .catch((error) => res.status(500).json({ error }));
};

exports.likePost = (req, res) => {
  models.Like.findOne({
    where: { postId: req.body.postId, userId: req.body.userId },
  })
    .then((likedPost) => {
      models.Post.findOne({
        where: { id: req.body.postId },
      }).then((storedPost) => {
        if (likedPost) {
          models.Like.destroy({
            where: { postId: req.body.postId, userId: req.body.userId },
          }).then(() => {
            models.Post.update(
              { likes: storedPost.likes - 1 },
              { where: { id: req.body.postId }, silent: true }
            );
          });
        } else {
          models.Like.create({
            UserId: req.auth.userId,
            PostId: req.body.postId,
          }).then(() => {
            models.Post.update(
              { likes: storedPost.likes + 1 },
              { where: { id: req.body.postId }, silent: true }
            );
          });
        }
      });
    })
    .then(() => res.status(200).json())
    .catch((error) => res.status(500).json({ error }));
};

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
    newPost = { ...JSON.parse(req.body.post) };
  }
  models.Post.create({
    ...newPost,
    UserId: req.auth.userId,
  })
    .then(() => res.status(201).json({ message: "New post created" }))
    .catch((error) => res.status(500).json({ error }));
};

exports.updatePost = (req, res) => {
  let updatedPost;
  if (req.file) {
    updatedPost = {
      ...JSON.parse(req.body.post),
      fileUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
  } else {
    updatedPost = { ...JSON.parse(req.body.post) };
  }
  models.Post.update(
    { ...updatedPost },
    {
      where: { id: req.params.id },
    }
  )
    .then(() => res.status(201).json({ message: "New post created" }))
    .catch((error) => res.status(500).json({ error }));
};

exports.deletePost = (req, res) => {
  models.Post.findOne({
    where: {
      id: req.body.postId,
    },
  })
    .then((post) => {
      if (
        req.auth.userId == post.UserId ||
        req.auth.isAdmin == true ||
        req.auth.isMod == true
      ) {
        models.Post.destroy({
          where: {
            id: req.body.postId,
          },
        });
      } else {
        res.status(401).json({ message: "Unauthorized operation" });
      }
    })
    .then(() => res.status(200).json({ message: "Deleted post" }))
    .catch((error) => res.status(500).json({ error }));
};
