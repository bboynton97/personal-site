import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  route: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  blogPosts: BlogPost[] = [
    // {
    //   id: 'learnings-from-agentops',
    //   title: 'Learnings from AgentOps',
    //   excerpt: 'Key insights and lessons learned from working with AgentOps.',
    //   date: '2024-01-15',
    //   route: '/blog/learnings-from-agentops'
    // }
  ];
}
