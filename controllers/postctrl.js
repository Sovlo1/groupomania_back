const { sequelize } = require("../models");
const models = require("../models");

exports.viewPosts = (req, res) => {
  models.Post.findAll({
    include: [
      { model: models.Comment, include: { model: models.User } },
      { model: models.User },
    ],
    order: sequelize.literal("id ASC"),
  })
    .then((posts) => {
      console.log(posts);
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

exports.createNewPost = (req, res) => {
  console.log("INITIAL REQUEST");
  console.log(req.body);
  let newPost;
  if (req.file) {
    console.log("NEWPOST WITH FILE HERE");
    newPost = {
      ...JSON.parse(req.body.post),
      fileUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
  } else {
    console.log("NEWPOST NO FILE HERE");
    newPost = { ...JSON.parse(req.body.post) };
  }
  console.log("FINAL NEWPOST");
  console.log(newPost);
  models.Post.create({
    ...newPost,
    UserId: req.auth.userId,
  })
    .then(() => res.status(201).json({ message: "New post created" }))
    .catch((error) => res.status(500).json({ error }));
};

exports.updatePost = (req, res) => {
  console.log(req.body);
  let updatedPost;
  if (req.file) {
    console.log("NEWPOST WITH FILE HERE");
    updatedPost = {
      ...JSON.parse(req.body.post),
      fileUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
  } else {
    console.log("NEWPOST NO FILE HERE");
    updatedPost = { ...JSON.parse(req.body.post) };
  }
  console.log("FINAL NEWPOST");
  console.log(updatedPost);
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
  console.log(req.body);
  models.Post.findOne({
    where: {
      id: req.body.postId,
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
