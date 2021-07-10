import { DateTime } from "../deps.ts";

export class DateArgParser {
  static isValid(date: string | undefined): boolean {
    switch (date) {
      case "yesterday":
      case "tomorrow":
      case "today":
        return true;
      case undefined:
        return false;
      default:
        return DateTime.fromFormat(date, "yyyy-MM-dd").isValid;
    }
  }

  static formatDate(date: string | undefined) {
    switch (date) {
      case "yesterday":
        return DateTime.now().minus({ day: 1 }).toISODate();
      case "tomorrow":
        return DateTime.now().plus({ day: 1 }).toISODate();
      case "today":
        return DateTime.now().toISODate();
      default:
        return DateTime.fromISO(date!).toISODate();
    }
  }
}
