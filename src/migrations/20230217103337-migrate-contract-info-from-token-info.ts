'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { QueryInterface, QueryTypes, Sequelize } from 'sequelize'

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
      `
      INSERT INTO "ContractInfo" (address, "tokenType", "name", symbol, decimals, "updatedAt", "updatedMetaInfoAt")
      SELECT
        address,
        ("tokenType"::text)::"enum_ContractInfo_tokenType",
        "contractName",
        symbol,
        decimals,
        now(),
        now()
      FROM (
        SELECT
          address,
          "tokenType",
          "contractName",
          symbol,
          decimals
        FROM ( SELECT DISTINCT
            address,
            "tokenType",
            "contractName",
            symbol,
            decimals,
            ROW_NUMBER() OVER (PARTITION BY address ORDER BY "updatedAt" DESC) AS rowNum
          FROM
            "TokenInfo"
          WHERE
            address NOT in(
            SELECT
              address FROM "ContractInfo")) d
        WHERE
          rowNum = 1) d2;`,
      {
        raw: true,
        type: QueryTypes.INSERT
      }
    )

    await queryInterface.sequelize.query(
      `CREATE OR REPLACE PROCEDURE public.update_contract_info_id()
        LANGUAGE plpgsql
        AS $procedure$
        DECLARE
          _id int := (
            SELECT
              min(id)
            FROM
              "TokenInfo"
            WHERE
              "contractInfoId" IS NULL);
          _max_id int := (
            SELECT
              max(id)
            FROM
              "TokenInfo"
            WHERE
              "contractInfoId" IS NULL);
          _batch_size int = 100000;
        BEGIN
          LOOP
            RAISE NOTICE 'updating IDs from % to %', _id, _id + _batch_size;
            UPDATE
              "TokenInfo"
            SET
              "contractInfoId" = "ContractInfo".id
            FROM
              "ContractInfo"
            WHERE
              "TokenInfo".address = "ContractInfo".address
              AND "TokenInfo".id >= _id
              AND "TokenInfo".id < _id + _batch_size
              AND "contractInfoId" IS NULL;
            COMMIT;
            _id := _id + _batch_size;
            IF _id > _max_id THEN
              EXIT;
            END IF;
          END LOOP;
        END;
        $procedure$`,
      { raw: true }
    )

    await queryInterface.sequelize.query(`call update_contract_info_id();`, {
      raw: true
    })
  },

  down: async () => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
}

export default migration
