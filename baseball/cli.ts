import { Command } from "../deps.ts";
import { schedule } from "./schedule.ts";

await new Command()
  .name("baseball")
  .version("0.1.0")
  .description("A command line app for getting baseball schedule and standings")
  .command("schedule", schedule)
  .parse(Deno.args);
