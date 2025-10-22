import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-social-entry',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './social-entry.component.html',
  styleUrl: './social-entry.component.css'
})
export class SocialEntryComponent {
  isVisible: boolean = true;
  buttonText: string = 'Enter';

  constructor(private router: Router) {}

  onEnterClick() {
    this.isVisible = false;
    this.router.navigate(['/home']);
  }

  onButtonHover() {
    this.buttonText = 'Can you handle it??';
  }

  onButtonLeave() {
    this.buttonText = 'Enter';
  }
}
