import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slack-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slack-message.component.html',
  styleUrl: './slack-message.component.css'
})
export class SlackMessageComponent {
  @Input() name: string = '';
  @Input() message: string = '';
  @Input() id: string = '';
  @Output() dismiss = new EventEmitter<string>();

  onDismiss() {
    this.dismiss.emit(this.id);
  }
}
