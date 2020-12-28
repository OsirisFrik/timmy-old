// eslint-disable-next-line no-process-env
const ENV = process.env

const env: IENV = {
  NODE_ENV: ENV.NODE_ENV || 'development',
  PORT: ENV.PORT || 3000,
  DATABASE: ENV.DATABASE || '',
  SENTRY: ENV.SENTRY || '',
  NGROK_TOKEN: ENV.NGROK_TOKEN || '',
  MC_PORT: ENV.MC_PORT || '',
  BUCKET: ENV.BUCKET || '',
  DISCORD: ENV.DISCORD || ''
}

export default env
