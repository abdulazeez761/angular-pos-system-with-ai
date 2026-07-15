import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  title = input('تأكيد الحذف');
  message = input('هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.');
  confirmText = input('حذف');
  confirm = output<void>();
  cancel = output<void>();
}
