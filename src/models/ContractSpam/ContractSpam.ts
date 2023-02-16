import {
  AllowNull,
  Column,
  Model,
  Table,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique
} from 'sequelize-typescript'

@Table({
  tableName: 'ContractSpam',
  createdAt: false,
  updatedAt: false
})
export class ContractInfo extends Model<Pick<ContractInfo, 'address'>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  address: string
}
