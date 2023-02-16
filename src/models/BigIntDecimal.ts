import { DataTypes } from 'sequelize'

// @ts-ignore
export class BigIntDecimal extends (DataTypes.DECIMAL as DataTypes.NumberDataTypeConstructor) {
  static parse(value: string): BigInt {
    return BigInt(value)
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
