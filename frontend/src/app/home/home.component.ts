import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocialEntryComponent } from '../social-entry/social-entry.component';
import { TerminalService } from '../terminal/services/terminal.service';
import { TerminalOutput } from '../terminal/types/terminal.types';
import { 
  HelpCommand, 
  ClearCommand, 
  AboutCommand, 
  WorkCommand, 
  BlogCommand, 
  ContactCommand 
} from '../terminal/commands/basic-commands';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, SocialEntryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  lastLoginTime: string = '';
  greeting: string = '';
  systemInfo: string = '';
  helpText: string = '';
  prompt: string = '';
  currentCommand: string = '';
  terminalOutputs: TerminalOutput[] = [];
  
  private fullLastLoginTime: string;
  private fullGreeting: string;
  private fullSystemInfo: string;
  private fullHelpText: string;
  private isTyping: boolean = false;
  private terminalService: TerminalService;

  constructor(private router: Router) {
    this.terminalService = new TerminalService();
    this.fullLastLoginTime = new Date().toLocaleString();
    this.fullGreeting = 'Welcome to Braelyn Boynton\'s personal site!';
    this.fullSystemInfo = 'Type "help" to see available commands, or explore the site using the navigation.';
    this.fullHelpText = 'Available commands: help, about, work, blog, contact';
    
    this.initializeCommands();
  }

  ngOnInit(): void {
    this.startTypewriterEffect();
  }

  private initializeCommands(): void {
    // Register all basic commands
    this.terminalService.registerCommand(new HelpCommand(this.terminalService));
    this.terminalService.registerCommand(new ClearCommand());
    this.terminalService.registerCommand(new AboutCommand());
    this.terminalService.registerCommand(new WorkCommand());
    this.terminalService.registerCommand(new BlogCommand());
    this.terminalService.registerCommand(new ContactCommand());
  }

  private async startTypewriterEffect(): Promise<void> {
    this.isTyping = true;
    
    // Type "Last login:" first
    await this.typeText('Last login: ', 'lastLoginTime');
    
    // Then type the timestamp
    await this.typeText(this.fullLastLoginTime, 'lastLoginTime', true);
    
    // Add a small delay before next line
    await this.delay(500);
    
    // Type greeting
    await this.typeText(this.fullGreeting, 'greeting');
    
    // Add a small delay before next line
    await this.delay(500);
    
    // Type system info
    await this.typeText(this.fullSystemInfo, 'systemInfo');
    
    // Add a small delay before next line
    await this.delay(500);
    
    // Type help text
    await this.typeText(this.fullHelpText, 'helpText');
    
    // Add a small delay before showing prompt
    await this.delay(500);
    
    // Type the prompt
    await this.typeText('guest@personal-site:~$', 'prompt');
    
    this.isTyping = false;
  }

  private async typeText(text: string, targetProperty: string, append: boolean = false): Promise<void> {
    const target = targetProperty as keyof this;
    
    if (!append) {
      (this as any)[target] = '';
    }
    
    for (let i = 0; i < text.length; i++) {
      (this as any)[target] += text[i];
      await this.delay(10); // Adjust speed here (lower = faster)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.executeCommand();
    }
  }

  async executeCommand(): Promise<void> {
    const command = this.currentCommand.trim();
    if (!command) {
      this.currentCommand = '';
      return;
    }

    try {
      const result = await this.terminalService.executeCommand(command);
      
      // Update terminal outputs
      this.terminalOutputs = this.terminalService.getRecentOutputs(50);
      
      // Handle special actions
      if (result.action === 'clear') {
        this.clearTerminalDisplay();
      } else if (result.action === 'navigate' && result.data?.route) {
        this.router.navigate([result.data.route]);
      }
      
    } catch (error) {
      console.error('Command execution error:', error);
    }
    
    this.currentCommand = '';
  }

  private clearTerminalDisplay(): void {
    this.terminalOutputs = [];
    this.terminalService.clearOutputs();
  }

  getOutputClass(type: string): string {
    switch (type) {
      case 'command':
        return 'command-text';
      case 'output':
        return 'output-text';
      case 'error':
        return 'error-text';
      case 'system':
        return 'system-text';
      default:
        return 'output-text';
    }
  }
}
