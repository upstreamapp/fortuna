'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { DataTypes, QueryInterface, Sequelize } from 'sequelize'
import { TokenType } from '@types'

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
    await queryInterface.createTable('ContractInfo', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'contract_info_address_idx'
      },
      tokenType: {
        type: DataTypes.ENUM(...Object.values(TokenType)),
        allowNull: true
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      symbol: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ethBalance: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      decimals: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      lastTransactionBlock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      lastTransactionAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updatedMetaInfoAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    })

    // add column for migration and later reference
    await queryInterface.addIndex('ContractInfo', ['address'], {
      name: 'contract_info_address_idx',
      unique: true
    })

    await queryInterface.addColumn('TokenInfo', 'contractInfoId', {
      type: DataTypes.INTEGER,
      allowNull: true
    })
  },

  down: async queryInterface => {
    await queryInterface.dropTable('ContractInfo')
  }
}

export default migration
