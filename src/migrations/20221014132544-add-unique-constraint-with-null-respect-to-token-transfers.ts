'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { QueryInterface, Sequelize, Op } from 'sequelize'

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
    await queryInterface.removeIndex(
      'TokenTransfer',
      'token_transfer_transaction_hash_log_index_token_id_key'
    )

    await queryInterface.addIndex(
      'TokenTransfer',
      ['transactionHash', 'logIndex', 'tokenId'],
      {
        name: 'token_transfer_transaction_hash_log_index_token_id_key',
        unique: true,
        where: {
          tokenId: {
            [Op.not]: null
          }
        }
      }
    )

    await queryInterface.addIndex(
      'TokenTransfer',
      ['transactionHash', 'logIndex'],
      {
        name: 'token_transfer_transaction_hash_log_index_key',
        unique: true,
        where: {
          tokenId: {
            [Op.is]: null
          }
        }
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
      'token_transfer_transaction_hash_log_index_key'
    )
  }
}

export default migration
