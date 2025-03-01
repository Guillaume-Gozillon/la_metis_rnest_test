import type { User } from '@prisma/client'
import { prisma } from '../../prisma/client.js'
import { UserRoleEnum } from '../../common/userRoleEnum.js'

export class AnalysisService {
  async createAnalysis(user: User, projectId: number, data: { name: string }) {
    if (user.role === UserRoleEnum.READER) {
      throw new Error('Not allowed')
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })
    if (!project) throw new Error('Project not found')

    if (user.role === UserRoleEnum.ADMIN) {
      return prisma.analysis.create({
        data: {
          name: data.name,
          project: { connect: { id: projectId } },
          owner: { connect: { id: user.id } }
        }
      })
    } else if (user.role === UserRoleEnum.MANAGER) {
      if (project.ownerId !== user.id) {
        throw new Error('MANAGER can create analysis only on theirs project')
      }
      return prisma.analysis.create({
        data: {
          name: data.name,
          project: { connect: { id: projectId } },
          owner: { connect: { id: user.id } }
        }
      })
    } else {
      throw new Error('ROLE not alloewd')
    }
  }

  async getAnalysisById(user: User, analysisId: number) {
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { project: { include: { accesses: true } } }
    })
    if (!analysis) return null

    const project = analysis.project
    if (!project) return null

    if (user.role === UserRoleEnum.ADMIN) {
      return analysis
    } else if (user.role === UserRoleEnum.MANAGER) {
      if (project.ownerId === user.id) {
        return analysis
      }
      const hasAccess = project.accesses.some(
        access => access.userId === user.id
      )
      return hasAccess ? analysis : null
    } else if (user.role === UserRoleEnum.READER) {
      const hasAccess = project.accesses.some(
        access => access.userId === user.id
      )
      return hasAccess ? analysis : null
    } else {
      throw new Error('ROLE not allowed')
    }
  }

  async getAnalysesByProjectId(user: User, projectId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { accesses: true }
    })
    if (!project) throw new Error('Projetc not found')

    if (user.role === UserRoleEnum.ADMIN) {
      return prisma.analysis.findMany({ where: { projectId } })
    } else if (user.role === 'MANAGER') {
      if (project.ownerId === user.id) {
        return prisma.analysis.findMany({ where: { projectId } })
      }
      const hasAccess = project.accesses.some(
        access => access.userId === user.id
      )
      if (hasAccess) {
        return prisma.analysis.findMany({ where: { projectId } })
      }
      throw new Error('Not allowed')
    } else if (user.role === UserRoleEnum.READER) {
      const hasAccess = project.accesses.some(
        access => access.userId === user.id
      )
      if (hasAccess) {
        return prisma.analysis.findMany({ where: { projectId } })
      }
      throw new Error('Not allowed')
    } else {
      throw new Error('ROLE not found')
    }
  }
}
