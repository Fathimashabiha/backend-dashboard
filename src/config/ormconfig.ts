import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST']!, // Use bracket notation
  port: parseInt(process.env['DB_PORT']!), // Use bracket notation
  username: process.env['DB_USERNAME']!, // Use bracket notation
  password: process.env['DB_PASSWORD']!, // Use bracket notation
  database: process.env['DB_DATABASE']!, // Use bracket notation
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});