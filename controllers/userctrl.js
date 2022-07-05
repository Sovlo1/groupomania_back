const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const models = require("../models");
const fs = require("fs");

const mailRegex = /^[\.\-_0-9a-z]+@([a-z])+\.[a-z]+$/;
const passwordRegex = /^([\\.\-_0-9a-zA-Z]){6,20}$/;
const firstNameRegex =
  /^([a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ])+((([\-])?)[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ])*$/;
const lastNameRegex =
  /^([a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ])+((([\- '])?)[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ])*$/;

exports.signup = (req, res) => {
  let mailIsValid = mailRegex.test(req.body.email);
  let passwordIsValid = passwordRegex.test(req.body.password);
  let firstNameIsValid = firstNameRegex.test(req.body.firstName);
  let lastNameIsValid = lastNameRegex.test(req.body.lastName);
  if (
    req.body.email == null ||
    req.body.firstName == null ||
    req.body.lastName == null ||
    req.body.password == null ||
    !mailIsValid ||
    !passwordIsValid ||
    !firstNameIsValid ||
    !lastNameIsValid
  ) {
    return res
      .status(400)
      .json({ error: "please fill every field with valid informations" });
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
        .catch(() => res.status(500).json({ error: "something went wrong" }));
    } else {
      return res.status(400).json({ error: "user already exists" });
    }
  });
};

exports.login = (req, res) => {
  let mailIsValid = mailRegex.test(req.body.email);
  let passwordIsValid = passwordRegex.test(req.body.password);
  const cryptedMail = cryptoJS.SHA256(req.body.email, "RANDOMIZER").toString();
  if (
    req.body.email == null ||
    req.body.password == null ||
    !mailIsValid ||
    !passwordIsValid
  ) {
    return res
      .status(400)
      .json({ error: "email and/or password are either missing or invalid" });
  }
  models.User.findOne({
    where: { email: cryptedMail },
  })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(401).json({ error: "User doesn't exist" });
      }
      bcrypt
        .compare(req.body.password, foundUser.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Incorrect password" });
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
        .catch(() => res.status(500).json({ error: "something went wrong" }));
    })
    .catch(() => res.status(500).json({ error: "something went wrong" }));
};

exports.findUser = (req, res) => {
  models.User.findOne({
    where: { id: req.params.id },
  }).then((foundUser) => {
    if (!foundUser) {
      return res.status(500).json({ error: "couldn't find user" });
    }
    res.status(200).json(foundUser);
  });
};

exports.changePassword = (req, res) => {
  let passwordIsValid = passwordRegex.test(req.body.password);
  let newPasswordIsValid = passwordRegex.test(req.body.newPassword);
  if (!newPasswordIsValid || !passwordIsValid) {
    return res.status(401).json({ error: "Please type a valid password" });
  }
  models.User.findOne({
    where: { id: req.body.userId },
  })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(401).json({ error: "User doesn't exist" });
      }
      bcrypt
        .compare(req.body.password, foundUser.password)
        .then((valid) => {
          if (!valid && !req.auth.isAdmin && !req.auth.isMod) {
            return res.status(401).json({ error: "Incorrect password" });
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
        .catch(() => res.status(500).json({ error: "something went wrong" }));
    })
    .catch(() => res.status(500).json({ error: "something went wrong" }));
};

exports.deleteAccount = (req, res) => {
  let passwordIsValid = passwordRegex.test(req.body.password);
  if (!passwordIsValid || req.body.password == null) {
    return res
      .status(401)
      .json({ error: "The password you typed isn't valid" });
  }
  models.User.findOne({
    where: {
      id: req.body.userId,
    },
  })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(401).json({ error: "User doesn't exist" });
      } else if (foundUser.id == req.auth.userId || req.auth.isAdmin) {
        bcrypt
          .compare(req.body.password, foundUser.password)
          .then((valid) => {
            if (!valid && !req.auth.isAdmin) {
              return res.status(401).json({ error: "Incorrect password" });
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
          .catch(() => res.status(500).json({ error: "something went wrong" }));
      } else {
        return res.status(401).json({ error: "Unauthorized operation" });
      }
    })
    .catch(() => res.status(500).json({ error: "something went wrong" }));
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
    .catch(() => res.status(500).json({ error: "something went wrong" }));
};

exports.updateUser = (req, res) => {
  let checkRegex = { ...JSON.parse(req.body.user) };
  let firstNameIsValid = firstNameRegex.test(checkRegex.firstName);
  let lastNameIsValid = lastNameRegex.test(checkRegex.lastName);
  if (
    !firstNameIsValid ||
    !lastNameIsValid ||
    checkRegex.firstName == null ||
    checkRegex.lastName == null
  ) {
    return res
      .status(400)
      .json({ error: "please fill every field with valid informations" });
  }
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
        if (user.id == req.auth.userId || req.auth.isMod || req.auth.isAdmin) {
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
        } else {
          return res.status(401).json({ error: "Unauthorized operation la" });
        }
      })
      .catch(() => res.status(500).json({ error: "something went wrong" }));
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
    .then(() => res.status(200).json({ message: "Updated user!" }))
    .catch(() => res.status(500).json({ error: "something went wrong" }));
};
