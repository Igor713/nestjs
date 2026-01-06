import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) ?? 5432,
  username: process.env.DATABASE_USERNAME,
  password: String(process.env.DATABASE_PASSWORD),
  database: process.env.DATABASE_NAME,
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
