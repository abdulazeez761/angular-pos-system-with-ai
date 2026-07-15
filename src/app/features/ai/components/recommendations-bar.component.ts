import { Component, inject, output } from '@angular/core';
import { Product } from '../../../core/models';
import { RecommendationService } from '../services/recommendation.service';

@Component({
  selector: 'app-recommendations-bar',
  imports: [],
  templateUrl: './recommendations-bar.component.html',
  styleUrl: './recommendations-bar.component.css',
})
export class RecommendationsBarComponent {
  recService = inject(RecommendationService);
  addToCart = output<Product>();
  private iconMap: Record<string, string> = {
    drinks: '🥤',
    food: '🍔',
    snacks: '🍿',
    other: '📦',
  };
  getCategoryIcon(category: string): string {
    return this.iconMap[category] ?? '📦';
  }
}
