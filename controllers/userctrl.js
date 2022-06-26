const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
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
  const cryptedReqMail = cryptoJS
    .SHA256(req.body.email, "RANDOMIZER")
    .toString();
  models.User.findOne({
    attributes: ["email"],
    where: { email: cryptedReqMail },
  }).then((foundUser) => {
    if (!foundUser) {
      const cryptedMail = cryptoJS
        .SHA256(req.body.email, "RANDOMIZER")
        .toString();
      bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
          models.User.create({
            email: cryptedMail,
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
  const cryptedMail = cryptoJS.SHA256(req.body.email, "RANDOMIZER").toString();
  if (req.body.email == null || req.body.password == null) {
    return res.status(400).json({ message: "missing informations" });
  }
  models.User.findOne({
    where: { email: cryptedMail },
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
                expiresIn: 60 * 60 * 24 * 30,
              }
            );
            return res.status(200).json({
              foundUser,
              userId,
              isAdmin,
              isMod,
              token,
            });
          }
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.findUser = (req, res) => {
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
    where: { id: req.body.userId },
  })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(401).json({ erreur: "User doesn't exist" });
      }
      bcrypt
        .compare(req.body.password, foundUser.password)
        .then((valid) => {
          if (!valid && !req.auth.isAdmin && !req.auth.isMod) {
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
                    where: { id: req.body.userId },
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
        bcrypt
          .compare(req.body.password, foundUser.password)
          .then((valid) => {
            if (!valid && !req.auth.isAdmin) {
              return res.status(401).json({ erreur: "Incorrect password" });
            } else {
              (models.Post.findAll({
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
              }),
              models.User.destroy({
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
  try {
    const token = req.body.token;
    const decodedToken = jwt.verify(token, "RANDOMIZER");
    req.token = decodedToken;
  } catch {
    res.status(500).json({ error: "something went wrong" });
  }
  models.User.findOne({
    where: { id: req.token.userId },
  })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(500).json({ error: "Something went wrong" });
      }
      res.status(200).json(foundUser);
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.updateUser = (req, res) => {
  let updatedUser;
  if (req.file) {
    updatedUser = {
      ...JSON.parse(req.body.user),
      profilePicUrl: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    };
    models.User.findOne({ where: { id: req.body.userId } })
      .then((user) => {
        if (user.profilePicUrl !== null) {
          let file = user.profilePicUrl.split("/files/")[1];
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
    updatedUser = JSON.parse(req.body.user);
  }
  models.User.update(
    { ...updatedUser },
    {
      where: {
        id: req.body.userId,
      },
    }
  )
    .then(() => res.status(201).json({ message: "Updated user!" }))
    .catch((error) => res.status(500).json({ error }));
};

exports.UserAssociatedPosts = (req, res) => {
  models.User.findAll({ include: models.Post }).then((allo) => {
    res.status(200).json({ allo });
  });
};
