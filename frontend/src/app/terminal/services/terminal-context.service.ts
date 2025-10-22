import { TerminalContext } from '../types/terminal.types';

export class TerminalContextService {
  private context: TerminalContext;

  constructor() {
    this.context = {
      currentDirectory: '~',
      history: [],
      environment: {
        USER: 'braelyn',
        HOSTNAME: 'personal-site',
        PATH: '/usr/local/bin:/usr/bin:/bin',
        HOME: '~'
      },
      user: {
        name: 'braelyn',
        hostname: 'personal-site'
      }
    };
  }

  getContext(): TerminalContext {
    return { ...this.context };
  }

  updateContext(updates: Partial<TerminalContext>): void {
    this.context = { ...this.context, ...updates };
  }

  addToHistory(command: string): void {
    this.context.history.push(command);
    
    // Keep only last 100 commands
    if (this.context.history.length > 100) {
      this.context.history = this.context.history.slice(-100);
    }
  }

  getHistory(): string[] {
    return [...this.context.history];
  }

  setEnvironmentVariable(key: string, value: string): void {
    this.context.environment[key] = value;
  }

  getEnvironmentVariable(key: string): string | undefined {
    return this.context.environment[key];
  }

  setCurrentDirectory(directory: string): void {
    this.context.currentDirectory = directory;
  }

  getCurrentDirectory(): string {
    return this.context.currentDirectory;
  }
}
