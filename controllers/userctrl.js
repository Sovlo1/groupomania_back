const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const models = require("../models");

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
          const newUser = models.User.create({
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
          }
          res.status(200).json({
            userId: foundUser.id,
            isAdmin: foundUser.isAdmin,
            isMod: foundUser.isMod,
            token: jwt.sign(
              {
                userId: foundUser.id,
                isAdmin: foundUser.isAdmin,
                isMod: foundUser.isMod,
              },
              "RANDOMIZER",
              {
                expiresIn: "24h",
              }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
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
  models.User.destroy({
    where: {
      email: req.body.email,
    },
  })
    .then(() => res.status(200).json({ message: "Deleted account" }))
    .catch((error) => res.status(500).json({ error }));
};
