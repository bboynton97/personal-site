import { CommandResult, TerminalCommand } from "../types/terminal.types";

export class AlarmCommand implements TerminalCommand {
    name = 'alarm';
    aliases = ['alert', 'emergency'];
    description = 'Trigger the US East-1 down alarm effect';
    usage = 'alarm';
  
    async execute(args: string[], context: any): Promise<CommandResult> {
      // Check if we have access to the background animation service through context
      if (context && context.backgroundAnimationService) {
        context.backgroundAnimationService.triggerAlarm();
        
        return {
          success: true,
          output: '🚨 ALARM TRIGGERED! US East-1 is down! 🚨',
          action: 'none'
        };
      } else {
        return {
          success: false,
          error: 'Background animation service not available in this context',
          action: 'none'
        };
      }
    }
  }

export class CountdownCommand implements TerminalCommand {
    name = 'countdown';
    aliases = ['timer', 'bezos'];
    description = 'Start the 2-minute countdown timer';
    usage = 'countdown';
  
    async execute(args: string[], context: any): Promise<CommandResult> {
      // Check if we have access to the background animation service through context
      if (context && context.backgroundAnimationService) {
        context.backgroundAnimationService.triggerCountdown();
        
        return {
          success: true,
          output: '⏰ Countdown started! Time until Bezos finds out.',
          action: 'none'
        };
      } else {
        return {
          success: false,
          error: 'Background animation service not available in this context',
          action: 'none'
        };
      }
    }
  }

export class ShareholderCommand implements TerminalCommand {
    name = 'shareholder';
    aliases = ['value', 'stock'];
    description = 'Start the shareholder value decrease';
    usage = 'shareholder';
  
    async execute(args: string[], context: any): Promise<CommandResult> {
      // Check if we have access to the background animation service through context
      if (context && context.backgroundAnimationService) {
        context.backgroundAnimationService.triggerShareholderValue();
        
        return {
          success: true,
          output: '📉 Shareholder value decrease started!',
          action: 'none'
        };
      } else {
        return {
          success: false,
          error: 'Background animation service not available in this context',
          action: 'none'
        };
      }
    }
  }
