import { z } from "zod";
import { MAX_BACKUP_ITEMS_PER_TABLE } from "@/domain/backupLimits";
import type { WorkoutType } from "@/domain/types";

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const dailyLogSchema = z.object({
  date: isoDateSchema,
  energy: z.number().int().min(1).max(5),
  sleepOk: z.boolean(),
  sleepHours: z.number().positive().max(24).optional(),
  notes: z.string().max(1000).optional()
});

export const weeklyCheckInSchema = z.object({
  weekStartDate: isoDateSchema,
  weightKg: z.number().positive().max(400),
  notes: z.string().max(1000).optional(),
  adjustment: z.string().max(280).optional()
});

export const workoutTypeSchema = z
  .enum(["strength", "walk", "strengthA", "strengthB"])
  .transform<WorkoutType>((type) => (type === "strengthA" || type === "strengthB" ? "strength" : type));

export const workoutLogSchema = z.object({
  id: z.number().int().positive().optional(),
  dateTime: z.string().datetime(),
  date: isoDateSchema,
  type: workoutTypeSchema,
  durationMin: z.number().int().positive().max(300).optional(),
  notes: z.string().max(1000).optional()
});

export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  dailyLogs: z
    .array(dailyLogSchema)
    .max(
      MAX_BACKUP_ITEMS_PER_TABLE,
      `Daglige logger kan ikke inneholde mer enn ${MAX_BACKUP_ITEMS_PER_TABLE} elementer.`
    ),
  weeklyCheckIns: z
    .array(weeklyCheckInSchema)
    .max(
      MAX_BACKUP_ITEMS_PER_TABLE,
      `Ukentlige innsjekker kan ikke inneholde mer enn ${MAX_BACKUP_ITEMS_PER_TABLE} elementer.`
    ),
  workoutLogs: z
    .array(workoutLogSchema)
    .max(MAX_BACKUP_ITEMS_PER_TABLE, `Aktiviteter kan ikke inneholde mer enn ${MAX_BACKUP_ITEMS_PER_TABLE} elementer.`)
});

export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type WeeklyCheckInInput = z.infer<typeof weeklyCheckInSchema>;
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
export type BackupBlob = z.infer<typeof backupSchema>;
