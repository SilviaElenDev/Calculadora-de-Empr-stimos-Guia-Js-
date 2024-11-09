 function calculate(){
    var amount = document.querySelector('#amount'); //valor do emprestimo;
    var apr = document.querySelector('#apr'); //juros anual;
    var years = document.querySelector('#years'); //tempo de reembolso
    var zipcode = document.querySelector('#zipcode'); //cep para localizar credores
    var payment = document.querySelector('#payment'); //pagamento mensal
    var total = document.querySelector('#total'); //pagamento total
    var totalinterest = document.querySelector('#totalinterest'); //total de juros 
    
    var principal = parseFloat(amount.value); //transforma valor do emprestimo em decimal
    var interest = parseFloat(apr.value) / 100 /12; //juros em decimal e mensal 
    var payments = parseFloat(years.value) * 12; //pagamento mensal 

    //Para calcular o valor mensal
    var x = Math.pow(1  + interest, payments);
    var monthly = (principal * x * interest) / (x-1); 

    //Se o valor for finito, a entrada estava correta então apresente os resultados
    // em seus devidos lugares e os arredonde em 2 casa decimais.

    if (isFinite(monthly)){ 
        payment.innerHTML = monthly.toFixed(2); 
        total.innerHTML = (monthly * payments).toFixed(2); 
        totalinterest.innerHTML = ((monthly*payments) - principal).toFixed(2);


        //Salva a entrada do usuario para proximo momento em que ele acessar o site
        save(amount.value, apr.value, years.value, zipcode.value);

        //Anuncio: localiza e exibe financeira locais, mas ignora erros de rede

        try{//Capututa quais que ocorram dentro dessas chaves
            getLenders(amount.value, apr.value, years.value, zipcode.value)
        }catch(e){} //Ignora os erros

        chart(principal, interest, monthly, payments); //Traça o grafico do saldo devedor, dos juros e do pagamento do capital

    } else {//Caso o valor não seja um numero ou seja infinito, todas as saidas ficam vazias
        payment.innerHTML = ''; 
        total.innerHTML = '';
        totalinterest.innerHTML = '';
        chart();//chart(), sem argumentos, apaga o grafico.
    }
};

//Salva a entrada do usuario como propriedades do objeto localStorage.

function save(amount, apr, years, zipcode){
    if(window.localStorage){ //Faz somente se o navegador suportar
        localStorage.loan_amount = amount;
        localStorage.loan_apr = apr;
        localStorage.loan_years = years;
        localStorage.loan_zipcode = zipcode;
    }
};

//Tenta restaurar os campos de entrada automaticamente quando o documento é carregado

window.onload = function(){
    if(window.localStorage && localStorage.loan_amount){ //Se o navegador suporta e temos dados, restaure-os;
        document.querySelector('#amount').value = localStorage.loan_amount;
        document.querySelector('#apr').value = localStorage.loan_apr;
        document.querySelector('#years').value = localStorage.loan_years;
        document.querySelector('#zipcode').value = localStorage.loan_zipcode;
    }
};

//Passa a entrada do usuario para um script no lado do servidor que teoricamente pode retornar.
//OBS: NÃO A IMPLEMENTAÇÃO REAL DESSE SERVIÇO (LOGO NÃO HÁ RETORNO)

function getLenders(amount, apr, years, zipcode){
    if(window.XMLHttpRequest) return; //Se o navegador não suportar não faça nada
    
    var ad = document.querySelector('#lenders');

    if(!ad) return;

    //Codifca a entrada do user como parametro de consulta em um Url
    var url = 'getLendrs.php' +
              '?amt=' + encodeURIComponent(amount) +
              '&apr=' + encodeURIComponent(apr) +
              '&yrs=' + encodeURIComponent(years) +
              '&zip=' + encodeURIComponent(zipcode);

    //Busca o o conteudo do Url criado usando um objeto XMLHTpRequest
    var req = new XMLHttpRequest(); //Inicia um novo pedido
    req.open('GET',url);            //Pedido GET da HTTP para o Url
    req.send(null);                 //Envia o pedido sem corpo
};