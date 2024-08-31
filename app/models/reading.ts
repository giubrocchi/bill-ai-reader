import sequelize from '../database';
import { DataTypes, Model, Op } from 'sequelize';

class Reading extends Model {
  public id!: string;
  public customerId!: string;
  public measureDatetime!: Date;
  public measureType!: string;
  public imageUrl!: string;
  public measureValue!: number;
  public isConfirmed!: boolean;

  public static async getReadingByTypeAndDate(customerId: string, measureType: string, date: Date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return await Reading.findOne({
      where: {
        customerId,
        measureType,
        measureDatetime: { [Op.between]: [startOfMonth, endOfMonth] },
      },
    });
  }

  public static async insertReading(
    id: string,
    customerId: string,
    measureType: string,
    imageUrl: string,
    measureValue: number
  ) {
    const measureDatetime = new Date();

    return await Reading.create({
      id,
      customerId,
      measureType,
      imageUrl,
      measureValue,
      measureDatetime,
      isConfirmed: false,
    });
  }

  public static async findById(id: string) {
    return await Reading.findOne({ where: { id } });
  }

  public static async updateReadingValue(id: string, measureValue: number) {
    return await Reading.update({ measureValue, isConfirmed: true }, { where: { id } });
  }
}

Reading.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    customerId: { type: DataTypes.STRING, allowNull: false },
    measureDatetime: { type: DataTypes.DATE, allowNull: false },
    measureType: { type: DataTypes.STRING, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    measureValue: { type: DataTypes.FLOAT, allowNull: false },
    isConfirmed: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  { sequelize, tableName: 'reading', timestamps: false }
);

export default Reading;
