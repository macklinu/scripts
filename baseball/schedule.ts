import { Cell, Command, DateTime, dim, Table, yellow, z } from "../deps.ts";
import * as StatsApi from "./StatsApi.ts";
import { startsWith } from "./utils.ts";
import { DateArgParser } from "./DateArgParser.ts";

const Args = z.object({
  date: z.string()
    .refine(DateArgParser.isValid)
    .transform(DateArgParser.formatDate),
});

class ScheduleFormatter {
  private games: Game[];

  constructor(games: StatsApi.Game[]) {
    this.games = games.map((game) => new Game(game));
  }

  display() {
    new Table(...this.games.map(this.toTableRow)).render();
  }

  private toTableRow(game: Game) {
    return [
      Cell.from(game.matchup),
      game.hasStarted ? Cell.from(game.score) : Cell.from(game.time),
      Cell.from(game.inning),
    ];
  }
}

class Game {
  constructor(private game: StatsApi.Game) {}

  get date() {
    return this.game.rescheduleDate ?? this.game.gameDate;
  }

  get time() {
    if (this.status.isPostponed) {
      return this.status.detailedState;
    }
    if (this.status.startTimeTBD) {
      return "TBD";
    }
    return DateTime.fromISO(this.date).toFormat("h:mm a");
  }

  get homeTeam() {
    return new Team(this.game.teams.home);
  }

  get awayTeam() {
    return new Team(this.game.teams.away);
  }

  get matchup() {
    return [this.awayTeam.overview, this.homeTeam.overview].join("\n");
  }

  get hasStarted() {
    return this.status.hasStarted;
  }

  get score() {
    if (this.linescore.isTie) {
      return [
        this.linescore.awayTeamRuns,
        this.linescore.homeTeamRuns,
      ].join("\n");
    }
    if (this.linescore.isAwayTeamWinning) {
      return [
        yellow(this.linescore.awayTeamRuns.toString()),
        this.linescore.homeTeamRuns,
      ].join("\n");
    }
    return [
      this.linescore.awayTeamRuns,
      yellow(this.linescore.homeTeamRuns.toString()),
    ].join("\n");
  }

  get status() {
    return new GameStatus(this.game);
  }

  get linescore() {
    return new Linescore(this.game);
  }

  get inning() {
    if (this.status.isPostponed) {
      return "";
    }
    if (this.status.isFinal) {
      return this.linescore.currentInning !== 9
        ? `Final/${this.linescore.currentInning}`
        : "Final";
    }
    if (this.status.isLive) {
      return `${this.game.linescore!.inningHalf} ${
        this.game.linescore!.currentInning
      }`;
    }
    return "";
  }
}

class Linescore {
  constructor(private game: StatsApi.Game) {}

  get currentInning() {
    return this.game.linescore?.currentInning;
  }

  get scheduledInnings() {
    return this.game.linescore?.scheduledInnings ?? 9;
  }

  get awayTeamRuns() {
    return this.game.linescore?.teams?.away?.runs ?? 0;
  }

  get homeTeamRuns() {
    return this.game.linescore?.teams?.home?.runs ?? 0;
  }

  get isAwayTeamWinning() {
    return this.awayTeamRuns > this.homeTeamRuns;
  }

  get isTie() {
    return this.awayTeamRuns === this.homeTeamRuns;
  }
}

class GameStatus {
  constructor(private game: StatsApi.Game) {}

  get startTimeTBD() {
    return this.game.status.startTimeTBD;
  }

  get code() {
    return this.game.status.abstractGameCode;
  }

  get isLive() {
    return this.code === "L";
  }

  get isFinal() {
    return this.code === "F";
  }

  get isPostponed() {
    return startsWith(this.game.status.statusCode, ["D", "C"]);
  }

  get detailedState() {
    return this.game.status.detailedState;
  }

  get hasStarted() {
    return this.isLive || (this.isFinal && !this.isPostponed);
  }
}

class Team {
  constructor(private team: StatsApi.Team) {}

  get name() {
    return this.team.team.teamName;
  }

  get wins() {
    return this.team.leagueRecord.wins;
  }

  get losses() {
    return this.team.leagueRecord.losses;
  }

  get record() {
    return [this.wins, this.losses].join("-");
  }

  get overview() {
    return `${this.name} ${dim(this.record)}`;
  }
}

export const schedule = new Command()
  .name("schedule")
  .description("View the MLB schedule")
  .option("-d, --date [type:string]", "The date to view schedule data", {
    default: "today",
  })
  .action(async (args) => {
    const { date } = Args.parse(args);
    const response = await StatsApi.getSchedule({ date });
    const games = response.dates.flatMap((date) => date.games);
    new ScheduleFormatter(games).display();
  });
