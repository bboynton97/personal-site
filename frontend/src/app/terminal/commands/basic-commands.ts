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

Welcome to my personal site! I'm an engineer at heart and an entrepreneur for fun.

TODO: Add more heartfelt stuff about what i care about.

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

export class SlackCommand implements TerminalCommand {
  name = 'slack';
  aliases = ['test-slack', 'notification'];
  description = 'Test Slack message functionality';
  usage = 'slack';

  async execute(args: string[], context: any): Promise<CommandResult> {
    // Check if we have access to the notification service through context
    if (context && context.notificationService) {
      // Generate a random test message
      const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Alex Brown'];
      const messages = [
        'Hey, how are you doing?',
        'Can you review the latest changes?',
        'Meeting in 10 minutes!',
        'The build is ready for deployment',
        'Thanks for the help with the bug fix!'
      ];
      
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      context.notificationService.addNotification(randomName, randomMessage);
      
      return {
        success: true,
        output: `Slack notification test sent! Message from ${randomName}: "${randomMessage}"`,
        action: 'none'
      };
    } else {
      return {
        success: false,
        error: 'Slack notification service not available in this context',
        action: 'none'
      };
    }
  }
}


