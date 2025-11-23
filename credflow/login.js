const mailinp = document.getElementById("mail");
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senhainp = document.getElementById("senha");
const form = document.getElementById("form")
let erroemail = document.getElementById("erroemail")
let errosenha = document.getElementById("errosenha");

form.addEventListener('submit' , (e) => {
    e.preventDefault();
    if(regex.test(mailinp.value)){
        erroemail.textContent =""
    }
    else{
        erroemail.textContent ="O email precisa conter o formato padrão" 
    }

    if(senhainp.value.length>=8){
        errosenha.textContent = ""  
    }

    else{
        errosenha.textContent = "A senha deve conter no minimo 8 caracteres"
    }
})