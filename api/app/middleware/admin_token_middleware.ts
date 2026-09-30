import { timingSafeEqual } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

function matches(expected: string, provided: string) {
  const left = Buffer.from(expected)
  const right = Buffer.from(provided)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export default class AdminTokenMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const expected = env.get('ADMIN_TOKEN')
    const provided = ctx.request.header('x-admin-token')
    if (!expected || !provided || !matches(expected, provided)) {
      return ctx.response.unauthorized({ message: 'Não autorizado' })
    }
    return next()
  }
}
