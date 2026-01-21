import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BlogComponent } from './blog/blog.component';
import { PersonalComponent } from './personal/personal.component';
import { WorkComponent } from './work/work.component';
import { LearningsFromAgentopsComponent } from './learnings-from-agentops/learnings-from-agentops.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/learnings-from-agentops', component: LearningsFromAgentopsComponent },
  { path: 'personal', component: PersonalComponent },
  { path: 'work', component: WorkComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
