import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'readings',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || 'rootroot',
  { host: 'mysql', dialect: 'mysql' }
);

sequelize
  .authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Unable to connect to the database:', err));

export default sequelize;
