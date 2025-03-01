import { Hono } from 'hono'
import { AnalysisService } from './analysis.service.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import type { User } from '@prisma/client'
import { validateAnalysis } from '../../middlewares/analysisValidation.middleware.js'

declare module 'hono' {
  interface ContextVariableMap {
    user: User
    validatedBody: { name: string; accessUserIds?: number[] } | { name: string }
  }
}

export const analysisRouter = new Hono()
const analysisService = new AnalysisService()

analysisRouter.use('*', authMiddleware)

analysisRouter.post('/', validateAnalysis, async c => {
  const user = c.get('user')

  const projectIdParam = c.req.param('projectId')
  if (!projectIdParam) {
    return c.json({ error: 'Missing projectId' }, 400)
  }
  const projectId = parseInt(projectIdParam, 10)
  if (isNaN(projectId)) {
    return c.json({ error: 'Invalid projectId' }, 400)
  }

  const body = c.get('validatedBody') as {
    name: string
  }

  try {
    const analysis = await analysisService.createAnalysis(user, projectId, body)
    return c.json({ analysis }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

analysisRouter.get('/:projectId', async c => {
  const user = c.get('user')
  const projectId = parseInt(c.req.param('projectId'))
  try {
    const analyses = await analysisService.getAnalysesByProjectId(
      user,
      projectId
    )
    return c.json({ analyses })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

analysisRouter.get('/:analysisId', async c => {
  const user = c.get('user')
  const analysisId = parseInt(c.req.param('analysisId'))
  try {
    const analysis = await analysisService.getAnalysisById(user, analysisId)
    if (!analysis) return c.json({ error: 'Not Found' }, 404)
    return c.json({ analysis })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})
