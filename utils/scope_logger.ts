import { datetime, log, colors } from "../_deps.ts";

class Handler extends log.handlers.BaseHandler {
  constructor(scope?: string) {
    super("DEBUG", {
      formatter: ({ level, msg }) => {
        const levelColor =
          {
            [log.LogLevels.CRITICAL]: colors.red,
            [log.LogLevels.DEBUG]: colors.magenta,
            [log.LogLevels.ERROR]: colors.red,
            [log.LogLevels.INFO]: colors.blue,
            [log.LogLevels.WARNING]: colors.yellow,
          }[level] || colors.stripColor;
        let content = colors.stripColor(msg.trim());
        if (content.includes("\n")) {
          const prefix = "\n  " + colors.dim("|") + " ";
          content = prefix + content.replace("\n", prefix);
        }
        return (
          colors.dim(datetime.format(new Date(), "HH:mm:ss")) +
          " " +
          levelColor(log.LogLevels[level]) +
          (scope
            ? levelColor("(") + colors.dim(scope) + levelColor("):")
            : levelColor(":")) +
          " " +
          content
        );
      },
    });
  }

  override log(msg: string) {
    console.log(msg);
  }
}

export class ScopeLogger extends log.Logger {
  constructor(scope: string) {
    super("PROJECT_LOGGER", "DEBUG", {
      handlers: [new Handler(scope)],
    });
  }
}
