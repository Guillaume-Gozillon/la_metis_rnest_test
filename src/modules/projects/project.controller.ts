import { Hono } from 'hono'
import { ProjectService } from './project.service.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { validateProject } from '../../middlewares/validation.middleware.js'

export const projectRouter = new Hono()
const projectService = new ProjectService()

projectRouter.use('*', authMiddleware)

projectRouter.post('/', validateProject, async c => {
  const user = c.get('user')
  const body = await c.req.json()
  try {
    const project = await projectService.createProject(user, body)
    return c.json({ project }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

projectRouter.get('/', async c => {
  const user = c.get('user')
  try {
    const projects = await projectService.getAllProjects(user)
    return c.json({ projects })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

projectRouter.get('/:projectId', async c => {
  const user = c.get('user')
  const projectId = parseInt(c.req.param('projectId'))
  try {
    const project = await projectService.getProjectById(user, projectId)
    if (!project) return c.json({ error: 'Not Found' }, 404)
    return c.json({ project })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})
