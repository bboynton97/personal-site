import { TerminalCommand, CommandResult } from '../types/terminal.types';

export class HelpCommand implements TerminalCommand {
  name = 'help';
  aliases = ['h', '?'];
  description = 'Show available commands and their descriptions';
  usage = 'help [command]';

  constructor(private terminalService?: any) {}

  async execute(args: string[], context: any): Promise<CommandResult> {
    if (args.length > 0) {
      // Show help for specific command
      const commandName = args[0];
      const help = this.terminalService?.getCommandHelp(commandName);
      
      if (help) {
        return {
          success: true,
          output: help,
          action: 'none'
        };
      } else {
        return {
          success: false,
          error: `No help available for command: ${commandName}`,
          action: 'none'
        };
      }
    } else {
      // Show all available commands
      const commands = this.terminalService?.getAvailableCommands() || [];
      const helpText = `
Available Commands:
==================

${commands.map((cmd: TerminalCommand) => `${cmd.name.padEnd(12)} - ${cmd.description}`).join('\n')}

Type 'help <command>' for detailed information about a specific command.
      `.trim();

      return {
        success: true,
        output: helpText,
        action: 'none'
      };
    }
  }
}

export class ClearCommand implements TerminalCommand {
  name = 'clear';
  aliases = ['cls', 'c'];
  description = 'Clear the terminal screen';
  usage = 'clear';

  async execute(args: string[], context: any): Promise<CommandResult> {
    return {
      success: true,
      output: '',
      action: 'clear'
    };
  }
}

export class AboutCommand implements TerminalCommand {
  name = 'about';
  aliases = ['whoami', 'info'];
  description = 'Show information about Braelyn Boynton';
  usage = 'about';

  async execute(args: string[], context: any): Promise<CommandResult> {
    const aboutText = `
Braelyn Boynton
===============

Welcome to my personal site! I'm a developer passionate about creating 
innovative solutions and sharing knowledge through technology.

This terminal interface is built with Angular and showcases my love for 
clean, functional design and user experience.

Type 'help' to see available commands, or explore the site using the navigation.
    `.trim();

    return {
      success: true,
      output: aboutText,
      action: 'none'
    };
  }
}

export class WorkCommand implements TerminalCommand {
  name = 'work';
  aliases = ['experience', 'portfolio'];
  description = 'Show work experience and projects';
  usage = 'work';

  async execute(args: string[], context: any): Promise<CommandResult> {
    const workText = `
Work Experience
==============

I've worked on various projects spanning web development, AI, and 
user experience design. My experience includes:

• Full-stack web development
• AI/ML integration
• User interface design
• System architecture

Visit the work section to see detailed project information.
    `.trim();

    return {
      success: true,
      output: workText,
      action: 'navigate',
      data: { route: '/work' }
    };
  }
}

export class BlogCommand implements TerminalCommand {
  name = 'blog';
  aliases = ['posts', 'articles'];
  description = 'Navigate to blog section';
  usage = 'blog';

  async execute(args: string[], context: any): Promise<CommandResult> {
    return {
      success: true,
      output: 'Navigating to blog...',
      action: 'navigate',
      data: { route: '/blog' }
    };
  }
}

export class ContactCommand implements TerminalCommand {
  name = 'contact';
  aliases = ['email', 'reach'];
  description = 'Show contact information';
  usage = 'contact';

  async execute(args: string[], context: any): Promise<CommandResult> {
    const contactText = `
Contact Information
===================

LinkedIn: linkedin.com/in/braelyn-ai
Twitter: @braelyn_ai
Instagram: @braelyn.b__

Feel free to reach out for collaborations or just to say hello!
    `.trim();

    return {
      success: true,
      output: contactText,
      action: 'none'
    };
  }
}

export class CodeCommand implements TerminalCommand {
  name = 'code';
  aliases = ['dev', 'programming'];
  description = 'Show a motivational message about coding';
  usage = 'code';

  async execute(args: string[], context: any): Promise<CommandResult> {
    return {
      success: true,
      output: "You're absolutely right!",
      action: 'none'
    };
  }
}
