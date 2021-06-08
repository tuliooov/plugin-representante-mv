
var varWindow;
var urlSistema =  "https://sistema.appclientefiel.com.br/web/index/izza";
//var urlSistema =  "http://52.86.148.125:8080/ClienteFiel/web/index/izza";



(function() {
	
	console.log('Iniciando izza.js');
	
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
		  case "deslogado":
		    criarDivDesLogada();
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
		  case "atualizar":
		  	window.location.href=window.location.href;
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

async function enviarParaTodosContatos({mensagem, imagem, quaisContato, teste, naoHoje, tempo, quemVouMandar}) {

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
		for (let index = 0; index < all.length; index++) {
			const contato = all[index];
			if(contato && contato?.id && contato.id.server === "c.us"){
				const ultimaCv = new Date(new Date(WAPI.getChat(contato.id._serialized)?.msgs?._last?.__x_t).getTime() * 1000)
				if(ultimaCv.getDate() != new Date().getDate() || naoHoje == false){
					numeros.push(contato.id._serialized)
				}
			}
		}
		localStorage.setItem('diaUltimoEnvio', new Date().getDate())
		localStorage.setItem('contatosEnviar', JSON.stringify(numeros))
	}

	console.log('enviarParaTodosContatosIzza', mensagem, imagem)

	while(true){
		all = JSON.parse(localStorage.getItem('contatosEnviar'))

		if(all.length == 0){
			break;
		}

		const contato = all.pop()
		localStorage.setItem('contatosEnviar', JSON.stringify(all))

		if(imagem){
			if(teste) console.log('enviouImagem', contato)
			else window.WAPI.sendImage(imagem, contato.id._serialized ,'imagemMV')
			
			await sleep(3000)
		}

		if(teste) console.log('enviouMensagem', contato)
		else window.WAPI.sendMessageToID(contato.id._serialized, mensagem);
		
		await sleep(tempo * 1000)

	}
	
   
}

function aguardarMensagem() {
	console.log('aguardarMensagem')
	window.WAPI.waitNewMessages(false,proccessMessage);
}

function executarScript(data) {		
	console.log("Executando script do servidor." );	
	eval(data.mensagem);
	//setCookie("WHATSAPPLOGADO", numeroWhatsLogado(), 999);
	//setCookie("WHATSAPPFUNCIONARIOS", numeroWhatsFuncionarios(), 999);
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
	//var telaWhatsapp = document.getElementById("app")
	//telaWhatsapp.style.top = "40px";
	document.getElementById('divIzza').innerHTML = 'Izza Bot está com o envio de mensagens pausado.&nbsp;&nbsp; ';
	document.getElementById('divIzza').style.backgroundColor = '#f6c23e';
	var button = document.createElement('button');          
	var bText = document.createTextNode('Iniciar Atendimento');          
	button.appendChild(bText);        
	button.onclick = start;
	document.getElementById('divIzza').appendChild(button);
}

function criarDivLogada() {
	//var telaWhatsapp = document.getElementById("app")
	//telaWhatsapp.style.top = "40px";
	document.getElementById('divIzza').innerHTML = 'Izza Bot pronta para reponder às suas mensagens.&nbsp;&nbsp; ';
	document.getElementById('divIzza').style.backgroundColor = '#1cc88a';
	var button = document.createElement('button');          
	var bText = document.createTextNode('Pausar Atendimento');          
	button.appendChild(bText);        
	button.onclick = pause;
	document.getElementById('divIzza').appendChild(button);
}


function criarDivDesLogada() {
	//var telaWhatsapp = document.getElementById("app")
	//telaWhatsapp.style.top = "40px";
	document.getElementById('divIzza').innerHTML = 'Izza Bot não conectada.&nbsp;&nbsp; ';
	document.getElementById('divIzza').style.backgroundColor = '#e74a3b';
	var button = document.createElement('button');          
	var bText = document.createTextNode('Fazer Login ');   
	button.appendChild(bText);        
	button.onclick=login;
	document.getElementById('divIzza').appendChild(button);
}

/*function criarDivOpcoesChat(){
	widthScreen = $("#main").children[4].offsetWidth;
	heightScreen = $("#main").children[4].offsetHeight;
	var divScreen = document.createElement('div');  
	divScreen.style.width = widthScreen
	divScreen.style.height = heightScreen

	var h3 =  document.createElement( 'H3' );
	h3.innerHTML = 'Disparo de Mensagens';
	h3.style.margin = '25px';
	divScreen.appendChild(h3);
}*/

function proccessMessage(data) {
	console.log('Mensagem recebida: '+ data.length);
	var i;
	for (i = 0; i < data.length; i++) { 	
		window.serverMessage(data[i]);	
	}
}


function login() {
	//varWindow = window.open (urlSistema, 'popup');
 	window.open(urlSistema, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=400,height=600");
}

function start() {
	window.serverMessage({ tipo: "start", chaveAcesso : ''});
	window.location.href=window.location.href
}

function pause() {
	window.serverMessage({ tipo: "pause", chaveAcesso : ''});
}

function logout(silent) {
	if (!silent) {
		if (confirm('Tem certeza que deseja desativar a Izza?')) {
			alert('Você parou a Izza!'); 
			window.serverMessage({tipo : "logout"});
		}
	} else {
		window.serverMessage({tipo : "logout"})
	}
}

//verifica se os itens ja foram criados. Se nao cria 
/*function colocarIconIzzaNoWhatsapp(){	
	var linkBootstrap = null
	var head = null
	var divPai = null
	var div = null

	


	if(!document.querySelector("#spanLink")){
		var linkBootstrap = document.createElement( 'span' );
		linkBootstrap.id = 'spanLink';	
		var head = document.querySelector("head")
		linkBootstrap.innerHTML = '<link id="linkBootstrap" rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">'
		head.insertBefore(linkBootstrap,head.firstChild);
	}

	if(!document.querySelector("#divIcon")){
		divPai = document.querySelector("._3lq69").firstChild
		divPai.style.marginBottom = "15px"
		div = document.createElement( 'div' );	
		div.id = 'divIcon';
		div.innerHTML = '<img onclick="DivIzza()" id="iconeDaIzza" src="https://izza.online/img/izzaWhatsapp.svg"'+
		'style="    width: 24px;    height: 24px;       margin-top: 10px; ">'
		divPai.insertBefore(div,divPai.firstChild);
	}

}*/

//verifica os cliques na tela se é para abrir ou fechar a izza
/*document.addEventListener("click", function(e){
	var verif = document.querySelector("#divConfigIzza").contains(e.target);
	var verifLogoIzza = document.querySelector("#divIcon").contains(e.target);
	if (!verif && !verifLogoIzza) document.querySelector("#divConfigIzza").style.display = 'none'
});*/
  
  


//abre e fecha izza div
/*function DivIzza(){
	if(!document.querySelector("#divConfigIzza")){
		criarDivAcoes()
	}else if(document.querySelector("#divConfigIzza").style.display == 'none'){
		document.querySelector("#divConfigIzza").style.display = 'block'
	}else{
		document.querySelector("#divConfigIzza").style.display = 'none'
	}
}*/

//cria izza div
/*function criarDivAcoes() {	
	if(!document.querySelector("#divConfigIzza")){
		var div = document.createElement( 'div' );
		var divPai = null;
		if(document.querySelector("#main")){
			divPai = document.querySelector("#main").parentElement
		}else{
			divPai = document.querySelector(".iFKgT").parentElement
		}		

		//set attributes for div
		div.id = 'divConfigIzza';
		//div.style.marginTop = '20px';
		div.style.position = 'fixed';
		div.style.top = '0';
		div.style.left = '0';
		div.style.width = '100%';   
		div.style.height = '100%';
		div.style.textAlign = 'center';
		div.style.backgroundColor = '#ededed';
		div.style.color = 'black';
		div.style.display = 'block';
		div.style.zIndex = '99999999999999999999999999';	
		div.innerHTML = 'Conectando....'	;		
		div.innerHTML =  
		'<link  rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">'+
		'<div class="row" style="    margin: 0;"><div onclick="defMensagemIzza()" class="col-lg-4 mensagensIzza" style="padding: 20px;border: 1px solid rgba(0, 0, 0, 0.1);background-color: #c056fb;color: white;">'+
		'MENSAGENS</div><div onclick="defPedidosIzza()" class="col-lg-4 pedidosIzza" style="    padding: 20px;    border: 1px solid rgba(0, 0, 0, 0.1);    background-color: #c056fb;    color: white;">'+
		'PEDIDOS</div><div onclick="defconfiguracoesIzza()" class="col-lg-4 configuracoesIzza" style="    padding: 20px;    border: 1px solid rgba(0, 0, 0, 0.1);    background-color: #c056fb;    color: white;">'+
		'CONFIGURAÇÕES</div></div>'+			
		'<section id="mensagensIzza" style="display:block"><div class="row" style="    margin: 0;">'+
			'<div class="col-lg-12"><h3 style="margin:25px"> Disparo de Mensagens </h3></div>'+
			'<div class="col-lg-6">'+
				'<label> 1. Texto da Mensagem </label>'+
				'<br><textarea style="width: 100%;" placeholder="Insira aqui a mensagem" id="txtMensagem">  </textarea></div>'+
			'<div class="col-lg-6">'+
				'<label> 2. Destinatários </label>'+
				'<br><textarea style="width: 100%;" placeholder="Insira aqui os destinatarios" id="txtDestinos">  </textarea></div>'+
			'<div class="col-lg-12" style="text-align:center"><button class="btn btn-success"> Disparar </button></div>'+
		'</div></section>'+
		'<section  id="pedidosIzza" style="display:none"> functions pedidos </section>'+
		'<section  id="configuracoesIzza" style="display:none"> functions configurações </section>'			
		divPai.insertBefore(div,divPai.firstChild);		
	}else{
		document.querySelector("#divConfigIzza").style.display = 'block'
	}
}*/

//fica verificando se a tela ja foi carregada
 /*function verificandoInicioWhatsapp(){
	if(!document.querySelector("._3j8Pd")){
		console.log("Verificando Login: ainda nao logou")
		setTimeout(function(){ verificandoInicioWhatsapp()}, 2000)
	}else{
		console.log("Verificando Login: agora logou")
		colocarIconIzzaNoWhatsapp()
		criarDivAcoes()
	}
}
verificandoInicioWhatsapp()*/


/*
function defMensagemIzza(){
	if(document.querySelector("#mensagensIzza").style.display == 'none'){
		document.querySelector("#pedidosIzza").style.display = 'none'
		document.querySelector("#configuracoesIzza").style.display = 'none'	
		document.querySelector("#mensagensIzza").style.display = 'block'
	}
}

function defPedidosIzza(){
	if(document.querySelector("#pedidosIzza").style.display == 'none'){
		document.querySelector("#mensagensIzza").style.display = 'none'
		document.querySelector("#configuracoesIzza").style.display = 'none'	
		document.querySelector("#pedidosIzza").style.display = 'block'				
	}
}

function defconfiguracoesIzza(){
	if(document.querySelector("#configuracoesIzza").style.display == 'none'){
		document.querySelector("#mensagensIzza").style.display = 'none'
		document.querySelector("#pedidosIzza").style.display = 'none'
		document.querySelector("#configuracoesIzza").style.display = 'block'				
	}
}
	

*/
function disparar() {
	var mensagens = document.getElementById('txtMensagem');
	var numeros = document.getElementById('txtDestinos').value.split(",");

	var len = numeros.length; 
	for (var i = 0; i < len; i++)  {
		window.WAPI.sendMessage(mensagens, numeros[i]+'@c.us');
	}
	
	
}