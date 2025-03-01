import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  accessUserIds: z.array(z.number())
})

export type ProjectCreateInput = z.infer<typeof projectSchema>
