'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'plan_type', {
      type: Sequelize.ENUM('FREE', 'PRO', 'LEGEND'),
      allowNull: false,
      defaultValue: 'FREE',
    });
    await queryInterface.addColumn('Users', 'plan_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'plan_type');
    await queryInterface.removeColumn('Users', 'plan_expires_at');
  },
};
