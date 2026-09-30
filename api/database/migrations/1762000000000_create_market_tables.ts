import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('indicators', (table) => {
      table.increments('id')
      table.string('code', 40).notNullable().unique()
      table.string('name', 120).notNullable()
      table.string('source', 20).notNullable()
      table.string('frequency', 20).notNullable()
      table.string('external_id', 40).notNullable()
      table.string('unit', 20).notNullable()
      table.text('summary').notNullable()
      table.text('limitations').notNullable()
      table.integer('history_limit').notNullable()
      table.integer('variation_lag').notNullable()
      table.integer('ttl_hours').notNullable()
      table.integer('sort_order').notNullable()
      table.timestamp('last_synced_at').nullable()
      table.text('last_sync_error').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('observations', (table) => {
      table.increments('id')
      table
        .integer('indicator_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('indicators')
        .onDelete('CASCADE')
      table.string('observed_on', 10).notNullable()
      table.decimal('value', 18, 8).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['indicator_id', 'observed_on'])
    })

    this.schema.createTable('viewers', (table) => {
      table.string('id', 36).primary()
      table.timestamp('created_at').notNullable()
    })

    this.schema.createTable('favorites', (table) => {
      table.increments('id')
      table
        .string('viewer_id', 36)
        .notNullable()
        .references('id')
        .inTable('viewers')
        .onDelete('CASCADE')
      table
        .integer('indicator_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('indicators')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable()
      table.unique(['viewer_id', 'indicator_id'])
    })
  }

  async down() {
    this.schema.dropTable('favorites')
    this.schema.dropTable('viewers')
    this.schema.dropTable('observations')
    this.schema.dropTable('indicators')
  }
}
