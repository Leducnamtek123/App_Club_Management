require('./dist/boilerplate.polyfill');
const dotenv = require('dotenv');
const { DataSource } = require('typeorm');
const { UserSubscriber } = require('./dist/entity-subscribers/user-subscriber');
const { SnakeNamingStrategy } = require('./dist/snake-naming.strategy');

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

const dataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '12345678',
        database: process.env.DB_DATABASE || 'club_management',
      }),
  namingStrategy: new SnakeNamingStrategy(),
  subscribers: [UserSubscriber],
  entities: [
    'dist/modules/**/*.entity{.ts,.js}',
    'dist/modules/**/*.view-entity{.ts,.js}',
  ],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  synchronize: false,
});

module.exports = dataSource;