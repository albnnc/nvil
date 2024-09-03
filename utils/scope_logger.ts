import * as datetime from "@std/datetime";
import * as colors from "@std/fmt/colors";
import {
  BaseHandler,
  getLevelName,
  type LevelName,
  Logger,
  type LogLevel,
  LogLevels,
} from "@std/log";

export class ScopeLogger extends Logger {
  constructor(loggerName: string, levelName: LevelName) {
    super(loggerName, levelName, {
      handlers: [new ScopeHandler(() => this.loggerName)],
    });
  }
}

class ScopeHandler extends BaseHandler {
  constructor(getScope: () => string) {
    super("NOTSET", {
      formatter: ({ level, msg }) => {
        const scope = getScope();
        const levelColor = {
          [LogLevels.CRITICAL]: colors.red,
          [LogLevels.ERROR]: colors.red,
          [LogLevels.WARN]: colors.yellow,
          [LogLevels.INFO]: colors.blue,
          [LogLevels.DEBUG]: colors.magenta,
          [LogLevels.NOTSET]: undefined,
        }[level] || colors.stripAnsiCode;
        let content = colors.stripAnsiCode(msg.trim());
        if (content.includes("\n")) {
          const prefix = "\n  " + colors.dim("|") + " ";
          content = prefix + content.replace(/\n/g, prefix);
        }
        return (
          colors.dim(datetime.format(new Date(), "HH:mm:ss")) +
          " " +
          levelColor(getLevelName(level as LogLevel) || "") +
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
