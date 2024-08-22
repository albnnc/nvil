import * as datetime from "@std/datetime";
import * as colors from "@std/fmt/colors";
import * as log from "@std/log";

class Handler extends log.BaseHandler {
  constructor(getScope: () => string) {
    super("DEBUG", {
      formatter: ({ level, msg }) => {
        const scope = getScope();
        const levelColor = {
          [log.LogLevels.CRITICAL]: colors.red,
          [log.LogLevels.DEBUG]: colors.magenta,
          [log.LogLevels.ERROR]: colors.red,
          [log.LogLevels.INFO]: colors.blue,
          [log.LogLevels.NOTSET]: colors.yellow,
          [log.LogLevels.WARN]: colors.yellow,
        }[level] || colors.stripAnsiCode;
        let content = colors.stripAnsiCode(msg.trim());
        if (content.includes("\n")) {
          const prefix = "\n  " + colors.dim("|") + " ";
          content = prefix + content.replace("\n", prefix);
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

export class ScopeLogger extends log.Logger {
  constructor(public scope: string) {
    super("PROJECT_LOGGER", "DEBUG", {
      handlers: [new Handler(() => this.scope)],
    });
  }
}
