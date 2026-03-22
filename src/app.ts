import { FinanceStorage } from './storage.js';
import { FinanceUI } from './ui.js';
import type { MonthData, Category, Transaction } from './types.js';

class MainApp {
    private currentMonth: string = "";
    private data!: MonthData;

    constructor() {
        const picker = document.getElementById('month-picker') as HTMLInputElement;
        this.currentMonth = picker?.value || new Date().toISOString().slice(0, 7);
        this.loadData();
        this.initEvents();
        this.initDynamicEvents(); // Thêm hàm này để xử lý xóa/sửa
    }

    private loadData() {
        this.data = FinanceStorage.getMonthData(this.currentMonth);
        this.refreshUI();
    }

    private initEvents() {
        // ... (Giữ nguyên các sự kiện Add cũ như bài trước)
        document.getElementById('month-picker')?.addEventListener('change', (e) => {
            this.currentMonth = (e.target as HTMLInputElement).value;
            this.loadData();
        });

        document.getElementById('save-budget')?.addEventListener('click', () => {
            const input = document.getElementById('budget-input') as HTMLInputElement;
            this.data.budget = Number(input.value);
            this.save();
        });

        document.getElementById('add-category')?.addEventListener('click', () => {
            const nameEl = document.getElementById('cat-name') as HTMLInputElement;
            const limitEl = document.getElementById('cat-limit') as HTMLInputElement;
            if (!nameEl.value || Number(limitEl.value) <= 0) return alert("Nhập đủ thông tin!");
            this.data.categories.push({ id: Date.now().toString(), name: nameEl.value, limit: Number(limitEl.value) });
            nameEl.value = ""; limitEl.value = "";
            this.save();
        });

        document.getElementById('add-transaction')?.addEventListener('click', () => {
            const amountEl = document.getElementById('trans-amount') as HTMLInputElement;
            const catEl = document.getElementById('trans-category') as HTMLSelectElement;
            const noteEl = document.getElementById('trans-note') as HTMLInputElement;
            if (Number(amountEl.value) <= 0 || !catEl.value) return alert("Nhập tiền và chọn danh mục!");
            this.data.transactions.push({ id: Date.now().toString(), amount: Number(amountEl.value), categoryId: catEl.value, note: noteEl.value, date: this.currentMonth });
            amountEl.value = ""; noteEl.value = "";
            this.save();
        });
    }

    // Xử lý Xóa/Sửa bằng Event Delegation
    private initDynamicEvents() {
        // Lắng nghe click trong danh sách Danh mục
        document.getElementById('category-list')?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const btn = target.closest('button');
            if (!btn) return;

            const id = btn.closest('.category-item')?.getAttribute('data-id');
            if (!id) return;

            if (btn.classList.contains('delete-cat-btn')) {
                if (confirm("Xóa danh mục này sẽ ảnh hưởng đến các giao dịch liên quan. Bạn chắc chứ?")) {
                    this.data.categories = this.data.categories.filter(c => c.id !== id);
                    this.save();
                }
            } else if (btn.classList.contains('edit-cat-btn')) {
                const cat = this.data.categories.find(c => c.id === id);
                if (cat) {
                    const newName = prompt("Tên danh mục mới:", cat.name);
                    const newLimit = prompt("Giới hạn mới:", cat.limit.toString());
                    if (newName && newLimit) {
                        cat.name = newName;
                        cat.limit = Number(newLimit);
                        this.save();
                    }
                }
            }
        });

        // Lắng nghe click trong danh sách Giao dịch (Chỉ có Xóa)
        document.getElementById('transaction-list')?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const btn = target.closest('.delete-trans-btn');
            if (!btn) return;

            const id = btn.closest('.transaction-item')?.getAttribute('data-id');
            if (id && confirm("Bạn muốn xóa giao dịch này?")) {
                this.data.transactions = this.data.transactions.filter(t => t.id !== id);
                this.save();
            }
        });
    }

    private save() {
        FinanceStorage.saveMonthData(this.data);
        this.refreshUI();
    }

    private refreshUI() {
        const totalExp = this.data.transactions.reduce((sum, t) => sum + t.amount, 0);
        FinanceUI.renderStatus(totalExp, this.data.budget);
        FinanceUI.renderCategories(this.data.categories);
        FinanceUI.renderTransactions(this.data.transactions, this.data.categories);
        this.updateCategoryDropdown();
        this.checkAlerts();
    }

    private updateCategoryDropdown() {
        const select = document.getElementById('trans-category') as HTMLSelectElement;
        if (select) {
            select.innerHTML = '<option value="">-- Chọn danh mục --</option>' + 
                this.data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    }

    private checkAlerts() {
        const container = document.getElementById('alert-container');
        if (!container) return;
        container.innerHTML = "";
        container.style.display = "none";
        this.data.categories.forEach(cat => {
            const spent = this.data.transactions.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0);
            if (spent > cat.limit) {
                container.style.display = "block";
                container.innerHTML += `<p>⚠️ <strong>${cat.name}</strong> vượt: ${FinanceUI.formatVND(spent - cat.limit)}</p>`;
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => new MainApp());