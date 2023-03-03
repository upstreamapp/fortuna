'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { DataTypes, QueryInterface, Sequelize } from 'sequelize'
import { SyncingState } from '../@types'
import { Status } from '@models/index'

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
      `CREATE TYPE "syncing_state" AS ENUM ('REALTIME', 'BACKFILLING');`
    )

    await queryInterface.createTable('Status', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: 'status'
      },
      syncing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      syncingState: {
        type: DataTypes.ENUM(...Object.values(SyncingState)),
        allowNull: false,
        defaultValue: SyncingState.BACKFILLING
      },
      syncingBlocks: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: [0, 0]
      },
      highestBlock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    })

    await Status.create({
      id: 'status',
      syncing: false,
      syncingState: SyncingState.BACKFILLING,
      syncingBlocks: [0, 0],
      highestBlock: 0
    })
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Status')
  }
}

export default migration
