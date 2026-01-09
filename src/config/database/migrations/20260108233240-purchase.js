'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('NotePurchases', 'amount_paid', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    });
    await queryInterface.addColumn('NotePurchases', 'is_quota_purchase', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('NotePurchases', 'amount_paid');
    await queryInterface.removeColumn('NotePurchases', 'is_quota_purchase');
  },
};
