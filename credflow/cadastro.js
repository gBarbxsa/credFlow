const nomeinp = document.getElementById("nome");
const mailinp = document.getElementById("mail");
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senhainp = document.getElementById("senha");
const confirminp = document.getElementById("conf")
const form = document.getElementById("form")
let erronome = document.getElementById("erronome")
let erroemail = document.getElementById("erroemail")
let errosenha = document.getElementById("errosenha");
let erroconfirma = document.getElementById("erroconfirma")  
const submit = document.getElementById("submit")

form.addEventListener('submit' , (e) => {
    e.preventDefault();
    
    if(nomeinp.value == ""){
        erronome.textContent = "O nome não pode estar vazio"
        setError(nomeinp)
        return;
    }
    else{
        erronome.textContent = ""
    }

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

    if(confirminp.value != senhainp.value){
        erroconfirma.textContent = "As senhas devem ser compativeis"
    }

    else{
        erroconfirma.textContent = ""
    }   
}
)



