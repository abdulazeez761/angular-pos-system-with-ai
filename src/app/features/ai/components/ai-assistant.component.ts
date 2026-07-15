import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AiAssistantService,
  AssistantResponse,
} from '../services/ai-assistant.service';

interface ChatMessage {
  text: string;
  type: 'user' | 'success' | 'info' | 'error';
  time: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ai-assistant.component.html',
})
export class AiAssistantComponent {
  private assistant = inject(AiAssistantService);

  isOpen = signal(false);
  inputText = '';

  messages = signal<ChatMessage[]>([
    {
      text: 'أهلاً! أنا مساعدك الذكي. اكتب "مساعدة" لرؤية ما أستطيع فعله.',
      type: 'info',
      time: this.getTime(),
    },
  ]);

  quickCommands = ['كم المجموع', 'السلة', 'فرّغ السلة', 'مساعدة'];

  onSend(): void {
    const text = this.inputText.trim();
    if (!text) return;

    // إضافة رسالة المستخدم
    this.messages.update((msgs) => [
      ...msgs,
      { text, type: 'user' as const, time: this.getTime() },
    ]);

    // معالجة الأمر
    const response: AssistantResponse = this.assistant.processCommand(text);

    // إضافة رد المساعد
    this.messages.update((msgs) => [
      ...msgs,
      {
        text: response.message,
        type: response.type,
        time: this.getTime(),
      },
    ]);

    this.inputText = '';
  }

  onQuickCommand(cmd: string): void {
    this.inputText = cmd;
    this.onSend();
  }

  private getTime(): string {
    return new Date().toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
