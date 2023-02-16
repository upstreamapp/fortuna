import { Op } from 'sequelize'
import {
  AllowNull,
  Column,
  Model,
  Table,
  DataType,
  PrimaryKey,
  UpdatedAt,
  AutoIncrement
} from 'sequelize-typescript'
import { TokenType } from '../../@types'

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
    }
  ]
})
export class TokenInfo extends Model<
  Pick<
    TokenInfo,
    | 'address'
    | 'tokenId'
    | 'tokenType'
    | 'contractName'
    | 'symbol'
    | 'decimals'
    | 'tokenName'
    | 'tokenDescription'
    | 'imageUrl'
    | 'imageData'
    | 'externalUrl'
    | 'animationUrl'
    | 'youtubeUrl'
    | 'tokenUri'
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
  @Column(DataType.ENUM(...Object.values(TokenType)))
  tokenType: Maybe<TokenType>

  @AllowNull(true)
  @Column(DataType.STRING)
  contractName: Maybe<string>

  @AllowNull(true)
  @Column(DataType.STRING)
  symbol: Maybe<string>

  @AllowNull(true)
  @Column(DataType.INTEGER)
  decimals: Maybe<number>

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

  @UpdatedAt
  updatedAt: Date
}
