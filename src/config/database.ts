import { DataSource, DataSourceOptions } from 'typeorm';
import { initializeTransactionalContext, addTransactionalDataSource, StorageDriver } from 'typeorm-transactional';
import * as dotenv from 'dotenv';
import { AppEnvironmentConfig } from '../enum/app.environment.config.enum';
dotenv.config();

let databaseOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  // logging: 'all',
  logger: 'advanced-console',

  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
}

switch (process.env.NODE_ENV) {
  case AppEnvironmentConfig.TEST:
    databaseOptions = {
      ...databaseOptions,
      database: 'testdb',
      logger: 'advanced-console',
    };
    break;
  case AppEnvironmentConfig.DEVELOPMENT:
    databaseOptions = {
      ...databaseOptions,
      logging: false,
      logger: 'file',
      host: '',
      port: +'',
      username: '',
      password: '',
      database: '',
    };
    break;
  default:
    break;
}
const appDataSource = new DataSource(databaseOptions);
initializeTransactionalContext({ storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE });
addTransactionalDataSource(appDataSource);
export const AppDataSource = appDataSource;
