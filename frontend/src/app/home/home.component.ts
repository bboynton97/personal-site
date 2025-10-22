import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  lastLoginTime: string;
  greeting: string;
  systemInfo: string;
  helpText: string;
  currentCommand: string = '';

  constructor() {
    this.lastLoginTime = new Date().toLocaleString();
    this.greeting = 'Welcome to Braelyn Boynton\'s personal site!';
    this.systemInfo = 'Type "help" to see available commands, or explore the site using the navigation.';
    this.helpText = 'Available commands: help, about, work, blog, contact';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.executeCommand();
    }
  }

  executeCommand(): void {
    const command = this.currentCommand.toLowerCase().trim();
    
    switch (command) {
      case 'help':
        this.showHelp();
        break;
      case 'about':
        this.showAbout();
        break;
      case 'work':
        this.showWork();
        break;
      case 'blog':
        this.showBlog();
        break;
      case 'contact':
        this.showContact();
        break;
      case 'clear':
        this.clearTerminal();
        break;
      default:
        if (command) {
          this.showError(`Command not found: ${command}`);
        }
    }
    
    this.currentCommand = '';
  }

  private showHelp(): void {
    console.log('Help command executed');
    // You can add more sophisticated command handling here
  }

  private showAbout(): void {
    console.log('About command executed');
  }

  private showWork(): void {
    console.log('Work command executed');
  }

  private showBlog(): void {
    console.log('Blog command executed');
  }

  private showContact(): void {
    console.log('Contact command executed');
  }

  private showError(message: string): void {
    console.log(`Error: ${message}`);
  }

  private clearTerminal(): void {
    // This would clear the terminal content
    console.log('Terminal cleared');
  }
}
