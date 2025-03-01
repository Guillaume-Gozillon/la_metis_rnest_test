import { Hono } from 'hono'
import { AnalysisService } from './analysis.service.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import type { User } from '@prisma/client'

declare module 'hono' {
  interface ContextVariableMap {
    user: User
  }
}

export const analysisRouter = new Hono()
const analysisService = new AnalysisService()

analysisRouter.use('*', authMiddleware)

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

analysisRouter.post('/:projectId', async c => {
  const user = c.get('user')
  const projectId = parseInt(c.req.param('projectId'))
  const body = await c.req.json<{ name: string }>()
  try {
    const analysis = await analysisService.createAnalysis(user, projectId, body)
    return c.json({ analysis }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})
