const mailinp = document.getElementById("mail");
const senhainp = document.getElementById("senha");
const form = document.getElementById("form");
const erroemail = document.getElementById("erroemail");
const errosenha = document.getElementById("errosenha");

const API_URL = 'http://localhost:3000/api';

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    erroemail.textContent = "";
    errosenha.textContent = "";

    const email = mailinp.value;
    const password = senhainp.value;

    if (!email || !password) {
        if (!email) erroemail.textContent = "Preencha o email";
        if (!password) errosenha.textContent = "Preencha a senha";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = "dashboard.html";
        } else {
            errosenha.textContent = data.message || "Erro ao fazer login";
        }
    } catch (error) {
        console.error('Login error:', error);
        errosenha.textContent = "Erro de conexão com o servidor";
    }
});