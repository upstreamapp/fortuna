import { DataTypes } from 'sequelize'
import {
  AllowNull,
  Column,
  Model,
  Table,
  DataType,
  PrimaryKey,
  Default
} from 'sequelize-typescript'
import { SyncingState } from '../../@types'

@Table({
  tableName: 'Status',
  createdAt: false,
  updatedAt: true
})
export class Status extends Model {
  @Default('status')
  @PrimaryKey
  @Column(DataType.STRING)
  id: string

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  syncing: boolean

  @Default(SyncingState.BACKFILLING)
  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(SyncingState)))
  syncingState: SyncingState

  @Default([0, 0])
  @AllowNull(false)
  @Column(DataType.ARRAY(DataTypes.INTEGER))
  syncingBlocks: number[]

  @Default(0)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  highestBlock: number
}
