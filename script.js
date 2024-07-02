document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.id;

    if (currentPage === 'new-user-page') {
        const registerButton = document.getElementById('register-button');

        registerButton.addEventListener('click', () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username && password) {
                let users = JSON.parse(localStorage.getItem('users') || '[]');
                if (users.some(user => user.username === username)) {
                    alert('Username already exists.');
                } else {
                    users.push({ username, password, sheets: [] });
                    localStorage.setItem('users', JSON.stringify(users));
                    alert('User registered successfully.');
                    location.href = 'existing-user.html';
                }
            } else {
                alert('Please enter a username and password.');
            }
        });
    }

    if (currentPage === 'existing-user-page') {
        const loginButton = document.getElementById('login-button');

        loginButton.addEventListener('click', () => {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            let users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(user => user.username === username && user.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                location.href = 'sheets.html';
            } else {
                alert('Invalid username or password.');
            }
        });
    }

   
    if (currentPage === 'sheets-page') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const sheetList = document.getElementById('sheet-list');
        const newSheetButton = document.getElementById('new-sheet-button');
        const logoutButton = document.getElementById('logout-button');

        const renderSheets = () => {
            sheetList.innerHTML = '';
            currentUser.sheets.forEach((sheet, index) => {
                const sheetCard = document.createElement('div');
                sheetCard.classList.add('sheet-card');

                const sheetName = document.createElement('h3');
                sheetName.textContent = sheet.name;
                sheetCard.appendChild(sheetName);

                const viewButton = document.createElement('button');
                viewButton.textContent = 'View Transactions';
                viewButton.addEventListener('click', () => {
                    viewTransactions(index);
                });
                sheetCard.appendChild(viewButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    deleteSheet(index);
                });
                sheetCard.appendChild(deleteButton);

                sheetList.appendChild(sheetCard);
            });
        };

        const viewTransactions = (index) => {
            localStorage.setItem('currentSheetIndex', index);
            location.href = 'transactions.html';
        };

        const deleteSheet = (index) => {
            const confirmation = confirm('Are you sure you want to delete this sheet?');
            if (confirmation) {
                currentUser.sheets.splice(index, 1);
                updateCurrentUserInLocalStorage(currentUser);
                renderSheets();
            }
        };
    
            newSheetButton.addEventListener('click', () => {
                const sheetName = prompt('Enter new sheet name:');
                const initialBalance = parseFloat(prompt('Enter initial balance for this sheet:'));
                if (sheetName && !isNaN(initialBalance)) {
                    currentUser.sheets.push({ name: sheetName, transactions: [{ name: 'Initial Balance', amount: initialBalance, 
                        type: 'income', timestamp: new Date().toISOString() }] });
                    updateCurrentUserInLocalStorage(currentUser);
                    renderSheets();
                } else {
                    alert('Please enter a valid sheet name and initial balance.');
                }
            });
    
            logoutButton.addEventListener('click', () => {
                updateCurrentUserInLocalStorage(currentUser);
                localStorage.removeItem('currentUser');
                location.href = 'index.html';
            });
    
            renderSheets();
        }

      

    if (currentPage === 'transactions-page') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentSheetIndex = localStorage.getItem('currentSheetIndex');
        const sheet = currentUser.sheets[currentSheetIndex];
        const sheetNameElement = document.getElementById('sheet-name');
        const transactionForm = document.getElementById('transaction-form');
        const transactionName = document.getElementById('transaction-name');
        const transactionAmount = document.getElementById('transaction-amount');
        const transactionType = document.getElementById('transaction-type');
        const transactionTableBody = document.getElementById('transaction-table-body');
        const totalAmount = document.getElementById('total-amount');
        sheetNameElement.textContent = sheet.name;

        const renderTransactions = () => {
            transactionTableBody.innerHTML = '';
            let total = 0;
            sheet.transactions.forEach((transaction, index) => {
                renderTransactionRow(transaction, index);
                total += transaction.type === 'income' ? transaction.amount : -transaction.amount;
            });
            totalAmount.textContent = `Net Total: $${total.toFixed(2)}`;
        };

        const renderTransactionRow = (transaction, index) => {
            const tr = document.createElement('tr');
            const nameCell = document.createElement('td');
            nameCell.textContent = transaction.name;
            tr.appendChild(nameCell);
            const amountCell = document.createElement('td');
            amountCell.textContent = `$${transaction.amount.toFixed(2)}`;
            tr.appendChild(amountCell);
            const typeCell = document.createElement('td');
            typeCell.textContent = transaction.type;
            tr.appendChild(typeCell);
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(transaction.timestamp).toLocaleString();
            tr.appendChild(dateCell);
            const deleteCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                sheet.transactions.splice(index, 1);
                updateCurrentUserInLocalStorage(currentUser);
                renderTransactions();
            });
            deleteCell.appendChild(deleteButton);
            tr.appendChild(deleteCell);
            if (transaction.type === 'income') {
                tr.style.color = 'green';
            } else if (transaction.type === 'expense') {
                tr.style.color = 'red';
            }
            transactionTableBody.appendChild(tr);
        };

        const showTransactionForm = () => {
            transactionForm.style.display = 'block';
        };

        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const transactionNameValue = transactionName.value;
            const transactionAmountValue = parseFloat(transactionAmount.value);
            const transactionTypeValue = transactionType.value;
            if (transactionNameValue && !isNaN(transactionAmountValue) && transactionTypeValue) {
                sheet.transactions.push({
                    name: transactionNameValue,
                    amount: transactionAmountValue,
                    type: transactionTypeValue,
                    timestamp: new Date().toISOString()
                });
                updateCurrentUserInLocalStorage(currentUser);
                transactionName.value = '';
                transactionAmount.value = '';
                renderTransactions();
            } else {
                alert('Please fill out all transaction fields.');
            }
        });

        renderTransactions();
    }

    function updateCurrentUserInLocalStorage(currentUser) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(user => user.username === currentUser.username ? currentUser : user);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

});

