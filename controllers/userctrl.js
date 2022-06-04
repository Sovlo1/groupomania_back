const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const models = require("../models");
const fs = require("fs");

exports.signup = (req, res) => {
  if (
    req.body.email == null ||
    req.body.firstName == null ||
    req.body.lastName == null ||
    req.body.password == null
  ) {
    return res.status(400).json({ message: "missing informations" });
  }
  models.User.findOne({
    attributes: ["email"],
    where: { email: req.body.email },
  }).then((foundUser) => {
    if (!foundUser) {
      bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
          models.User.create({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
          });
        })
        .then(() => res.status(201).json({ message: "signup successful!" }))
        .catch((error) => res.status(500).json({ error }));
    } else {
      return res.status(400).json({ message: "user already exists" });
    }
  });
};

exports.login = (req, res) => {
  if (req.body.email == null || req.body.password == null) {
    return res.status(400).json({ message: "missing informations" });
  }
  models.User.findOne({
    where: { email: req.body.email },
  })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(401).json({ erreur: "User doesn't exist" });
      }
      bcrypt
        .compare(req.body.password, foundUser.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ erreur: "Incorrect password" });
          } else {
            const userId = foundUser.id.toString();
            const isAdmin = foundUser.isAdmin;
            const isMod = foundUser.isMod;
            const token = jwt.sign(
              {
                userId: userId,
                isAdmin: isAdmin,
                isMod: isMod,
              },
              "RANDOMIZER",
              {
                expiresIn: 60 * 60 * 24 * 30 * 6,
              }
            );
            return res.status(200).json({
              userId,
              isAdmin,
              isMod,
              token,
            });
          }
        })
        .catch((error) => res.status(500).json({ error: "ici" }));
    })
    .catch((error) => res.status(500).json({ error: "la" }));
};

exports.findUser = (req, res) => {
  console.log(req.auth);
  models.User.findOne({
    where: { id: req.params.id },
  }).then((foundUser) => {
    if (!foundUser) {
      return res.status(500).json({ error: "Something went wrong" });
    }
    res.status(200).json(foundUser);
  });
};

exports.changePassword = (req, res) => {
  models.User.findOne({
    where: { email: req.body.email },
  })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(401).json({ erreur: "User doesn't exist" });
      }
      bcrypt
        .compare(req.body.password, foundUser.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ erreur: "Incorrect password" });
          } else {
            bcrypt
              .hash(req.body.newPassword, 10)
              .then((hash) => {
                models.User.update(
                  {
                    password: hash,
                  },
                  {
                    where: { email: req.body.email },
                  }
                );
              })
              .then(() =>
                res
                  .status(200)
                  .json({ message: "successfully changed password" })
              );
          }
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.deleteAccount = (req, res) => {
  models.User.findOne({
    where: {
      id: req.body.userId,
    },
  })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(401).json({ erreur: "User doesn't exist" });
      } else {
        models.Post.findAll({
          where: {
            userId: req.body.userId,
          },
        }).then((Posts) => {
          for (let i = 0; i < Posts.length; i++) {
            if (Posts[i].fileUrl !== null) {
              let file = Posts[i].fileUrl.split("/files/")[1];
              fs.unlink(`files/${file}`, (err) => {
                if (err) {
                  console.log(`Could not delete ${file}`);
                } else {
                  console.log(`Successfully deleted ${file}`);
                }
              });
            }
          }
        });
        bcrypt
          .compare(req.body.password, foundUser.password)
          .then((valid) => {
            if (!valid) {
              return res.status(401).json({ erreur: "Incorrect password" });
            } else {
              (models.User.destroy({
                where: {
                  id: req.body.userId,
                },
              }),
              models.Post.destroy({
                where: {
                  userId: req.body.userId,
                },
              }),
              models.Comment.destroy({
                where: {
                  userId: req.body.userId,
                },
              })).then(() => {
                res.status(200).json({ message: "user removed" });
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.fetchCurrentUser = (req, res) => {
  console.log(req.body);
  const token = req.body.token;
  let userId;
  if (token) {
    try {
      const decodedToken = jwt.verify(token, "RANDOMIZER");
      userId = decodedToken.userId;
    } catch (error) {
      res.status(401).json({ error: error | "nul à chier" });
    }
    if (decodedToken) {
      models.User.findOne({
        where: { id: userId },
      }).then((foundUser) => {
        if (!foundUser) {
          return res.status(500).json({ error: "Something went wrong" });
        }
        res
          .status(200)
          .json(foundUser)
          .catch((error) => res.status(500).json({ error }));
      });
    } else {
      res.status(404).json({ message: "missing decodedtoken" });
    }
  } else {
    res.status(404).json({ message: "missing token nul" });
  }
};

exports.UserAssociatedPosts = (req, res) => {
  models.User.findAll({ include: models.Post }).then((allo) => {
    console.log(allo);
    res.status(200).json({ allo });
  });
};
