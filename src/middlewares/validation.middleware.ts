import type { MiddlewareHandler } from 'hono'
import { projectSchema } from '../modules/projects/project.schema.js'

export const validateProject: MiddlewareHandler = async (c, next) => {
  try {
    const body = await c.req.json()
    const result = projectSchema.parse(body)
    c.set('validatedBody', result)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
  await next()
}
