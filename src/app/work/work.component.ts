import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WorkExperience {
  id: number;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  logo: string;
  description: string;
  technologies: string[];
  achievements: string[];
}

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work.component.html',
  styleUrl: './work.component.css'
})
export class WorkComponent {
  workExperiences: WorkExperience[] = [
    {
      id: 1,
      company: 'TechCorp Solutions',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: '2024-01',
      logo: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=TC',
      description: 'Led development of microservices architecture for a high-traffic e-commerce platform serving 1M+ daily users. Architected and implemented scalable solutions using modern technologies.',
      technologies: ['TypeScript', 'Node.js', 'React', 'AWS', 'Docker', 'Kubernetes'],
      achievements: [
        'Reduced system response time by 40% through optimization',
        'Led a team of 5 engineers on critical projects',
        'Implemented CI/CD pipelines reducing deployment time by 60%'
      ]
    },
    {
      id: 2,
      company: 'InnovateLab',
      position: 'Full Stack Developer',
      location: 'Austin, TX',
      startDate: '2020-06',
      endDate: '2022-02',
      logo: 'https://via.placeholder.com/60x60/50C878/FFFFFF?text=IL',
      description: 'Developed and maintained web applications using modern JavaScript frameworks. Collaborated with cross-functional teams to deliver user-centric solutions.',
      technologies: ['JavaScript', 'Angular', 'Python', 'PostgreSQL', 'Redis', 'Git'],
      achievements: [
        'Built responsive web applications serving 500K+ users',
        'Improved code quality by implementing automated testing',
        'Mentored junior developers and conducted code reviews'
      ]
    },
    {
      id: 3,
      company: 'StartupXYZ',
      position: 'Frontend Developer',
      location: 'Remote',
      startDate: '2019-01',
      endDate: '2020-05',
      logo: 'https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=SX',
      description: 'Created intuitive user interfaces for a fintech startup. Focused on user experience and performance optimization.',
      technologies: ['React', 'CSS3', 'HTML5', 'Webpack', 'Jest', 'Figma'],
      achievements: [
        'Designed and implemented 15+ responsive components',
        'Achieved 95+ Lighthouse performance scores',
        'Collaborated with designers to create pixel-perfect UIs'
      ]
    },
    {
      id: 4,
      company: 'Digital Agency Pro',
      position: 'Junior Web Developer',
      location: 'Chicago, IL',
      startDate: '2018-07',
      endDate: '2018-12',
      logo: 'https://via.placeholder.com/60x60/9B59B6/FFFFFF?text=DA',
      description: 'Developed websites and web applications for various clients. Gained experience in multiple technologies and client communication.',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'MySQL', 'WordPress'],
      achievements: [
        'Delivered 20+ client projects on time and within budget',
        'Learned modern development practices and tools',
        'Contributed to open-source projects'
      ]
    }
  ];

  formatDate(date: string): string {
    const [year, month] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
}
