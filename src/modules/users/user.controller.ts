import { Hono } from 'hono'
import { UserService } from './user.service.js'

export const userRouter = new Hono()
const userService = new UserService()

/**
 * POST /
 * Creates a new user.
 *
 * Expects a JSON body with:
 * - username: string
 * - role: string
 *
 * @param {import('hono').Context} c - The Hono context.
 * @returns {Promise<Response>} JSON response with the created user or an error.
 */
userRouter.post('/', async c => {
  const body = await c.req.json<{ username: string; role: string }>()
  if (!body.username || !body.role) {
    return c.json({ error: 'username and role are mandatory' }, 400)
  }

  try {
    const newUser = await userService.createUser({
      username: body.username,
      role: body.role as any
    })

    return c.json({ user: newUser }, 201)
  } catch (err: any) {
    return c.json({ error: err.message }, 400)
  }
})
