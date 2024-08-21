import * as datetime from "@std/datetime";
import * as fmt from "@std/fmt";
import * as log from "@std/log";

class Handler extends log.BaseHandler {
  constructor(getScope: () => string) {
    super("DEBUG", {
      formatter: ({ level, msg }) => {
        const scope = getScope();
        const levelColor = {
          [log.LogLevels.CRITICAL]: fmt.red,
          [log.LogLevels.DEBUG]: fmt.magenta,
          [log.LogLevels.ERROR]: fmt.red,
          [log.LogLevels.INFO]: fmt.blue,
          [log.LogLevels.NOTSET]: fmt.yellow,
          [log.LogLevels.WARN]: fmt.yellow,
        }[level] || fmt.stripAnsiCode;
        let content = fmt.stripAnsiCode(msg.trim());
        if (content.includes("\n")) {
          const prefix = "\n  " + fmt.dim("|") + " ";
          content = prefix + content.replace("\n", prefix);
        }
        return (
          fmt.dim(datetime.format(new Date(), "HH:mm:ss")) +
          " " +
          levelColor(log.getLevelName(level as log.LogLevel) || "") +
          (scope
            ? levelColor("(") + fmt.dim(scope) + levelColor("):")
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
