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

  constructor(private router: Router) {}

  onEnterClick() {
    this.router.navigate(['/home']);
  }
}
