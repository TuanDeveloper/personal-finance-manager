// --- CÁC CẤU TRÚC DỮ LIỆU ĐÃ HỌC (TS Essentials: Core & OOP) ---
// 1. Dùng Enum để định nghĩa loại giao dịch (An toàn hơn string thuần)
var TransactionType;
(function (TransactionType) {
    TransactionType["INCOME"] = "INCOME";
    TransactionType["EXPENSE"] = "EXPENSE";
})(TransactionType || (TransactionType = {}));
// --- CLASS QUẢN LÝ ỨNG DỤNG (OOP, Functions) ---
// Thể hiện tư duy tổ chức code theo Module
class FinanceApp {
    constructor() {
        // 3. Sử dụng Mảng để lưu trữ dữ liệu (JS Arrays & Functions)
        // Áp dụng Generic cho Type: Array<ITransaction>
        this.transactions = [];
        this.localStorageKey = "transactions_data";
        // --- DOM Elements & Event Handling ---
        this.balanceEl = document.getElementById('balance');
        this.moneyPlusEl = document.getElementById('money-plus');
        this.moneyMinusEl = document.getElementById('money-minus');
        this.listEl = document.getElementById('list');
        this.formEl = document.getElementById('form');
        this.textInputEl = document.getElementById('text');
        this.amountInputEl = document.getElementById('amount');
        this.typeSelectEl = document.getElementById('type');
        this.messagesEl = document.getElementById('form-messages');
        // Tải dữ liệu ban đầu
        this.loadTransactions();
        // Khởi tạo các sự kiện
        this.initializeEventListeners();
        // Render UI ban đầu
        this.init();
    }
    // --- FUNCTION FUNDAMENTALS ---
    // Hàm lấy dữ liệu từ localStorage (TS Tuple, Union concept)
    loadTransactions() {
        const storedData = localStorage.getItem(this.localStorageKey);
        // JS Control Flow (if-else)
        if (storedData) {
            // Chuyển đổi dữ liệu và ép kiểu an toàn
            this.transactions = JSON.parse(storedData);
        }
        else {
            this.transactions = [];
        }
    }
    // Hàm lưu dữ liệu
    saveTransactions() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.transactions));
    }
    // Khởi tạo các event listeners
    initializeEventListeners() {
        // EVENT HANDLING (Submit)
        this.formEl.addEventListener('submit', (e) => this.addTransaction(e));
        // EVENT HANDLING (Delegation cho nút xóa)
        this.listEl.addEventListener('click', (e) => this.handleTransactionClick(e));
    }
    // --- LOGIC GIAO DỊCH (JS Functions, Arrays Methods, Flow Control) ---
    // Thêm giao dịch mới
    addTransaction(e) {
        e.preventDefault();
        // --- FORM VALIDATION ---
        // Làm sạch thông báo cũ
        this.messagesEl.innerHTML = '';
        this.messagesEl.classList.remove('error', 'success');
        const textValue = this.textInputEl.value.trim();
        const amountValue = parseFloat(this.amountInputEl.value);
        const typeValue = this.typeSelectEl.value;
        const errors = [];
        // Kiểm tra validation (JS Control Flow)
        if (!textValue) {
            errors.push('Vui lòng nhập tên giao dịch.');
        }
        if (isNaN(amountValue)) {
            errors.push('Vui lòng nhập số tiền.');
        }
        else if (amountValue <= 0) {
            errors.push('Số tiền phải lớn hơn 0.');
        }
        // Nếu có lỗi, hiển thị và dừng lại
        if (errors.length > 0) {
            // MODERN JS (ES6 - Map, Template Literals)
            this.messagesEl.innerHTML = errors.map(err => `<p><i class="fas fa-exclamation-triangle"></i> ${err}</p>`).join('');
            this.messagesEl.classList.add('error');
            return;
        }
        // Tạo object giao dịch mới
        const newTransaction = {
            id: this.generateID(),
            text: textValue,
            amount: amountValue,
            type: typeValue
        };
        // --- ARRAY HANDLING & MANIPULATION ---
        // Thêm vào mảng (JS Arrays)
        this.transactions.push(newTransaction);
        // Lưu và cập nhật UI
        this.saveTransactions();
        this.addTransactionToDOM(newTransaction);
        this.updateValues();
        // Xóa form và hiển thị thành công
        this.formEl.reset();
        this.messagesEl.innerHTML = `<p><i class="fas fa-check-circle"></i> Đã thêm giao dịch thành công!</p>`;
        this.messagesEl.classList.add('success');
        // Tự động xóa thông báo sau 3 giây
        setTimeout(() => {
            this.messagesEl.innerHTML = '';
            this.messagesEl.classList.remove('success');
        }, 3000);
    }
    // Xử lý click vào giao dịch (để xóa)
    handleTransactionClick(e) {
        const target = e.target;
        // Kiểm tra xem có click vào nút xóa không
        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
            // Lấy ID giao dịch (dữ liệu được lưu trong data-id attribute)
            const listItem = target.closest('li');
            const transactionId = parseInt(listItem.getAttribute('data-id') || '0');
            this.removeTransaction(transactionId);
        }
    }
    // Xóa giao dịch theo ID
    removeTransaction(id) {
        // --- ARRAY MANIPULATION (Filter) ---
        // Tạo mảng mới không bao gồm giao dịch bị xóa
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        // Cập nhật lưu trữ và UI
        this.saveTransactions();
        this.init(); // Re-render lại toàn bộ danh sách
    }
    // --- UI RENDERING (DOM Fundamentals, Event Handling) ---
    // Thêm một giao dịch đơn lẻ vào DOM (JS & DOM)
    addTransactionToDOM(transaction) {
        // MODERN JS (Destructuring)
        const { text, amount, type } = transaction;
        const sign = type === TransactionType.INCOME ? '+' : '-';
        const itemClass = type === TransactionType.INCOME ? 'plus' : 'minus';
        // Tạo thẻ li (JS DOM Creation)
        const item = document.createElement('li');
        item.classList.add(itemClass);
        item.setAttribute('data-id', transaction.id.toString());
        // Định dạng số tiền
        const formattedAmount = this.formatMoney(amount);
        // MODERN JS (Template Literals) - DOM Handling
        item.innerHTML = `
      <div class="transaction-container">
          <div class="transaction-info">
              <i class="fas ${type === TransactionType.INCOME ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
              <span>${text}</span>
          </div>
          <span class="transaction-amount">${sign}${formattedAmount}</span>
      </div>
      <button class="delete-btn" title="Xóa giao dịch">
          <i class="fas fa-times"></i>
      </button>
  `;
        this.listEl.appendChild(item);
    }
    // Cập nhật các giá trị thống kê
    updateValues() {
        // --- ARRAY REDUCE & FILTER (Advanced JS Arrays) ---
        // Tính tổng thu nhập
        const income = this.transactions
            .filter(transaction => transaction.type === TransactionType.INCOME)
            .reduce((acc, transaction) => acc + transaction.amount, 0);
        // Tính tổng chi tiêu
        const expense = this.transactions
            .filter(transaction => transaction.type === TransactionType.EXPENSE)
            .reduce((acc, transaction) => acc + transaction.amount, 0);
        const totalBalance = income - expense;
        // --- DOM TEXT CONTENT HANDLING ---
        // Cập nhật UI với định dạng tiền
        this.balanceEl.innerText = `${this.formatMoney(totalBalance)}`;
        // Thay đổi màu sắc dựa trên số dư
        this.balanceEl.className = 'balance-amount ' + (totalBalance < 0 ? 'negative' : 'positive');
        this.moneyPlusEl.innerText = `+${this.formatMoney(income)}`;
        this.moneyMinusEl.innerText = `-${this.formatMoney(expense)}`;
    }
    // --- HELPERS (JS Functions, String Methods) ---
    // Tạo ID ngẫu nhiên (JS Fundamentals)
    generateID() {
        return Math.floor(Math.random() * 100000000);
    }
    // Định dạng tiền tệ VND (JS String Methods)
    formatMoney(money) {
        return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' VND';
    }
    // --- INITIALIZATION ---
    // Khởi tạo ứng dụng
    init() {
        // Xóa danh sách cũ
        this.listEl.innerHTML = '';
        // Render lại tất cả các giao dịch (JS Arrays & Loops - forEach)
        this.transactions.forEach(transaction => this.addTransactionToDOM(transaction));
        // Cập nhật thống kê
        this.updateValues();
    }
}
// Khởi chạy ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    new FinanceApp();
});
export {};
//# sourceMappingURL=app.js.map