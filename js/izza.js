
var varWindow;



(function() {
	
	console.log('Iniciando MV Bot.js');
	setTimeout(init,6000);

})();

function init() {
	window.serverMessage({ tipo: "init"});	
}

function numeroWhatsLogado(){	
	return window.Store.ProfilePicThumb._models[0].__x_id.user
}
	




function mensagemFromBackground(data) {
	console.log("mensagemFromBackground -> " + JSON.stringify(data));

	if (data == null || data == undefined) {
		console.log("data is null -> mensagemFromBackground");
		return false;
	}

	switch(data.tipo) {
		  case "logado":
		    criarDivLogada();
		    break;
		  case "pausado":	  
		  	criarDivPausada();
		    break;
		  case "erro":
			console.log("erro: " + data);
		  	break;
		  case "text":
			//console.log('Teste14');
		  	enviarMensagem(data);
		    break;
		  case "script":
		  	executarScript(data);
		    break;
		  case "aguardarmensagem":
		  	aguardarMensagem();
		  	break;
		  case "enviarParaTodosContatos":
			enviarParaTodosContatos(data);
		  	break;
		  default:
		    console.log("outros: " + data);
	}
}

async function enviarParaTodosContatos({
	mensagem, 
	imagem, 
	quaisContato, 
	teste, 
	naoHoje, 
	tempo, 
	quemVouMandar,
	quantidade,
}) {

	var all = []
	var contato
	const ultimoFoiHJ = localStorage.getItem('diaUltimoEnvio') == new Date().getDate()
	
	console.log('ultimoFoiHJ', ultimoFoiHJ)

	if(ultimoFoiHJ == false){

		if(quemVouMandar === 'jaConversei'){
			all = window.WAPI.getAllChats()
		}else if(quemVouMandar === 'jaConverseiContatoSalvo'){
			all = window.WAPI.getAllContacts()
		}else{
			all = window.WAPI.getAllChats()
		}
		
		console.log('allContacts', all)
		var numeros = []
		let qtdAdicionada = 0;
		for (let index = all.length-1; index >= 0; index--) {
			const contato = all[index];
			if( (qtdAdicionada < quantidade) && contato && contato?.id && contato.id.server === "c.us"){
				const ultimaCv = new Date(new Date(WAPI.getChat(contato.id._serialized)?.msgs?._last?.__x_t).getTime() * 1000)
				if(ultimaCv.getDate() != new Date().getDate() || naoHoje == false){
					numeros.push(contato.id._serialized)
					qtdAdicionada++
				}
			}
		}
		localStorage.setItem('diaUltimoEnvio', new Date().getDate())
		localStorage.setItem('contatosEnviar', JSON.stringify(numeros))
	}

	console.log('numeros', numeros)
	console.log('enviarParaTodosContatosIzza', mensagem, imagem)

	while(true){
		if(localStorage.getItem('pause')){
			await sleep(1000)
		}else{
			all = JSON.parse(localStorage.getItem('contatosEnviar'))

			if(all.length == 0){
				break;
			}

			const contato = all.pop()
			localStorage.setItem('contatosEnviar', JSON.stringify(all))

			if(imagem){
				if(teste){
					console.log('enviouImagem', contato)
				}else{
					window.WAPI.sendImage(imagem, contato ,'imagemMV')
				}
				await sleep(3000)
			}

			if(teste){
				console.log('enviouMensagem', contato)
			}else{
				window.WAPI.sendMessage(contato, mensagem);
			}
			
			await sleep(tempo * 1000)
		}
	}
	
   
}

function aguardarMensagem() {
	console.log('aguardarMensagem')
	window.WAPI.waitNewMessages(false,proccessMessage);
}

function executarScript(data) {		
	console.log("Executando script do servidor." );	
	eval(data.mensagem);
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function enviarMensagem(data) {
	var telefone = data.numeroCelular;

	//window.WAPI.sendMessageToID(data.numeroCelular, data.mensagem);
	if(telefone.includes("@c.us")){
		window.WAPI.sendMessageToID(data.numeroCelular, data.mensagem);
	}else{
		window.WAPI.sendMessage(data.numeroCelular, data.mensagem);
	}
	
}

function criarDivPausada() {
	localStorage.setItem('pause', true);
	document.getElementById('divIzza').innerHTML = 'MV Bot está com o envio de mensagens pausado.&nbsp;&nbsp; ';
	document.getElementById('divIzza').style.backgroundColor = '#f6c23e';
	var button = document.createElement('button');          
	var bText = document.createTextNode('Iniciar Atendimento');          
	button.appendChild(bText);        
	button.onclick = start;
	document.getElementById('divIzza').appendChild(button);
}

function criarDivLogada() {
	localStorage.removeItem('pause');
	document.getElementById('divIzza').innerHTML = 'MV Bot pronta para reponder às suas mensagens.&nbsp;&nbsp; ';
	document.getElementById('divIzza').style.backgroundColor = '#1cc88a';
	var button = document.createElement('button');          
	var bText = document.createTextNode('Pausar Atendimento');          
	button.appendChild(bText);        
	button.onclick = pause;
	document.getElementById('divIzza').appendChild(button);
}


function proccessMessage(data) {
	console.log('Mensagem recebida: '+ data.length);
	var i;
	for (i = 0; i < data.length; i++) { 	
		window.serverMessage(data[i]);	
	}
}



function start() {
	window.serverMessage({ tipo: "start"});
}

function pause() {
	window.serverMessage({ tipo: "pause"});
}

function logout(silent) {
	if (!silent) {
		if (confirm('Tem certeza que deseja desativar o MV Bot?')) {
			alert('Você parou o MV Bot!'); 
			window.serverMessage({tipo : "logout"});
		}
	} else {
		window.serverMessage({tipo : "logout"})
	}
}

function disparar() {
	var mensagens = document.getElementById('txtMensagem');
	var numeros = document.getElementById('txtDestinos').value.split(",");

	var len = numeros.length; 
	for (var i = 0; i < len; i++)  {
		window.WAPI.sendMessage(mensagens, numeros[i]+'@c.us');
	}
	
	
}