import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { siInstagram, siX } from 'simple-icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  readonly instagramIcon = { path: siInstagram.path, title: siInstagram.title };
  readonly xIcon = { path: siX.path, title: siX.title };
}
