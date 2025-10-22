export interface TerminalCommand {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  execute(args: string[], context: TerminalContext): Promise<CommandResult>;
}

export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
  action?: 'navigate' | 'clear' | 'none';
  data?: any;
}

export interface TerminalContext {
  currentDirectory: string;
  history: string[];
  environment: Record<string, string>;
  user: {
    name: string;
    hostname: string;
  };
}

export interface TerminalOutput {
  id: string;
  timestamp: Date;
  type: 'command' | 'output' | 'error' | 'system';
  content: string;
  command?: string;
}

export interface CommandRegistry {
  register(command: TerminalCommand): void;
  unregister(commandName: string): void;
  get(commandName: string): TerminalCommand | undefined;
  getAll(): TerminalCommand[];
  findByNameOrAlias(name: string): TerminalCommand | undefined;
}
