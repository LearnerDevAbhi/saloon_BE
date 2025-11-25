export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  database: {
    url:process.env.DATABASE_URL ?? '',
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
  cors:{
    feUrl: process.env.SALOON_FE_URL ?? 'localhost:5174'
  }
});
