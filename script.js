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
        try{
            getLenders(amount.value, apr.value, yeats.value, zipcode.value)
        }catch(e){
            chart(principal, interest, monthly, payments);
        }
        
    }else{
        payment.innerHTML = '';
        total.innerHTML = '';
        totalinterest.innerHTML = '';
        chart();
    }
}