import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Observation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare indicatorId: number

  @column()
  declare observedOn: string

  @column({
    consume: (value: string | number) => Number(value),
  })
  declare value: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
