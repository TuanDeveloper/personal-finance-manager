export class FinanceUI {
    // Định dạng tiền tệ VND chuyên nghiệp
    static formatVND(amount: number): string {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    }

    // Cập nhật trạng thái số dư còn lại
    static renderStatus(totalExpense: number, budget: number): void {
        const remaining = budget - totalExpense;
        const el = document.getElementById('remaining-amount');
        if (el) {
            el.innerText = this.formatVND(remaining);
            el.className = remaining < 0 ? 'text-danger' : 'text-success';
        }
    }

    // Render danh sách Category (dùng Template Literals)
    static renderCategories(categories: any[]): void {
        const list = document.getElementById('category-list');
        if (list) {
            list.innerHTML = categories.map(cat => `
                <div class="category-item">
                    <span><strong>${cat.name}</strong> - Giới hạn: ${this.formatVND(cat.limit)}</span>
                </div>
            `).join('');
        }
    }
}