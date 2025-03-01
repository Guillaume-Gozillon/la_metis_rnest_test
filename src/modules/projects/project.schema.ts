import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(3, '3 caracteres minimum'),
  accessUserIds: z.array(z.number()).optional()
})
