import { Op } from 'sequelize'
import {
  AllowNull,
  Column,
  Model,
  Table,
  DataType,
  PrimaryKey,
  UpdatedAt,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript'
import { ContractInfo } from '@models/ContractInfo/ContractInfo'

@Table({
  tableName: 'TokenInfo',
  createdAt: false,
  updatedAt: true,
  indexes: [
    {
      name: 'token_info_address_token_id_idx',
      unique: true,
      fields: ['address', 'tokenId'],
      where: {
        tokenId: {
          [Op.not]: null
        }
      }
    },
    {
      name: 'token_info_address_idx',
      unique: true,
      fields: ['address'],
      where: {
        tokenId: {
          [Op.is]: null
        }
      }
    },
    {
      name: 'token_info_contract_info_id_idx',
      fields: ['contractInfoId']
    }
  ]
})
export class TokenInfo extends Model<
  Pick<
    TokenInfo,
    | 'address'
    | 'tokenId'
    | 'tokenName'
    | 'tokenDescription'
    | 'imageUrl'
    | 'imageData'
    | 'externalUrl'
    | 'animationUrl'
    | 'youtubeUrl'
    | 'tokenUri'
    | 'contractInfoId'
  >
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  address: string

  @AllowNull(true)
  @Column(DataType.STRING)
  tokenId: Maybe<string>

  @AllowNull(true)
  @Column(DataType.STRING)
  tokenName: Maybe<string>

  @AllowNull(true)
  @Column(DataType.TEXT)
  tokenDescription: Maybe<string>

  @AllowNull(true)
  @Column(DataType.TEXT)
  imageUrl: Maybe<string>

  @AllowNull(true)
  @Column(DataType.TEXT)
  imageData: Maybe<string>

  @AllowNull(true)
  @Column(DataType.TEXT)
  externalUrl: Maybe<string>

  @AllowNull(true)
  @Column(DataType.TEXT)
  animationUrl: Maybe<string>

  @AllowNull(true)
  @Column(DataType.TEXT)
  youtubeUrl: Maybe<string>

  @AllowNull(true)
  @Column(DataType.TEXT)
  tokenUri: Maybe<string>

  @ForeignKey(() => ContractInfo)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  contractInfoId: number

  @BelongsTo(() => ContractInfo, 'contractInfoId')
  contractInfo: ContractInfo

  @UpdatedAt
  updatedAt: Date
}
