export class FinanceUI {
    static formatVND(amount: number): string {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    static renderStatus(totalExpense: number, budget: number): void {
        const remaining = budget - totalExpense;
        const el = document.getElementById('remaining-amount');
        if (el) {
            el.innerText = this.formatVND(remaining);
            el.className = remaining < 0 ? 'text-danger' : 'text-success';
        }
    }

    // Thêm nút Sửa và Xóa cho Danh mục
    static renderCategories(categories: any[]): void {
        const list = document.getElementById('category-list');
        if (list) {
            list.innerHTML = categories.map(cat => `
                <div class="category-item" data-id="${cat.id}">
                    <span><strong>${cat.name}</strong> - ${this.formatVND(cat.limit)}</span>
                    <div class="actions">
                        <button class="edit-cat-btn btn-sm"><i class="fas fa-edit"></i></button>
                        <button class="delete-cat-btn btn-sm text-danger"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Thêm nút Xóa cho Giao dịch
    static renderTransactions(transactions: any[], categories: any[]): void {
        const list = document.getElementById('transaction-list');
        if (list) {
            list.innerHTML = transactions.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return `
                    <div class="transaction-item" data-id="${t.id}">
                        <span><strong>${cat?.name || 'Chung'}</strong>: ${t.note}</span>
                        <div class="actions">
                            <span class="text-danger">-${this.formatVND(t.amount)}</span>
                            <button class="delete-trans-btn btn-sm text-danger"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}   