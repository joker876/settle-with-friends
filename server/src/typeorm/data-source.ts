import 'dotenv/config';
import { DataSource } from 'typeorm';
import { entities } from './entities';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities,
  migrations: ['src/typeorm/migrations/*.ts'],
  synchronize: false,
  extra: {
    decimalNumbers: true,
  },
});
