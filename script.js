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

    //Busca o conteudo do Url criado usando um objeto XMLHTpRequest
    var req = new XMLHttpRequest(); //Inicia um novo pedido
    req.open('GET',url);            //Pedido GET da HTTP para o Url
    req.send(null);                 //Envia o pedido sem corpo.


    //
    req.onreadystatechange = function(){  //Propriedade que aceita uma função de callback que sera chamada sempre que o estado da requisição mudar.
        if (req.readyState == 4 && req.status == 200){ // 'readyState' Indica o estado da requisição (no caso mais expecificamento veridica se a requisição foi concluida.)
                                                       // 'status' é o codigo HTTP da resposta 200 = Requisição bem sucedida
            var response = req.responseText; //Texto da resposta do servidor
            var lenders = JSON.parse(response); // Converte a string JSON da resposta em um obj JS.
        
            var list = '';
            for(var i = 0; i < lenders.length; i++){
            list += "<li><a href='" + lenders[i].url + "'>" +
            lenders[i].name + "</a>";
            }

            ad.innerHTML = "<ul>" + list + "</ul>";
        
        }
    }
}


function chart(principal, interest, monthly, payments){
    var graph = document.querySelector('#graph');
    graph.width = graph.width;

    if(arguments.length == 0 || !graph.getContext) return;

    var g = graph.getContext('2d');
    var width = graph.width, height = graph.height;

    function paymentToX (n) {return n * width/payments;}
    function amountToY (a) {return height - (a * height/(monthly*payments*1.05));}

    g.moveTo(paymentToX(0), amountToY(0));
    g.lineTo(paymentToX(payments),
             amountToY(monthly*payments));
    g.lineTo(paymentToX(payments), amountToY(0));

    g.closePath();
    g.fillStyle = '#f88';
    g.fill();
    g.font = 'bold 12ppx sans-serif';
    g.fillText('Total Interest Payments', 20, 20);

    var equity = 0;
    g.beginPath();
    g.moveTo(paymentToX(0), amountToY(0));

    for(var p = 1; p <= payments; p++){
        var thisMonthsInterst = (principal-equity)*interest;
        equity += (monthly - thisMonthsInterest);
        g.lineTo(paymentToX(p),amountToY(equity));
    }

    g.lineTo(paymentToX(payments), amountToY(0));
    g.closePath();
    g.fillStyle = "green";
    g.fill();
    g.fillText("Total Equity", 20,35);

    var bal = principal;
    g.beginPath();
    g.moveTo(paymentToX(0),amountToY(bal));
    for(var p = 1; p <= payments; p++) {
        var thisMonthsInterest = bal*interest;
        bal -= (monthly - thisMonthsInterest);
        g.lineTo(paymentToX(p),amountToY(bal));
    }
    
    g.lineWidth = 3;
    g.stronke();
    g.fillStyle = 'black';
    g.fillText("Loan Balance",20,50);

    g.TextAlign = "center";

    var y = amountToY(0);
    for(var year=1; year*12 <=payments; year++){
        var x = paymentToX(year * 12);
        g.fillRect(x-0.5,y-3,1,3);

        if(year ==1) g.fillText('Year',x,y-5);

        if(year % 5 == 0 && year*12 !== payments)
            g.fillText(String(year), x, y-5);
    }

    g.TextAlign = "right";
    g.textBaseline = "middle";
    var ticks = [monthly*payments, principal];
    var rightEdge = paymentToX(payments); 
    for(var i = 0; i < ticks.length; i++) { 
        var y = amountToY(ticks[i]); 
        g.fillRect(rightEdge-3, y-0.5, 3,1); 
        g.fillText(String(ticks[i].toFixed(0)), 
        rightEdge-5, y);
    }
}
