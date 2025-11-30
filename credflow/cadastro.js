const nomeinp = document.getElementById("nome");
const mailinp = document.getElementById("mail");
const senhainp = document.getElementById("senha");
const confinp = document.getElementById("conf");
const form = document.getElementById("form");

const erronome = document.getElementById("erronome");
const erroemail = document.getElementById("erroemail");
const errosenha = document.getElementById("errosenha");
const erroconfirma = document.getElementById("erroconfirma");

const API_URL = 'http://localhost:3000/api';

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset errors
    erronome.textContent = "";
    erroemail.textContent = "";
    errosenha.textContent = "";
    erroconfirma.textContent = "";

    const name = nomeinp.value;
    const email = mailinp.value;
    const password = senhainp.value;
    const confirmPassword = confinp.value;

    let hasError = false;

    if (!name) {
        erronome.textContent = "Nome é obrigatório";
        hasError = true;
    }
    // Validação de Email Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        erroemail.textContent = "Formato de email inválido";
        hasError = true;
    }

    // Validação de Senha Regex (Min 8, 1 Maiúscula, 1 Minúscula, 1 Número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        errosenha.textContent = "Senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula e um número";
        hasError = true;
    }

    if (password !== confirmPassword) {
        erroconfirma.textContent = "Senhas não conferem";
        hasError = true;
    }

    if (hasError) return;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Cadastro realizado com sucesso! Faça login.");
            window.location.href = "login.html";
        } else {
            // Tratamento de erros específicos do backend
            if (data.message === 'User already exists') {
                erroemail.textContent = "Este email já está cadastrado, faça login.";
            } else {
                erroemail.textContent = data.message || "Erro ao cadastrar";
            }
        }
    } catch (error) {
        console.error('Register error:', error);
        alert("Erro de conexão com o servidor");
    }
});
