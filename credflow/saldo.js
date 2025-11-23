const totalatual = document.getElementById("total")
totalatual.innerText = 'R$ 0,00';

let total = 0;

totalatual.classList.remove("valor", "valorsai");




const valoritem = document.getElementById("valorent")
const nome = document.getElementById("nomeent")
const listaitens = document.getElementById("listaitens")

const BotaoEntrada = document.getElementById("confirm")


let valorEntrada = 0;

const entrada = document.getElementById('entrada')
entrada.innerText = 'R$ 0,00';


BotaoEntrada.addEventListener("click", (evento) => {
    evento.preventDefault();
    
    if(valoritem.value == ""){
        window.alert("digite o valor")
        return
    }
    
    else if(nome.value == ""){
        window.alert("digite o nome")
        return
    }
    
    
    
    let itemvr = Number(valoritem.value);
    let valorformatado = itemvr.toLocaleString("pt-BR", {style: "currency",currency: "BRL"});
    
    valorEntrada += itemvr;
    
    valorEntradaNum = Number(valorEntrada)
    valorEntradaFormatado = valorEntradaNum.toLocaleString("pt-BR", {style: "currency",currency: "BRL"});
    
    total+= valorEntrada;
    totalatual.innerText = total.toLocaleString("pt-BR", {style: "currency",currency: "BRL"});
    
    entrada.innerText = valorEntradaFormatado
    
    const itemlista = document.createElement("li")
    const valor = document.createElement("div")
    const itemnome = document.createElement("h3")
    const itemvalor = document.createElement("h3")
    
    itemlista.classList.add("itemlista")
    valor.classList.add("valor")
    itemnome.classList.add("itemnome")
    itemvalor.classList.add("itemvalor")
    
    
    itemnome.innerText = nome.value
    itemvalor.innerText = ('+' + valorformatado);
    
    valor.appendChild(itemnome)
    valor.appendChild(itemvalor)
    
    itemlista.appendChild(valor)
    
    listaitens.appendChild(itemlista)
    
})


// Saida


const valorsai = document.getElementById("valorsaid")
const nomesai = document.getElementById("nomesaid")

const BotaoSaida = document.getElementById("confirmsaid")

let valorSaida=0;

const saida = document.getElementById('saida')
saida.innerText = 'R$ 0,00';

BotaoSaida.addEventListener("click", (evento2) =>{
    evento2.preventDefault
    
    
    if(valorsai.value == ""){
        window.alert("digite o valor")
        return
    }
    
    else if(nomesai.value == ""){
        window.alert("digite o nome")
        return
    }
    
    let itemsai = Number(valorsai.value);
    let valorformatadosai = itemsai.toLocaleString("pt-BR", {style: "currency",currency: "BRL"});
    
    valorSaida += itemsai;
    
    valorSaidaNum = Number(valorSaida)
    valorSaidaFormatado = valorSaidaNum.toLocaleString("pt-BR", {style: "currency",currency: "BRL"});
    
    saida.innerText = valorSaidaFormatado
    
    total-= valorSaida;
    totalatual.innerText = total.toLocaleString("pt-BR", {style: "currency",currency: "BRL"});
    
    const itemlista = document.createElement("li")
    const valor = document.createElement("div")
    const itemnome = document.createElement("h3")
    const itemvalor = document.createElement("h3")
    
    itemlista.classList.add("itemlistasai")
    valor.classList.add("valorsai")
    itemnome.classList.add("itemnomesai")
    itemvalor.classList.add("itemvalorsai")
    
    itemnome.innerText = nomesai.value;
    itemvalor.innerText = ('-' + valorformatadosai);
    
    valor.appendChild(itemnome)
    valor.appendChild(itemvalor)
    
    itemlista.appendChild(valor)
    
    listaitens.appendChild(itemlista)
})


if (total >= 0) totalatual.classList.add("valor");
else{ totalatual.classList.add("valorsai")};


