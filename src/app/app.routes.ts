import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BlogComponent } from './blog/blog.component';
import { PersonalComponent } from './personal/personal.component';
import { WorkComponent } from './work/work.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'personal', component: PersonalComponent },
  { path: 'work', component: WorkComponent },
  { path: '**', redirectTo: '' }
];
