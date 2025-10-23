import { TerminalCommand, CommandResult, TerminalOutput } from '../types/terminal.types';
import { TerminalCommandRegistry } from './command-registry.service';
import { TerminalOutputService } from './terminal-output.service';
import { TerminalContextService } from './terminal-context.service';

export class TerminalService {
  private commandRegistry: TerminalCommandRegistry;
  private outputService: TerminalOutputService;
  private contextService: TerminalContextService;

  constructor() {
    this.commandRegistry = new TerminalCommandRegistry();
    this.outputService = new TerminalOutputService();
    this.contextService = new TerminalContextService();
  }

  async executeCommand(input: string, additionalContext?: any): Promise<CommandResult> {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return { success: true, action: 'none' };
    }

    // Add command to history
    this.contextService.addToHistory(trimmedInput);
    
    // Add command to output
    this.outputService.addCommand(trimmedInput);

    // Parse command and arguments
    const [commandName, ...args] = trimmedInput.split(/\s+/);
    
    // Find the command
    const command = this.commandRegistry.findByNameOrAlias(commandName);
    
    if (!command) {
      const errorMessage = `Command not found: ${commandName}. Type 'help' for available commands.`;
      this.outputService.addError(errorMessage, commandName);
      return {
        success: false,
        error: errorMessage,
        action: 'none'
      };
    }

    try {
      // Execute the command with merged context
      const baseContext = this.contextService.getContext();
      const context = additionalContext ? { ...baseContext, ...additionalContext } : baseContext;
      const result = await command.execute(args, context);
      
      // Handle the result
      if (result.success) {
        if (result.output) {
          this.outputService.addCommandOutput(result.output, commandName);
        }
      } else {
        if (result.error) {
          this.outputService.addError(result.error, commandName);
        }
      }

      return result;
    } catch (error) {
      const errorMessage = `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.outputService.addError(errorMessage, commandName);
      return {
        success: false,
        error: errorMessage,
        action: 'none'
      };
    }
  }

  registerCommand(command: TerminalCommand): void {
    this.commandRegistry.register(command);
  }

  unregisterCommand(commandName: string): void {
    this.commandRegistry.unregister(commandName);
  }

  getAvailableCommands(): TerminalCommand[] {
    return this.commandRegistry.getAll();
  }

  getCommandHelp(commandName: string): string | null {
    const command = this.commandRegistry.findByNameOrAlias(commandName);
    if (!command) {
      return null;
    }

    let help = `${command.name}: ${command.description}`;
    if (command.usage) {
      help += `\nUsage: ${command.usage}`;
    }
    if (command.aliases && command.aliases.length > 0) {
      help += `\nAliases: ${command.aliases.join(', ')}`;
    }

    return help;
  }

  getOutputs(): TerminalOutput[] {
    return this.outputService.getOutputs();
  }

  getRecentOutputs(count: number = 50): TerminalOutput[] {
    return this.outputService.getRecentOutputs(count);
  }

  clearOutputs(): void {
    this.outputService.clear();
  }

  getContext() {
    return this.contextService.getContext();
  }

  getHistory(): string[] {
    return this.contextService.getHistory();
  }
}
