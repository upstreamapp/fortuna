import {
  AllowNull,
  Column,
  Model,
  Table,
  DataType,
  PrimaryKey,
  AutoIncrement,
  UpdatedAt
} from 'sequelize-typescript'
import { TokenType } from '@types'

@Table({
  tableName: 'ContractInfo',
  createdAt: false,
  updatedAt: true,
  indexes: [
    {
      name: 'contract_info_address_idx',
      unique: true,
      fields: ['address']
    }
  ]
})
export class ContractInfo extends Model<
  Partial<ContractInfo> & Pick<ContractInfo, 'address'>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  address: string

  @AllowNull(true)
  @Column(DataType.ENUM(...Object.values(TokenType)))
  tokenType: Maybe<TokenType>

  @AllowNull(true)
  @Column(DataType.TEXT)
  name: Maybe<string>

  @AllowNull(true)
  @Column(DataType.TEXT)
  symbol: Maybe<string>

  @AllowNull(true)
  @Column(DataType.DECIMAL)
  ethBalance: Maybe<BigInt>

  @AllowNull(true)
  @Column(DataType.INTEGER)
  decimals: Maybe<number>

  @AllowNull(true)
  @Column(DataType.INTEGER)
  lastTransactionBlock: Maybe<number>

  @AllowNull(true)
  @Column(DataType.DATE)
  lastTransactionAt: Maybe<Date>

  @AllowNull(true)
  @Column(DataType.DATE)
  updatedMetaInfoAt: Maybe<Date>

  @UpdatedAt
  updatedAt: Date
}
