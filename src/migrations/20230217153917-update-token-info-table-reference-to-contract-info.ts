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
    await queryInterface.addIndex('TokenInfo', ['contractInfoId'], {
      name: 'token_info_contract_info_id_idx',
      unique: false
    })
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

  down: async () => {
    // await queryInterface.removeConstraint('TokenInfo', 'contractInfoId')
  }
}

export default migration
