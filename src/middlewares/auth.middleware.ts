import type { MiddlewareHandler } from 'hono'
import { prisma } from '../prisma/client.js'

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const userIdHeader = c.req.header('user')
  if (!userIdHeader) {
    return c.json({ error: 'Missing user header' }, 401)
  }

  const userId = parseInt(userIdHeader, 10)
  if (isNaN(userId)) {
    return c.json({ error: 'Invalid user Id in header' }, 401)
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return c.json({ error: 'User not found' }, 401)
  }

  c.set('user', user)
  await next()
}
