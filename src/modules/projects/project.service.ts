import type { User } from '@prisma/client'
import { prisma } from '../../prisma/client.js'
import { UserRoleEnum } from '../../common/userRoleEnum.js'

export class ProjectService {
  async createProject(
    user: User,
    data: { name: string; accessUserIds?: number[] }
  ) {
    if (user.role === 'READER') {
      throw new Error('Not allowed')
    }

    if (
      user.role === UserRoleEnum.MANAGER ||
      user.role === UserRoleEnum.ADMIN
    ) {
      return prisma.project.create({
        data: {
          name: data.name,
          owner: { connect: { id: user.id } },
          accesses: {
            create: data.accessUserIds
              ? data.accessUserIds.map(uid => ({
                  user: { connect: { id: uid } }
                }))
              : []
          }
        }
      })
    }

    throw new Error('ROLE not allowed')
  }

  async getAllProjects(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    if (!user) {
      throw new Error('User not found')
    }

    if (user.role === UserRoleEnum.ADMIN) {
      return prisma.project.findMany()
    } else if (user.role === UserRoleEnum.MANAGER) {
      return prisma.project.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            {
              accesses: {
                some: { userId: user.id }
              }
            }
          ]
        }
      })
    } else if (user.role === UserRoleEnum.READER) {
      return prisma.project.findMany({
        where: {
          accesses: {
            some: { userId: user.id }
          }
        }
      })
    } else {
      throw new Error('ROLE not allowed')
    }
  }

  async getProjectById(user: User, projectId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { accesses: true }
    })
    if (!project) return null

    if (user.role === UserRoleEnum.ADMIN) {
      return project
    }

    if (user.role === UserRoleEnum.MANAGER) {
      if (project.ownerId === user.id) {
        return project
      }
      const hasAccess = project.accesses.some(acc => acc.userId === user.id)
      return hasAccess ? project : null
    }

    if (user.role === UserRoleEnum.READER) {
      const hasAccess = project.accesses.some(acc => acc.userId === user.id)
      return hasAccess ? project : null
    }

    throw new Error('ROLE not allowed')
  }
}
