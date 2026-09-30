import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { Frequency, Source, Unit } from '#services/indicator_catalog'

export default class Indicator extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare source: Source

  @column()
  declare frequency: Frequency

  @column()
  declare externalId: string

  @column()
  declare unit: Unit

  @column()
  declare summary: string

  @column()
  declare limitations: string

  @column()
  declare historyLimit: number

  @column()
  declare variationLag: number

  @column()
  declare ttlHours: number

  @column()
  declare sortOrder: number

  @column.dateTime()
  declare lastSyncedAt: DateTime | null

  @column()
  declare lastSyncError: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
