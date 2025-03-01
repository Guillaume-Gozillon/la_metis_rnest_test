import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { projectRouter } from './modules/projects/project.controller.js'
import { analysisRouter } from './modules/analyses/analysis.controller.js'
import { userRouter } from './modules/users/user.controller.js'

const app = new Hono()

app.get('/', c => c.text('Hello Hono!'))

app.route('/projects', projectRouter)
app.route('/projects/:projectId/analyses', analysisRouter)
app.route('/users', userRouter)

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
