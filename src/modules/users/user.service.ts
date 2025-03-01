import { prisma } from '../../prisma/client.js'
import type { Role } from '@prisma/client'

export class UserService {
  async createUser(data: { username: string; role: Role }) {
    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        role: data.role
      }
    })

    return newUser
  }
}
