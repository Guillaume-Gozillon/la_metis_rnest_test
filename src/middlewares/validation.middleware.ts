import type { MiddlewareHandler } from 'hono'
import { projectSchema } from '../modules/projects/project.schema.js'

export const validateProject: MiddlewareHandler = async (c, next) => {
  const body = await c.req.json()
  const result = projectSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.format() }, 400)
  }
  await next()
}
