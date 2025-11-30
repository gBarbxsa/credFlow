// Logica do Dashboard

// Estado
let transactions = [];
let currentType = 'saida';
let cashFlowChart;
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const modal = document.getElementById('transactionModal');
const btnSaida = document.getElementById('btn-saida');
const btnEntrada = document.getElementById('btn-entrada');
const submitBtn = document.getElementById('submit-btn');
const descInput = document.getElementById('descInput');
const valueInput = document.getElementById('valueInput');
const categoryInput = document.getElementById('categoryInput');
const transactionsList = document.getElementById('transactionsList');
const emptyState = document.getElementById('emptyState');
const totalEntradasEl = document.getElementById('totalEntradas');
const totalSaidasEl = document.getElementById('totalSaidas');
const saldoAtualEl = document.getElementById('saldoAtual');

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchTransactions();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }

    // Exibe nome do usuario
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const userMenu = document.querySelector('.user-menu span');
        if (userMenu) userMenu.textContent = `Olá, ${user.name}`;
    }
}

async function fetchTransactions() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/transactions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            transactions = await response.json();
            // Mapeia campos do banco de dados para campos do frontend se necessário (DB: Description, Value, Type, Category, Date)
            // JS: description, value, type, category, date

            transactions = transactions.map(t => ({
                id: t.Id,
                description: t.Description,
                value: t.Value,
                type: t.Type,
                category: t.Category,
                date: new Date(t.Date).toLocaleDateString('pt-BR')
            }));

            initChart();
            updateSummary();
            renderAllTransactions();
        } else {
            console.error('Failed to fetch transactions');
            if (response.status === 401 || response.status === 403) {
                logout();
            }
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

document.querySelector('.logout').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// Modal
function openModal() {
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    clearInputs();
}

// Fecha modal ao clicar fora
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

function setTransactionType(type) {
    currentType = type;
    if (type === 'saida') {
        btnSaida.classList.add('active');
        btnEntrada.classList.remove('active');
        submitBtn.textContent = 'Confirmar Despesa';
        submitBtn.style.background = '#ef4444';
    } else {
        btnEntrada.classList.add('active');
        btnSaida.classList.remove('active');
        submitBtn.textContent = 'Confirmar Receita';
        submitBtn.style.background = '#10b981';
    }
}

function clearInputs() {
    descInput.value = '';
    valueInput.value = '';
    categoryInput.value = '';
    setTransactionType('saida'); // Reset to default
}

// Logica de Transacao
async function addTransaction() {
    const description = descInput.value;
    const value = parseFloat(valueInput.value);
    const category = categoryInput.value;

    if (!description || isNaN(value) || value <= 0 || !category) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const transactionData = {
        description,
        value,
        type: currentType,
        category
    };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(transactionData)
        });

        if (response.ok) {
            // Atualiza transacoes
            await fetchTransactions();
            closeModal();
        } else {
            alert('Erro ao salvar transação.');
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        alert('Erro de conexão.');
    }
}

function renderAllTransactions() {
    transactionsList.innerHTML = ''; // Limpa lista
    // Re-add empty state (hidden)
    transactionsList.appendChild(emptyState);

    if (transactions.length > 0) {
        emptyState.style.display = 'none';
        transactions.forEach(t => renderTransaction(t));
    } else {
        emptyState.style.display = 'flex';
    }
}

function renderTransaction(transaction) {
    // Esconde estado vazio se estiver visível
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    const item = document.createElement('div');
    item.className = 'transaction-item';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '1rem';
    item.style.background = 'rgba(30, 41, 59, 0.4)';
    item.style.borderRadius = '0.5rem';
    item.style.marginBottom = '0.5rem';
    item.style.border = '1px solid rgba(255, 255, 255, 0.05)';
    item.style.animation = 'slideIn 0.3s ease';

    const valueClass = transaction.type === 'entrada' ? 'green' : 'red';
    const valueSign = transaction.type === 'entrada' ? '+' : '-';

    item.innerHTML = `
        <div class="trans-info" style="display: flex; flex-direction: column;">
            <span class="trans-name" style="color: #fff; font-weight: 500;">${transaction.description}</span>
            <span class="trans-date" style="color: #94a3b8; font-size: 0.8rem;">${transaction.date} • ${capitalize(transaction.category)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="trans-value ${valueClass}" style="font-weight: 600;">${valueSign} ${formatCurrency(transaction.value)}</span>
            <button onclick="deleteTransaction(${transaction.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.1rem;" title="Excluir">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    const firstItem = transactionsList.querySelector('.transaction-item');
    if (firstItem) {
        transactionsList.insertBefore(item, firstItem);
    } else {
        transactionsList.appendChild(item);
    }
}

async function deleteTransaction(id) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            transactions = transactions.filter(t => t.id !== id);

            updateSummary();
            updateChart();
            renderAllTransactions();
        } else {
            alert('Erro ao excluir transação.');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Erro de conexão.');
    }
}

function updateSummary() {
    const totalEntradas = transactions
        .filter(t => t.type === 'entrada')
        .reduce((acc, t) => acc + t.value, 0);

    const totalSaidas = transactions
        .filter(t => t.type === 'saida')
        .reduce((acc, t) => acc + t.value, 0);

    const saldo = totalEntradas - totalSaidas;

    totalEntradasEl.textContent = `R$ ${formatCurrency(totalEntradas)}`;
    totalSaidasEl.textContent = `R$ ${formatCurrency(totalSaidas)}`;
    saldoAtualEl.textContent = `R$ ${formatCurrency(saldo)}`;

    // Atualizacao cor do saldo 
    saldoAtualEl.className = `value ${saldo >= 0 ? 'blue' : 'red'}`;

    return saldo; 
}

// Funcoes auxiliares
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Logica do grafico
function initChart() {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');

    if (cashFlowChart) {
        cashFlowChart.destroy();
    }

    // Gera os labels dos ultimos 6 meses
    const labels = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const today = new Date();

    // Calcula as datas de inicio para os ultimos 6 meses
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(monthNames[d.getMonth()]);
        months.push(d);
    }

    // Calcula os balancos para cada mes
    const historyData = months.map(monthStart => {
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

        // Filtra as transacoes até este mes
        const monthlyTransactions = transactions.filter(t => {
            const [day, month, year] = t.date.split('/');
            const tDate = new Date(year, month - 1, day);
            return tDate <= monthEnd;
        });

        // Calcula o total para este periodo
        const totalEntradas = monthlyTransactions
            .filter(t => t.type === 'entrada')
            .reduce((acc, t) => acc + t.value, 0);

        const totalSaidas = monthlyTransactions
            .filter(t => t.type === 'saida')
            .reduce((acc, t) => acc + t.value, 0);

        return totalEntradas - totalSaidas;
    });

    cashFlowChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Saldo',
                data: historyData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function (value) {
                            return 'R$ ' + value.toLocaleString('pt-BR', { notation: "compact" });
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function updateChart() {
    // Reinicie o grafico para recalcular todos os pontos do historico baseados na nova transacao
    initChart();
}
