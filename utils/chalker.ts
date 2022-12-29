import chalk from 'chalk'

export default {
  self: chalk,
  bold: chalk.bold,
  success: chalk.hex('#2ecc71'),
  successBg: chalk.hex('#000000').bgGreen,
  info: chalk.hex('#3498db'),
  infoBg: chalk.hex('#000000').bgBlue,
  error: chalk.hex('#e74c3c'),
  errorBg: chalk.hex('#ffffff').bgRed,
  warning: chalk.hex('#d35400'),
  warningBg: chalk.hex('#ffffff').bgYellow
}
