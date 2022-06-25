"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        email: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING,
        },
        firstName: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        profilePicUrl: {
          allowNull: true,
          defaultValue: null,
          type: Sequelize.STRING,
        },
        bio: {
          allowNull: true,
          defaultValue: null,
          type: Sequelize.TEXT,
        },
        lastName: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        password: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        isAdmin: {
          defaultValue: false,
          type: Sequelize.BOOLEAN,
        },
        isMod: {
          defaultValue: false,
          type: Sequelize.BOOLEAN,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        deletedAt: {
          allowNull: true,
          type: Sequelize.DATE,
        },
      },
      {
        paranoid: true,
        timestamps: true,
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
