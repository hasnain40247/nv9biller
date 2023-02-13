const appRoot = require("app-root-path");
const { createLogger, format, transports } = require("winston");

const { combine, timestamp, colorize, prettyPrint, printf } = format;

const logger = createLogger({
  format: combine(
    colorize(),
    timestamp(),
    prettyPrint(),
    printf(
      (info: { timestamp: any; level: any; message: any }) =>
        `${info.timestamp} [${info.level}] : ${JSON.stringify(info.message)}`
    )
  ),
  transports: [
    new transports.File({
      filename: `${appRoot}/logs/error.log`,
      level: "error",
      handleExceptions: true,
      json: true,
      maxsize: 20971520, // 20MB
      maxFiles: 1,
      colorize: false,
    }),
    new transports.File({
      filename: `${appRoot}/logs/app.log`,
      level: "info",
      handleExceptions: true,
      json: true,
      maxsize: 20971520, // 20MB
      maxFiles: 1,
      colorize: false,
    }),
    new transports.Console({
      level: "debug",
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

export default logger;
