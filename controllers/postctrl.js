const models = require("../models");
const fs = require("fs");

const postRegex =
  /^([0-9a-zA-Z !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ]){2,}$/;

exports.viewPosts = (req, res) => {
  models.Post.findAll({
    order: [
      ["createdAt", "ASC"],
      [models.Comment, "createdAt", "ASC"],
    ],
    include: [
      {
        model: models.Comment,
        include: { model: models.User },
      },
      { model: models.User },
      { model: models.Like },
    ],
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
  if (req.auth.userId !== req.body.userId) {
    return res.status(401).json({ error: "Unauthorized operation" });
  }
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
    .then((post) => res.status(200).json(post))
    .catch((error) => res.status(500).json({ error }));
};

exports.createNewPost = (req, res) => {
  let post = { ...JSON.parse(req.body.post) };
  let isTitleValid = postRegex.test(post.title);
  let isContentValid = postRegex.test(post.content);
  if (!isContentValid || !isTitleValid) {
    return res
      .status(401)
      .json({ error: "Please type a valid title and/or message" });
  }
  console.log(req.body.post);
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
  let post = { ...JSON.parse(req.body.post) };
  let isTitleValid = postRegex.test(post.title);
  let isContentValid = postRegex.test(post.content);
  if (!isContentValid || !isTitleValid) {
    return res
      .status(401)
      .json({ error: "Please type a valid title and/or message" });
  }
  let updatedPost;
  if (req.file) {
    updatedPost = {
      ...JSON.parse(req.body.post),
      fileUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
    models.Post.findOne({ where: { id: req.params.id } })
      .then((post) => {
        if (
          post.UserId !== req.auth.userId ||
          !req.auth.isMod ||
          !req.auth.isAdmin
        ) {
          return res.status(401).json({ error: "Unauthorized operation" });
        }
        if (post.fileUrl !== null) {
          let file = post.fileUrl.split("/files/")[1];
          fs.unlink(`files/${file}`, (err) => {
            if (err) {
              console.log(`Could not delete ${file}`);
            } else {
              console.log(`Successfully deleted ${file}`);
            }
          });
        }
      })
      .catch((error) => res.status(500).json({ error }));
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
        if (post.fileUrl !== null) {
          let file = post.fileUrl.split("/files/")[1];
          fs.unlink(`files/${file}`, (err) => {
            if (err) {
              console.log(`Could not delete ${file}`);
            } else {
              console.log(`Successfully deleted ${file}`);
            }
          });
        }
        models.Post.destroy({
          where: {
            id: req.body.postId,
          },
        });
      } else {
        res.status(401).json({ error: "Unauthorized operation" });
      }
    })
    .then(() => res.status(200).json({ message: "Deleted post" }))
    .catch((error) => res.status(500).json({ error }));
};
