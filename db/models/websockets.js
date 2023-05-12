/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Websockets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Websockets.init({
    connection: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    url: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    updated_at: {
      type: 'TIMESTAMP',
      allowNull: false,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
  }, {
    sequelize,
    modelName: 'Websockets',
    tableName: 'websockets',
  });
  return Websockets;
};
