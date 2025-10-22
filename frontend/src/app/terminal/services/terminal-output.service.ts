import { TerminalOutput } from '../types/terminal.types';

export class TerminalOutputService {
  private outputs: TerminalOutput[] = [];
  private maxHistory = 1000;

  addOutput(output: Omit<TerminalOutput, 'id' | 'timestamp'>): TerminalOutput {
    const newOutput: TerminalOutput = {
      ...output,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.outputs.push(newOutput);
    
    // Maintain max history limit
    if (this.outputs.length > this.maxHistory) {
      this.outputs = this.outputs.slice(-this.maxHistory);
    }

    return newOutput;
  }

  addCommand(command: string): TerminalOutput {
    return this.addOutput({
      type: 'command',
      content: command,
      command
    });
  }

  addSystemMessage(message: string): TerminalOutput {
    return this.addOutput({
      type: 'system',
      content: message
    });
  }

  addError(error: string, command?: string): TerminalOutput {
    return this.addOutput({
      type: 'error',
      content: error,
      command
    });
  }

  addCommandOutput(output: string, command?: string): TerminalOutput {
    return this.addOutput({
      type: 'output',
      content: output,
      command
    });
  }

  getOutputs(): TerminalOutput[] {
    return [...this.outputs];
  }

  getRecentOutputs(count: number = 50): TerminalOutput[] {
    return this.outputs.slice(-count);
  }

  clear(): void {
    this.outputs = [];
  }

  private generateId(): string {
    return `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
