import { Injectable, inject } from '@angular/core';
import { ProductService, CartService } from '../../../core/services';

export interface AssistantResponse {
  message: string;
  type: 'success' | 'info' | 'error';
  action?: string;
}

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  processCommand(input: string): AssistantResponse {
    const text = input.trim().toLowerCase();

    // أمر تفريغ السلة
    if (
      text.includes('فرّغ السلة') ||
      text.includes('فرغ السلة') ||
      text.includes('امسح السلة') ||
      text.includes('إلغاء') ||
      text === 'مسح'
    ) {
      return this.handleClearCart();
    }

    // أمر إضافة منتج
    if (
      text.includes('أضف') ||
      text.includes('اضف') ||
      text.includes('ضيف') ||
      text.includes('حط')
    ) {
      return this.handleAddProduct(text);
    }

    // استعلام عن المجموع
    if (
      text.includes('المجموع') ||
      text.includes('الإجمالي') ||
      text.includes('كم الحساب') ||
      text.includes('كم المبلغ')
    ) {
      return this.handleTotalQuery();
    }

    // البحث عن منتج
    if (
      text.includes('ابحث') ||
      text.includes('بحث') ||
      text.includes('وين') ||
      text.includes('عندك')
    ) {
      return this.handleSearch(text);
    }

    // استعلام عن المخزون
    if (
      text.includes('كم باقي') ||
      text.includes('المخزون') ||
      text.includes('الكمية')
    ) {
      return this.handleStockQuery(text);
    }

    // استعلام عن السعر
    if (
      text.includes('سعر') ||
      text.includes('بكم') ||
      text.includes('كم سعر')
    ) {
      return this.handlePriceQuery(text);
    }

    // كم صنف في السلة
    if (
      text.includes('السلة') ||
      text.includes('الطلب') ||
      text.includes('كم صنف')
    ) {
      return this.handleCartQuery();
    }

    // أمر المساعدة
    if (
      text.includes('مساعدة') ||
      text.includes('ساعدني') ||
      text.includes('أوامر') ||
      text === 'help'
    ) {
      return this.handleHelp();
    }

    // محاولة البحث التلقائي
    return this.handleFallbackSearch(text);
  }

  private handleAddProduct(text: string): AssistantResponse {
    // استخراج الكمية
    const quantityMatch = text.match(/(\d+)/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;

    // إزالة الأمر والأرقام للحصول على اسم المنتج
    const cleaned = text
      .replace(/(أضف|اضف|ضيف|حط)/g, '')
      .replace(/\d+/g, '')
      .trim();

    const product = this.findProduct(cleaned);

    if (!product) {
      return {
        message: `لم أجد منتج بهذا الاسم "${cleaned}"`,
        type: 'error',
      };
    }

    if (product.stock < quantity) {
      return {
        message: `${product.name} المخزون المتاح ${product.stock} فقط`,
        type: 'error',
      };
    }

    for (let i = 0; i < quantity; i++) {
      this.cartService.addItem(product);
    }

    return {
      message: `تم إضافة ${quantity} × ${product.name} (${product.price * quantity} ر.س)`,
      type: 'success',
      action: 'added',
    };
  }

  private handleClearCart(): AssistantResponse {
    if (this.cartService.items().length === 0) {
      return {
        message: 'السلة فارغة بالفعل',
        type: 'info',
      };
    }

    const count = this.cartService.itemCount();
    this.cartService.clearCart();
    return {
      message: `تم تفريغ السلة (${count} عنصر)`,
      type: 'success',
      action: 'cleared',
    };
  }

  private handleTotalQuery(): AssistantResponse {
    if (this.cartService.items().length === 0) {
      return {
        message: 'السلة فارغة',
        type: 'info',
      };
    }

    const subtotal = this.cartService.subtotal();
    const tax = this.cartService.taxAmount();
    const total = this.cartService.grandTotal();

    return {
      message:
        `المجموع: ${subtotal.toFixed(2)} ر.س` +
        ` + ضريبة: ${tax.toFixed(2)} ر.س` +
        ` = الإجمالي: ${total.toFixed(2)} ر.س`,
      type: 'info',
    };
  }

  private handleSearch(text: string): AssistantResponse {
    const cleaned = text.replace(/(ابحث|بحث|وين|عندك|عن|في)/g, '').trim();

    const results = this.productService
      .products()
      .filter(
        (p) =>
          p.isActive &&
          (p.name.toLowerCase().includes(cleaned) ||
            p.barcode.includes(cleaned)),
      );

    if (results.length === 0) {
      return {
        message: `لا توجد نتائج لـ "${cleaned}"`,
        type: 'error',
      };
    }

    const list = results
      .slice(0, 5)
      .map((p) => `${p.name} (${p.price} ر.س - متبقي ${p.stock})`)
      .join('\n');

    return {
      message: `وجدت ${results.length} نتيجة:\n${list}`,
      type: 'info',
    };
  }

  private handleStockQuery(text: string): AssistantResponse {
    const cleaned = text.replace(/(كم باقي|المخزون|الكمية|من|في)/g, '').trim();

    const product = this.findProduct(cleaned);
    if (!product) {
      return {
        message: `لم أجد المنتج "${cleaned}"`,
        type: 'error',
      };
    }

    const status =
      product.stock === 0
        ? 'نفد تماماً'
        : product.stock <= product.minStock
          ? 'منخفض'
          : 'متوفر';

    return {
      message: `${product.name}: المتبقي ${product.stock} (${status})`,
      type: product.stock <= product.minStock ? 'error' : 'info',
    };
  }

  private handlePriceQuery(text: string): AssistantResponse {
    const cleaned = text.replace(/(سعر|بكم|كم سعر|ال)/g, '').trim();

    const product = this.findProduct(cleaned);
    if (!product) {
      return {
        message: `لم أجد المنتج "${cleaned}"`,
        type: 'error',
      };
    }

    return {
      message: `${product.name}: ${product.price} ر.س`,
      type: 'info',
    };
  }

  private handleCartQuery(): AssistantResponse {
    const items = this.cartService.items();
    if (items.length === 0) {
      return { message: 'السلة فارغة', type: 'info' };
    }

    const list = items
      .map((i) => `${i.product.name} × ${i.quantity}`)
      .join('\n');

    return {
      message: `في السلة ${items.length} أصناف:\n${list}`,
      type: 'info',
    };
  }

  private handleHelp(): AssistantResponse {
    return {
      message:
        'الأوامر المتاحة:\n' +
        '• "أضف 2 قهوة" - إضافة منتج\n' +
        '• "كم المجموع" - معرفة الإجمالي\n' +
        '• "ابحث برجر" - البحث عن منتج\n' +
        '• "سعر القهوة" - معرفة السعر\n' +
        '• "كم باقي قهوة" - المخزون\n' +
        '• "السلة" - محتويات السلة\n' +
        '• "فرّغ السلة" - مسح الكل',
      type: 'info',
    };
  }

  private handleFallbackSearch(text: string): AssistantResponse {
    const product = this.findProduct(text);
    if (product) {
      return {
        message:
          `هل تقصد ${product.name}؟` +
          ` (${product.price} ر.س - متبقي ${product.stock})` +
          `\nاكتب "أضف ${product.name}" لإضافته`,
        type: 'info',
      };
    }

    return {
      message: 'لم أفهم الأمر. اكتب "مساعدة" لرؤية الأوامر المتاحة',
      type: 'error',
    };
  }

  private findProduct(text: string) {
    const cleaned = text.trim().toLowerCase();
    if (!cleaned) return null;

    const products = this.productService.products().filter((p) => p.isActive);

    // بحث دقيق بالاسم
    const exact = products.find((p) => p.name.toLowerCase() === cleaned);
    if (exact) return exact;

    // بحث بالباركود
    const barcode = products.find((p) => p.barcode === cleaned);
    if (barcode) return barcode;

    // بحث جزئي
    const partial = products.find((p) =>
      p.name.toLowerCase().includes(cleaned),
    );
    if (partial) return partial;

    // بحث معكوس
    return products.find((p) => cleaned.includes(p.name.toLowerCase())) ?? null;
  }
}
