/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('websockets', {
      connection: {
        type: Sequelize.STRING(64),
        allowNull: false,
        primaryKey: true,
      },
      url: {
        type: Sequelize.STRING(1000), // Large size, to accept possibly complex domain URLs
        allowNull: false,
      },
      updated_at: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('websockets');
  },
};
