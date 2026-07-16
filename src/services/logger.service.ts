export class Logger {
  static success(message: string): void {
    console.log(`✅ ${message}`);
  }

  static info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  static warn(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  static error(message: string): void {
    console.error(`❌ ${message}`);
  }

  static debug(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`);
    }
  }
}
