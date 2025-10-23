import { CommandResult, TerminalCommand } from "../types/terminal.types";

export class CodeCommand implements TerminalCommand {
    name = 'code';
    aliases = [];
    description = 'Claude Code';
    usage = 'code';
  
    async execute(args: string[], context: any): Promise<CommandResult> {
      return {
        success: true,
        output: "You're absolutely right!",
        action: 'none'
      };
    }
  }

export class WhoAmICommand implements TerminalCommand {
    name = 'whoami';
    aliases = ['who', 'identity'];
    description = 'Ask the deep question';
    usage = 'whoami';
  
    async execute(args: string[], context: any): Promise<CommandResult> {
      return {
        success: true,
        output: "Damn, now ain't that a deep question.",
        action: 'none'
      };
    }
  }