import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { Hono } from 'hono'
import { projectRouter } from '../src/modules/projects/project.controller.js'
import { prisma } from '../src/prisma/client.js'
import { UserRoleEnum } from '../src/common/userRoleEnum.js'

jest.mock('../src/prisma/client.js', () => ({
  prisma: {
    project: {
      create: jest.fn(data =>
        Promise.resolve({
          id: 1,
          ...data.data
        })
      ),
      findUnique: jest.fn(({ where }) =>
        Promise.resolve({
          id: where.id || 1,
          name: 'My Project',
          userId: 1
        })
      )
    },
    user: {
      findUnique: jest.fn(({ where }) =>
        Promise.resolve({
          id: where.id || 1,
          role: UserRoleEnum.ADMIN
        })
      )
    }
  }
}))

describe('POST /projects (JSON)', () => {
  let app: Hono

  beforeAll(() => {
    app = new Hono()

    app.route('/projects', projectRouter)
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('Create a project if user is admin => 201', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      role: UserRoleEnum.ADMIN
    })

    const req = new Request('http://localhost/projects', {
      method: 'POST',
      headers: new Headers({
        user: '1',
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        name: 'My Project'
      })
    })

    const response = await app.fetch(req)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty('project')
    expect(data.project.name).toBe('My Project')

    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        name: 'My Project',
        owner: { connect: { id: 1 } },
        accesses: { create: [] }
      }
    })
  })

  it('400 if user is READER => Not allowed', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      role: UserRoleEnum.READER
    })

    const req = new Request('http://localhost/projects', {
      method: 'POST',
      headers: new Headers({
        user: '2',
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        name: 'Reader Project'
      })
    })

    const response = await app.fetch(req)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Not allowed')
  })

  it('Error 400 if body is not valide', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      role: UserRoleEnum.ADMIN
    })

    const req = new Request('http://localhost/projects', {
      method: 'POST',
      headers: new Headers({
        user: '1',
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({})
    })

    const response = await app.fetch(req)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })
})
