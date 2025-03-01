import { z } from 'zod'

export const analysisSchema = z.object({
  name: z.string().min(1, 'Analyse name is required')
})

export type AnalysisCreateInput = z.infer<typeof analysisSchema>
