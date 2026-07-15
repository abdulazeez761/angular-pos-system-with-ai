import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  isOpen = signal(false);
  navItems: NavItem[] = [
    { path: '/cashier', label: 'نقطة البيع', icon: '🛒' },
    { path: '/inventory', label: 'المخزون', icon: '📦' },
    { path: '/customers', label: 'العملاء', icon: '👥' },
    { path: '/reports', label: 'التقارير', icon: '📊' },
  ];
  toggleSidebar() {
    this.isOpen.set(!this.isOpen());
  }
}
