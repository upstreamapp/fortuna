'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { QueryInterface, Sequelize } from 'sequelize'

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
      `ALTER TABLE ONLY "TokenInfo"
    ADD CONSTRAINT "TokenInfo_contractInfoId_fkey" FOREIGN KEY ("contractInfoId") REFERENCES "ContractInfo"(id);`,
      { raw: true }
    )
    // await queryInterface.changeColumn('TokenInfo', 'contractInfoId', {
    //   type: DataTypes.INTEGER,
    //   allowNull: false
    // })
  },

  down: async queryInterface => {
    await queryInterface.removeConstraint(
      'TokenInfo',
      'TokenInfo_contractInfoId_fkey'
    )
  }
}

export default migration
