/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('websockets-proposals', {
      connection: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      proposal: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      'websockets-proposals',
      ['connection'],
      {
        name: 'websocket-proposals-connection_idx',
        fields: ['connection']
      });

    await queryInterface.addIndex(
      'websockets-proposals',
      ['proposal'],
      {
        name: 'websocket-proposals-proposal_idx',
        fields: ['proposal']
      }); // TODO: Break down each index into its own migration to improve error handling
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('websockets-proposals');
  },
};
