interface OrderExportData {
  date: Date;
  restaurant: {
    name: string;
    cuisine: string;
  };
  orders: Array<{
    employeeName: string;
    items: Array<{
      itemName: string;
      quantity: number;
      notes?: string;
      price: number;
      subtotal: number;
    }>;
    total: number;
  }>;
  summary: {
    totalOrders: number;
    totalAmount: number;
    itemBreakdown: Array<{
      itemName: string;
      totalQuantity: number;
      totalAmount: number;
    }>;
  };
}

export class ExportFormatter {
  static formatAsText(data: OrderExportData): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(60));
    lines.push(`ARRAY EATS - ORDER SUMMARY`);
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Date: ${data.date.toLocaleDateString()}`);
    lines.push(`Restaurant: ${data.restaurant.name} (${data.restaurant.cuisine})`);
    lines.push(`Total Orders: ${data.summary.totalOrders}`);
    lines.push(`Total Amount: $${data.summary.totalAmount.toFixed(2)}`);
    lines.push('');
    lines.push('='.repeat(60));
    lines.push('INDIVIDUAL ORDERS');
    lines.push('='.repeat(60));
    lines.push('');

    data.orders.forEach((order, index) => {
      lines.push(`${index + 1}. ${order.employeeName}`);
      lines.push('-'.repeat(60));
      
      order.items.forEach((item) => {
        lines.push(`   ${item.quantity}x ${item.itemName} - $${item.subtotal.toFixed(2)}`);
        if (item.notes) {
          lines.push(`      Note: ${item.notes}`);
        }
      });
      
      lines.push(`   Total: $${order.total.toFixed(2)}`);
      lines.push('');
    });

    lines.push('='.repeat(60));
    lines.push('ITEM SUMMARY (for restaurant)');
    lines.push('='.repeat(60));
    lines.push('');

    data.summary.itemBreakdown.forEach((item) => {
      lines.push(`${item.totalQuantity}x ${item.itemName} - $${item.totalAmount.toFixed(2)}`);
    });

    lines.push('');
    lines.push('='.repeat(60));
    lines.push(`GRAND TOTAL: $${data.summary.totalAmount.toFixed(2)}`);
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  static formatAsCSV(data: OrderExportData): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Employee Name,Item Name,Quantity,Price,Subtotal,Notes');
    
    // Data rows
    data.orders.forEach((order) => {
      order.items.forEach((item) => {
        const notes = item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '';
        lines.push(
          `"${order.employeeName}","${item.itemName}",${item.quantity},${item.price.toFixed(2)},${item.subtotal.toFixed(2)},${notes}`
        );
      });
    });

    return lines.join('\n');
  }

  static formatAsJSON(data: OrderExportData): string {
    return JSON.stringify(data, null, 2);
  }
}
