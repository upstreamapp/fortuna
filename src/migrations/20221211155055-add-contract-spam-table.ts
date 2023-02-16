'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { DataTypes, QueryInterface, Sequelize } from 'sequelize'

interface IMigration {
  up: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>
  down: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>
}

/**
 * Typescript based sequelize migration
 * @see https://sequelize.org/master/manual/migrations.html
 */

const migration: IMigration = {
  up: async queryInterface => {
    await queryInterface.createTable('ContractSpam', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    })
  },

  down: async queryInterface => {
    await queryInterface.dropTable('ContractSpam')
  }
}

export default migration
