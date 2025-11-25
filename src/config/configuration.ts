export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    url:process.env.DATABASE_URL ?? '',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'salon',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
  },
  auth: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
    accessTokenTtl: process.env.JWT_ACCESS_EXPIRATION ?? '15m',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
    refreshTokenTtl: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
  },
});
