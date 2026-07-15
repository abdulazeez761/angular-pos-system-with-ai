import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  save<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
    } catch (error) {
      console.error('فشل في حفظ البيانات:', error);
    }
  }
  load<T>(key: string, fallback: T): T {
    try {
      const json = localStorage.getItem(key);
      return json ? (JSON.parse(json) as T) : fallback;
    } catch (error) {
      console.error('فشل في تحميل البيانات:', error);
      return fallback;
    }
  }
  remove(key: string): void {
    localStorage.removeItem(key);
  }
  clear(): void {
    localStorage.clear();
  }
}
