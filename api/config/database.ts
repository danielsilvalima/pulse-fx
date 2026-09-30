import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

const connection = env.get('DB_CONNECTION')

const migrations = {
  naturalSort: true,
  paths: ['database/migrations'],
}

const dbConfig = defineConfig({
  connection,

  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.tmpPath('db.sqlite3'),
      },
      useNullAsDefault: true,
      migrations,
    },

    pg: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST') ?? '127.0.0.1',
        port: env.get('DB_PORT') ?? 5432,
        user: env.get('DB_USER') ?? 'pulse',
        password: env.get('DB_PASSWORD') ?? '',
        database: env.get('DB_DATABASE') ?? 'pulse_fx',
      },
      migrations,
      debug: app.inDev,
    },
  },
})

export default dbConfig
