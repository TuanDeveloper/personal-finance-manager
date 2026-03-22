import type { MonthData } from './types.js';

export class FinanceStorage {
    private static KEY = "FINANCE_DATA_V2";

    static getAllData(): MonthData[] {
        const data = localStorage.getItem(this.KEY);
        return data ? JSON.parse(data) : [];
    }

    static getMonthData(month: string): MonthData {
        const all = this.getAllData();
        const found = all.find(d => d.month === month);
        if (found) return found;

        // Trả về dữ liệu trống nếu tháng này chưa từng được tạo
        return { month, budget: 0, categories: [], transactions: [] };
    }

    static saveMonthData(data: MonthData): void {
        let all = this.getAllData();
        const index = all.findIndex(d => d.month === data.month);
        
        if (index > -1) {
            all[index] = data;
        } else {
            all.push(data);
        }

        localStorage.setItem(this.KEY, JSON.stringify(all));
    }
}