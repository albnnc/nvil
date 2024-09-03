import * as datetime from "@std/datetime";
import * as colors from "@std/fmt/colors";
import * as log from "@std/log";

export interface ScopeLoggerOptions {
  scope: string;
  debug?: boolean;
}

export class ScopeLogger extends log.Logger {
  constructor(options: ScopeLoggerOptions) {
    super("PROJECT_LOGGER", options.debug ? "DEBUG" : "INFO", {
      handlers: [new Handler(options)],
    });
  }
}

class Handler extends log.BaseHandler {
  constructor(options: ScopeLoggerOptions) {
    super(options.debug ? "DEBUG" : "INFO", {
      formatter: ({ level, msg }) => {
        const scope = options.scope;
        const levelColor = {
          [log.LogLevels.CRITICAL]: colors.red,
          [log.LogLevels.ERROR]: colors.red,
          [log.LogLevels.WARN]: colors.yellow,
          [log.LogLevels.INFO]: colors.blue,
          [log.LogLevels.DEBUG]: colors.magenta,
          [log.LogLevels.NOTSET]: undefined,
        }[level] || colors.stripAnsiCode;
        let content = colors.stripAnsiCode(msg.trim());
        if (content.includes("\n")) {
          const prefix = "\n  " + colors.dim("|") + " ";
          content = prefix + content.replace(/\n/g, prefix);
        }
        return (
          colors.dim(datetime.format(new Date(), "HH:mm:ss")) +
          " " +
          levelColor(log.getLevelName(level as log.LogLevel) || "") +
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
