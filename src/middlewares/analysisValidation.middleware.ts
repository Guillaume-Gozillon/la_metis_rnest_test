import type { MiddlewareHandler } from 'hono'
import { analysisSchema } from '../modules/analyses/analysis.schema.js'

export const validateAnalysis: MiddlewareHandler = async (c, next) => {
  try {
    const body = await c.req.json()
    const result = analysisSchema.parse(body)
    c.set('validatedBody', result)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
  await next()
}
