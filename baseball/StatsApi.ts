import { z } from "https://cdn.skypack.dev/zod?dts";

export const Team = z.object({
  leagueRecord: z.object({
    wins: z.number(),
    losses: z.number(),
    pct: z.string(),
  }),
  score: z.number().optional(),
  team: z.object({
    id: z.number(),
    name: z.string(),
    teamName: z.string(),
    abbreviation: z.string(),
  }),
});
export type Team = z.infer<typeof Team>;

export const Linescore = z.object({
  scheduledInnings: z.number(),
  currentInning: z.number(),
  inningHalf: z.string(),
  teams: z.object({
    home: z.object({ runs: z.number() }),
    away: z.object({ runs: z.number() }),
  }),
}).deepPartial();

export const Game = z.object({
  gamePk: z.number(),
  gameDate: z.string(),
  rescheduleDate: z.string().optional(),
  status: z.object({
    abstractGameCode: z.enum(["F", "L", "O", "P"]),
    startTimeTBD: z.boolean(),
  }).passthrough(),
  linescore: Linescore,
  teams: z.object({
    away: Team,
    home: Team,
  }),
  venue: z.object({
    id: z.number(),
    name: z.string(),
  }),
});
export type Game = z.infer<typeof Game>;

const ScheduleResponse = z.object({
  dates: z.array(
    z.object({
      date: z.string(),
      games: z.array(Game),
    }),
  ),
});

export async function getSchedule({ date }: { date: string }) {
  const url = `https://statsapi.mlb.com/api/v1/schedule?${new URLSearchParams({
    sportId: "1",
    hydrate: "team,linescore",
    date,
  })}`;
  const json = await fetch(url).then((response) => response.json());
  return ScheduleResponse.parse(json);
}
