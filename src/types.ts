export enum TransactionType {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE"
}

export interface Category {
    id: string;
    name: string;
    limit: number;
}

export interface Transaction {
    id: string;
    amount: number;
    categoryId: string;
    note: string;
    date: string; // Định dạng "YYYY-MM"
}

export interface MonthData {
    month: string;
    budget: number;
    categories: Category[];
    transactions: Transaction[];
}