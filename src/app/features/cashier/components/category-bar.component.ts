import { Component, input, output } from '@angular/core';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-bar',
  imports: [],
  templateUrl: './category-bar.component.html',
  styleUrl: './category-bar.component.css',
})
export class CategoryBarComponent {
  categories = input.required<Category[]>();
  activeId = input<string>('all');
  selected = output<string>();
}
