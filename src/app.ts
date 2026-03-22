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
    }

    private loadData() {
        this.data = FinanceStorage.getMonthData(this.currentMonth);
        this.refreshUI();
    }

    private initEvents() {
        // Sự kiện đổi tháng
        document.getElementById('month-picker')?.addEventListener('change', (e) => {
            this.currentMonth = (e.target as HTMLInputElement).value;
            this.loadData();
        });

        // Sự kiện lưu ngân sách tổng
        document.getElementById('save-budget')?.addEventListener('click', () => {
            const input = document.getElementById('budget-input') as HTMLInputElement;
            this.data.budget = Number(input.value);
            this.save();
        });

        // Sự kiện thêm danh mục mới
        document.getElementById('add-category')?.addEventListener('click', () => {
            const nameEl = document.getElementById('cat-name') as HTMLInputElement;
            const limitEl = document.getElementById('cat-limit') as HTMLInputElement;
            
            if (!nameEl.value || Number(limitEl.value) <= 0) return alert("Vui lòng nhập đủ thông tin!");

            const newCat: Category = { 
                id: Date.now().toString(), 
                name: nameEl.value, 
                limit: Number(limitEl.value) 
            };
            this.data.categories.push(newCat);
            nameEl.value = ""; limitEl.value = "";
            this.save();
        });

        // Sự kiện thêm giao dịch chi tiêu
        document.getElementById('add-transaction')?.addEventListener('click', () => {
            const amountEl = document.getElementById('trans-amount') as HTMLInputElement;
            const catEl = document.getElementById('trans-category') as HTMLSelectElement;
            const noteEl = document.getElementById('trans-note') as HTMLInputElement;

            if (Number(amountEl.value) <= 0 || !catEl.value) return alert("Chọn danh mục và nhập số tiền!");

            const newTrans: Transaction = {
                id: Date.now().toString(),
                amount: Number(amountEl.value),
                categoryId: catEl.value,
                note: noteEl.value,
                date: this.currentMonth
            };
            this.data.transactions.push(newTrans);
            amountEl.value = ""; noteEl.value = "";
            this.save();
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
        
        this.updateCategoryDropdown();
        this.renderTransactions();
        this.checkAlerts();
        this.renderSummaryTable();
    }

    private updateCategoryDropdown() {
        const select = document.getElementById('trans-category') as HTMLSelectElement;
        if (select) {
            select.innerHTML = '<option value="">-- Chọn danh mục --</option>' + 
                this.data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    }

    private renderTransactions() {
        const list = document.getElementById('transaction-list');
        if (list) {
            list.innerHTML = this.data.transactions.map(t => {
                const cat = this.data.categories.find(c => c.id === t.categoryId);
                return `
                    <div class="transaction-item">
                        <span><strong>${cat?.name || 'Chung'}</strong>: ${t.note}</span>
                        <span class="text-danger">-${FinanceUI.formatVND(t.amount)}</span>
                    </div>
                `;
            }).join('');
        }
    }

    private checkAlerts() {
        const container = document.getElementById('alert-container');
        if (!container) return;
        container.innerHTML = "";
        container.style.display = "none";

        this.data.categories.forEach(cat => {
            const spent = this.data.transactions
                .filter(t => t.categoryId === cat.id)
                .reduce((s, t) => s + t.amount, 0);
            
            if (spent > cat.limit) {
                container.style.display = "block";
                container.innerHTML += `<p>⚠️ Danh mục <strong>${cat.name}</strong> vượt hạn mức: ${FinanceUI.formatVND(spent)} / ${FinanceUI.formatVND(cat.limit)}</p>`;
            }
        });
    }

    private renderSummaryTable() {
        const allData = FinanceStorage.getAllData();
        const body = document.getElementById('summary-body');
        if (body) {
            body.innerHTML = allData.map(d => {
                const total = d.transactions.reduce((s, t) => s + t.amount, 0);
                const status = total > d.budget ? '<span class="text-danger">Vượt</span>' : '<span class="text-success">Đạt</span>';
                return `
                    <tr>
                        <td>${d.month}</td>
                        <td>${FinanceUI.formatVND(total)}</td>
                        <td>${FinanceUI.formatVND(d.budget)}</td>
                        <td>${status}</td>
                    </tr>
                `;
            }).join('');
        }
    }
}

// Khởi tạo app
window.addEventListener('DOMContentLoaded', () => {
    new MainApp();
});