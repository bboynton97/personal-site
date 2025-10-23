import { TerminalCommand, CommandRegistry } from '../types/terminal.types';

export class TerminalCommandRegistry implements CommandRegistry {
  private commands = new Map<string, TerminalCommand>();
  private aliases = new Map<string, string>();

  register(command: TerminalCommand): void {
    // Register the main command
    this.commands.set(command.name.toLowerCase(), command);
    
    // Register aliases
    if (command.aliases) {
      command.aliases.forEach(alias => {
        this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
      });
    }
  }

  unregister(commandName: string): void {
    const normalizedName = commandName.toLowerCase();
    const command = this.commands.get(normalizedName);
    
    if (command) {
      // Remove aliases
      if (command.aliases) {
        command.aliases.forEach(alias => {
          this.aliases.delete(alias.toLowerCase());
        });
      }
      
      // Remove main command
      this.commands.delete(normalizedName);
    }
  }

  get(commandName: string): TerminalCommand | undefined {
    const normalizedName = commandName.toLowerCase();
    return this.commands.get(normalizedName);
  }

  getAll(): TerminalCommand[] {
    return Array.from(this.commands.values());
  }

  findByNameOrAlias(name: string): TerminalCommand | undefined {
    const normalizedName = name.toLowerCase();
    
    // First try direct command name
    let command = this.commands.get(normalizedName);
    if (command) {
      return command;
    }
    
    // Then try aliases
    const aliasedCommandName = this.aliases.get(normalizedName);
    if (aliasedCommandName) {
      return this.commands.get(aliasedCommandName);
    }
    
    return undefined;
  }

  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  getAliases(): string[] {
    return Array.from(this.aliases.keys());
  }
}
