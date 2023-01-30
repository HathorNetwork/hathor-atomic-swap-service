const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Proposals extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Proposals.init({
    proposal: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    hashed_auth_password: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    version: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    partial_tx: {
      type: DataTypes.TEXT('medium'),
      allowNull: false,
    },
    signatures: {
      type: DataTypes.TEXT,
    },
    history: {
      type: DataTypes.TEXT('long'),
    },
    created_at: {
      type: 'TIMESTAMP',
      allowNull: false,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      allowNull: false,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
  }, {
    sequelize,
    modelName: 'Proposals',
  });
  return Proposals;
};
