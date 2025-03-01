import { Context } from 'hono'
import { prisma } from '../prisma/client.js'
import type { User } from '@prisma/client'
import { z, ZodError } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  accessUserIds: z.array(z.number()).optional()
})

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const userId = c.req.header('user')
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const id = parseInt(userId, 10)
  if (isNaN(id)) {
    return c.json({ error: 'Invalid user id' }, 400)
  }

  const user: User | null = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  c.set('user', user)
  await next()
}

export const validateProject = async (
  c: Context,
  next: () => Promise<void>
) => {
  try {
    const jsonBody = await c.req.json()

    const parsedBody = projectSchema.parse(jsonBody)
    c.set('validatedBody', parsedBody)
    await next()
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
}
