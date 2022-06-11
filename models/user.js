"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.hasMany(models.Post, { onDelete: "cascade" });
      models.User.hasMany(models.Comment, { onDelete: "cascade" });
      models.User.belongsToMany(models.Post, { through: models.Like });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      password: DataTypes.STRING,
      profilePicUrl: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN,
      isMod: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );
  return User;
};
