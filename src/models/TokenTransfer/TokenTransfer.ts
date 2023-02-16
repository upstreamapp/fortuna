import { Op } from 'sequelize'
import { AllowNull, Column, Model, Table, DataType } from 'sequelize-typescript'
import { TokenType } from '../../@types'

@Table({
  tableName: 'TokenTransfer',
  timestamps: false,
  indexes: [
    {
      name: 'token_transfer_token_address_idx',
      unique: false,
      fields: ['tokenAddress']
    },
    {
      name: 'token_transfer_from_address_idx',
      unique: false,
      fields: ['fromAddress']
    },
    {
      name: 'token_transfer_to_address_idx',
      unique: false,
      fields: ['toAddress']
    },
    {
      name: 'token_transfer_transaction_hash_log_index_token_id_key',
      unique: true,
      fields: ['transactionHash', 'logIndex', 'tokenId'],
      where: {
        tokenId: {
          [Op.not]: null
        }
      }
    },
    {
      name: 'token_transfer_transaction_hash_log_index_key',
      unique: true,
      fields: ['transactionHash', 'logIndex'],
      where: {
        tokenId: {
          [Op.is]: null
        }
      }
    }
  ]
})
export class TokenTransfer extends Model {
  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(TokenType)))
  tokenType: TokenType

  @AllowNull(false)
  @Column(DataType.STRING)
  tokenAddress: string

  @AllowNull(false)
  @Column(DataType.STRING)
  fromAddress: string

  @AllowNull(false)
  @Column(DataType.STRING)
  toAddress: string

  @AllowNull(true)
  @Column(DataType.STRING)
  operator: Maybe<string>

  @AllowNull(true)
  @Column(DataType.STRING)
  tokenId: Maybe<string>

  @AllowNull(true)
  @Column(DataType.DECIMAL)
  value: Maybe<BigInt>

  @AllowNull(false)
  @Column(DataType.STRING)
  transactionHash: string

  @AllowNull(false)
  @Column(DataType.INTEGER)
  logIndex: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  blockNumber: number
}
