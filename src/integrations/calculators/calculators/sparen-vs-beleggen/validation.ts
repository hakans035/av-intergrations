import { z } from 'zod'

export const inputSchema = z.object({
  startkapitaal: z
    .number()
    .min(0, 'Startkapitaal moet minimaal 0 zijn')
    .max(10000000, 'Startkapitaal mag maximaal 10.000.000 zijn'),

  maandInleg: z
    .number()
    .min(0, 'Maandelijkse inleg moet minimaal 0 zijn')
    .max(100000, 'Maandelijkse inleg mag maximaal 100.000 zijn'),

  spaarrente: z
    .number()
    .min(0, 'Spaarrente moet minimaal 0% zijn')
    .max(20, 'Spaarrente mag maximaal 20% zijn'),

  beleggingsRendement: z
    .number()
    .min(-20, 'Rendement moet minimaal -20% zijn')
    .max(30, 'Rendement mag maximaal 30% zijn'),

  looptijdJaar: z
    .number()
    .int('Looptijd moet een geheel getal zijn')
    .min(1, 'Looptijd moet minimaal 1 jaar zijn')
    .max(50, 'Looptijd mag maximaal 50 jaar zijn'),
})

export const maandDataSchema = z.object({
  maand: z.number().int().min(1),
  waardeSparen: z.number(),
  waardeBeleggen: z.number(),
})

export const outputSchema = z.object({
  eindkapitaalSparen: z.number(),
  eindkapitaalBeleggen: z.number(),
  verschil: z.number(),
  totaleInleg: z.number(),
  renteOpbrengstSparen: z.number(),
  rendementOpbrengstBeleggen: z.number(),
  maandData: z.array(maandDataSchema),
})

export type InputSchema = z.infer<typeof inputSchema>
export type OutputSchema = z.infer<typeof outputSchema>
