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
      company: 'Agency',
      position: 'Co-Founder / CTO',
      location: 'San Francisco Bay Area',
      startDate: '2024-02',
      endDate: 'present',
      logo: 'assets/agency-logo.png',
      description: 'Designed an o11y compliant observability system for AI Agents as well as a scalable hosting platform for developers to productionize AI Agents.',
      technologies: ['AI/ML', 'Observability', 'Distributed Systems', 'Cloud Infrastructure', 'Python', 'TypeScript'],
      achievements: [
        'CTO, collectively managing a team of 10 software engineers and guiding product direction in accordance to the vision of the CEO',
        'Built observability system for AI Agents',
        'Created scalable hosting platform for AI Agent productionization'
      ]
    },
    {
      id: 2,
      company: 'Infinite Timelines',
      position: 'Co-Founder / CTO',
      location: 'San Francisco, California',
      startDate: '2023-02',
      endDate: '2024-02',
      logo: 'assets/infinitetimelines-logo.png',
      description: 'Early to AI Agents, used GPT-3 and vision models to identify products within YouTube videos. These products were then used to generate affiliate links to buy, and the links automatically added to the description of the YouTube video.',
      technologies: ['GPT-3', 'Computer Vision', 'AI Agents', 'YouTube API', 'Affiliate Marketing', 'Python'],
      achievements: [
        'Pioneered AI Agent technology for product identification',
        'Integrated GPT-3 and vision models for automated content analysis',
        'Built automated affiliate link generation system'
      ]
    },
    {
      id: 3,
      company: 'Coil',
      position: 'Software Engineer',
      location: 'San Francisco, California',
      startDate: '2021-11',
      endDate: '2023-03',
      logo: 'assets/coil-logo.png',
      description: 'Software Engineer at Coil, focusing on web monetization and content creator tools.',
      technologies: ['JavaScript', 'Web Monetization', 'Payment Systems', 'WebRTC', 'Node.js', 'React'],
      achievements: [
        'Developed web monetization solutions',
        'Built tools for content creators',
        'Worked on payment and streaming technologies'
      ]
    },
    {
      id: 4,
      company: 'BullyBox Inc. 501(c)3',
      position: 'Founder',
      location: 'Indianapolis, Indiana',
      startDate: '2013-01',
      endDate: '2022-12',
      logo: 'assets/bullybox-logo.png',
      description: 'The BullyBox is a 501(c)3 organization with the sole mission of providing the BullyBox school reporting software to middle and high schools at no cost. This non-profit was the final iteration empowering the redevelopment and revival of the original program that was made available to over a million students in 32 US states and 16 countries.',
      technologies: ['Web Development', 'Database Design', 'School Systems', 'Reporting Software', 'PHP', 'MySQL'],
      achievements: [
        'Served over 1 million students across 32 US states and 16 countries',
        'Provided free reporting software to middle and high schools',
        'Built comprehensive school safety and reporting platform'
      ]
    },
    {
      id: 5,
      company: 'Undo Air',
      position: 'Founder',
      location: 'Indianapolis, Indiana',
      startDate: '2020-09',
      endDate: '2021-11',
      logo: 'assets/undoair-logo.png',
      description: 'Founded Undo Air, focusing on innovative solutions and product development.',
      technologies: ['Product Development', 'Startup Operations', 'Business Strategy', 'Technology Innovation'],
      achievements: [
        'Founded and led startup company',
        'Developed innovative product solutions',
        'Managed full startup lifecycle'
      ]
    },
    {
      id: 6,
      company: 'CarrierHQ',
      position: 'Software Engineer',
      location: 'Greater Indianapolis',
      startDate: '2019-01',
      endDate: '2021-07',
      logo: 'assets/carrierhq-logo.png',
      description: 'Software Engineer at CarrierHQ, working on carrier management and logistics solutions.',
      technologies: ['Software Engineering', 'Carrier Management', 'Logistics', 'Database Systems', 'API Development'],
      achievements: [
        'Acquired Vemity',
        'Developed carrier management solutions',
        'Built logistics and tracking systems'
      ]
    },
    {
      id: 7,
      company: 'US Speaker Program (US Department of State)',
      position: 'Speaker',
      location: 'Various Locations',
      startDate: '2019-09',
      endDate: '2020-09',
      logo: 'assets/speaker-icon.svg',
      description: 'Speaker for the US Department of State Speaker Program, sharing expertise and knowledge internationally.',
      technologies: ['Public Speaking', 'International Relations', 'Knowledge Sharing', 'Cross-cultural Communication'],
      achievements: [
        'Represented US expertise internationally',
        'Delivered presentations on technology and entrepreneurship',
        'Promoted cross-cultural understanding'
      ]
    },
    {
      id: 8,
      company: 'Vemity',
      position: 'CEO and Founder',
      location: 'Greater Indianapolis',
      startDate: '2017-06',
      endDate: '2019-01',
      logo: 'assets/vemity-logo.png',
      description: 'Traditional ML training and model hosting. ML as a Service.',
      technologies: ['Machine Learning', 'MLaaS', 'Model Training', 'Cloud Computing', 'Python', 'TensorFlow'],
      achievements: [
        'Acquired by CarrierHQ in 2019',
        'Built ML as a Service platform',
        'Developed traditional ML training and hosting solutions'
      ]
    },
    {
      id: 9,
      company: 'MBS',
      position: 'CEO',
      location: 'Greater Indianapolis',
      startDate: '2013-01',
      endDate: '2018-05',
      logo: 'assets/mbs-icon.svg',
      description: 'Software Contracting company providing development services to various clients.',
      technologies: ['Software Contracting', 'Client Services', 'Project Management', 'Custom Development'],
      achievements: [
        'Led software contracting business',
        'Delivered custom software solutions',
        'Managed client relationships and projects'
      ]
    }
  ];

  formatDate(date: string): string {
    if (date === 'present') {
      return 'Present';
    }
    const [year, month] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
}
