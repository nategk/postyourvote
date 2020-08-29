import winston from 'winston';

const { createLogger, format, transports } = winston;
const { combine, timestamp, colorize, splat, printf } = format;

const myFormat = printf(({level, message, timestamp}) => {
  return `${timestamp} [${level}] ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    colorize(),
    timestamp(),
    splat(),
    myFormat
  ),
  transports: [new transports.Console({
    handleExceptions: true,
    json: false,
    // colorize: true
  })],
  exitOnError: false
});

export default logger;
