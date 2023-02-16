'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { DataTypes, QueryInterface, Sequelize } from 'sequelize'
import { TokenType } from '../@types'

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
    await queryInterface.sequelize.query(
      `CREATE TYPE "TokenType" AS ENUM ('ERC_1155', 'ERC_721', 'ERC_20');`
    )

    await queryInterface.createTable('TokenTransfer', {
      tokenType: {
        type: DataTypes.ENUM(...Object.values(TokenType)),
        allowNull: false
      },
      tokenAddress: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fromAddress: {
        type: DataTypes.STRING,
        allowNull: false
      },
      toAddress: {
        type: DataTypes.STRING,
        allowNull: false
      },
      operator: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tokenId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      value: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      transactionHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      logIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      blockNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    })

    await queryInterface.addIndex('TokenTransfer', ['tokenAddress'], {
      name: 'token_transfer_token_address_idx',
      unique: false
    })

    await queryInterface.addIndex('TokenTransfer', ['fromAddress'], {
      name: 'token_transfer_from_address_idx',
      unique: false
    })

    await queryInterface.addIndex('TokenTransfer', ['toAddress'], {
      name: 'token_transfer_to_address_idx',
      unique: false
    })

    await queryInterface.addIndex(
      'TokenTransfer',
      ['transactionHash', 'logIndex', 'tokenId'],
      {
        name: 'token_transfer_transaction_hash_log_index_token_id_key',
        unique: true
      }
    )
  },

  down: async queryInterface => {
    await queryInterface.removeIndex(
      'TokenTransfer',
      'token_transfer_transaction_hash_log_index_token_id_key'
    )

    await queryInterface.removeIndex(
      'TokenTransfer',
      'token_transfer_to_address_idx'
    )

    await queryInterface.removeIndex(
      'TokenTransfer',
      'token_transfer_from_address_idx'
    )

    await queryInterface.removeIndex(
      'TokenTransfer',
      'token_transfer_token_address_idx'
    )

    await queryInterface.dropTable('TokenTransfer')
  }
}

export default migration
