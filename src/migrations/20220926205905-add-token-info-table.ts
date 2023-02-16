'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { DataTypes, QueryInterface, Sequelize, Op } from 'sequelize'
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
    await queryInterface.createTable('TokenInfo', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'token_info_address_token_id_idx'
      },
      tokenId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: 'token_info_address_token_id_idx'
      },
      tokenType: {
        type: DataTypes.ENUM(...Object.values(TokenType)),
        allowNull: true
      },
      contractName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: true
      },
      decimals: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      tokenName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tokenDescription: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      imageData: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      externalUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      animationUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      youtubeUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      tokenUri: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    })

    await queryInterface.addIndex('TokenInfo', ['address', 'tokenId'], {
      name: 'token_info_address_token_id_idx',
      unique: true,
      where: {
        tokenId: {
          [Op.not]: null
        }
      }
    })

    await queryInterface.addIndex('TokenInfo', ['address'], {
      name: 'token_info_address_idx',
      unique: true,
      where: {
        tokenId: {
          [Op.is]: null
        }
      }
    })
  },

  down: async queryInterface => {
    await queryInterface.dropTable('TokenInfo')
  }
}

export default migration
