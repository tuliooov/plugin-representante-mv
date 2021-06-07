/*
This variable is responsible for keeping track of the active WhatsApp tab.
It is updated once the tab communicates with the background page (sends a type:start request)
*/

var dateNow = new Date;
var numeroJanela = -1;
var whatsapp_tab_id = -1;
var pedidos_aba_id = -1;
var chaveAutenticacao;
let tempo_envio_mensagem_local = 10;


//quando inicia ele busca informações importantes
//1° qual numero do whatsapp logado
//2° quais os numeros de funcionarios da cliente fiel
var izza = false
var alertados_ForaDoHorario = [];
var alertados_BoasVindas = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log("\n\n\n------------------------------------inicio-----------------------------------------------")

	switch(request.type){
		case "button_EnviarTodos":
			enviarParaTodosContatos(request);
			break;
		case "button_openTabWhatsapp":
			abrirAbaWhatsapp();
			break;
	}
});




chrome.runtime.onStartup.addListener(function () {
	console.log("Plugin Startup");			

});

chrome.runtime.onInstalled.addListener(function () {
	console.log("Plugin instalado");
	 inicializarTabs();
	//setTimeout(inicializarTabs, 5000);
});


function inicializarTabs() {
	whatsapp_tab_id = -1;
	pedidos_aba_id = -1;
	numeroJanela = -1;
	var abas = new Array();

	chrome.windows.getCurrent(function(win) {
    	chrome.tabs.getAllInWindow(win.id, function(tabs) {
	        abas = tabs;
			console.debug(abas);

			var i;
			for (i = 0; i < abas.length; i++) {
				var aba = abas[i];
			    if (~aba.url.indexOf("web.whatsapp.com")) {
			    	whatsapp_tab_id = aba.id;
			    }
		  	}

		  	

			if (whatsapp_tab_id == -1) {
				chrome.tabs.create({ url: 'https://web.whatsapp.com/', index : 1});
			} else {
				chrome.tabs.update(whatsapp_tab_id,{url:"https://web.whatsapp.com"});
			}

		});
	});
}
 

chrome.webNavigation.onCompleted.addListener(function(details) {

	/*Adiciona os scripts na página do whatsapp*/
	if (~details.url.indexOf("https://web.whatsapp.com/")) {
		console.log("Abriu a página web.whatsapp.com");	
		whatsapp_tab_id = details.tabId;
		chrome.tabs.executeScript(details.tabId, {file: "js/content.js"});
	}

	if (~details.url.indexOf("pedidosfornecedor")) {
		console.log("Abriu a página de recebimento dos pedidos");	
		pedidos_aba_id = details.tabId;
	}

	

	
});


function clientMessage(data) {
	//console.log("clientMessage: ", JSON.stringify(data));
	chrome.tabs.sendMessage(whatsapp_tab_id, data);
}

/*
Listening to messages from the content script (webpage -> content script -> *backgrund page* -> host)
*/
chrome.runtime.onMessage.addListener(function(data, sender) {
	
	if (sender.tab) {
		
		switch(data.tipo) {
		  case "init":
		    console.log('Init recebido da página do whatsapp');
		    init();
		    break;
		  case "logout":
		    console.log('Logout recebido da página do whatsapp');
		    logout();
		    break;
		  case "start":
		  	console.log('Start recebido da página do whatsapp');
		    start();
		    break;
		  case "pause":
		    console.log('Pause recebido da página do whatsapp');
		    pause();
		    break;
		  default:
		}
	}
});

function isLoggedActive() {
	return localStorage.getItem('chaveAcesso') != null && localStorage.getItem('pause') == null;
}

function isLogged() {
	return localStorage.getItem('chaveAcesso') != null;
}


function cheksIsNotNull(obj) {
  return obj !== null && obj !== undefined
}

function enviarParaTodosContatos(data){
	const {mensagem, imagem} = data
	data.tipo = 'enviarParaTodosContatos'
	console.log('enviarParaTodosContatosBackground', mensagem, imagem)
	clientMessage(data);
}

function sendMessage(mensagem, remetente){
	//var json = {"tipo" : "text", "numeroCelular" : "5531973306335@c.us", "mensagem" : mensagem};console.log('Teste13');
	var json = {"tipo" : "text", "numeroCelular" : remetente, "mensagem" : mensagem};
	clientMessage(json);
}

function init() {
	if (localStorage.getItem('pause') == null) {
		clientMessage({tipo : "logado"});
		setTimeout(sendWaitMessage,5000);
	} else if (localStorage.getItem('pause') != null) {
		clientMessage({tipo : "pausado"});	
	} else {
		clientMessage({tipo : "deslogado"});
		waitLogin();
	}
}

function sendWaitMessage() {
	clientMessage({tipo : "aguardarmensagem"});
}


function waitLogin() {
	console.log("Aguardando login");
	
	try {
		getCookieIZZA();
		if (localStorage.getItem('chaveAcesso') != null) {
			console.log("Logado, atualizando tela.");
			clientMessage({tipo : "atualizar"});	
			return true;
		}
	}  catch(e) {
		console.log(e);
	}

	setTimeout(waitLogin,3000);
}

function start() {
	localStorage.removeItem('pause');
	clientMessage({tipo : "logado"});
}

function pause() {
	localStorage.setItem('pause', true);
	clientMessage({tipo : "pausado"});
}

function logout() {
	localStorage.removeItem('chaveAcesso');
	localStorage.removeItem("lastMessage");
	clientMessage({tipo : "deslogado"});
	waitLogin();
}



function getNewMessages() {
	try {
		if (isLoggedActive()) {
			console.log("Buscando Mensagens");	
		}
	} catch(e) {
		console.log(e);
	}
	//limparSaveMessage();
	setTimeout(getNewMessages, 5000);
}


function abrirAbaWhatsapp(){
	whatsapp_tab_id = -1;
	var abas = new Array();

	//Se estiver com o whatsapp pausado não abre a tela 
	if(!isLoggedActive()) {
		return;
	}

	chrome.windows.getCurrent(function(win) {
    	chrome.tabs.getAllInWindow(win.id, function(tabs) {
	        abas = tabs;
			console.debug(abas);
			var i;
			for (i = 0; i < abas.length; i++) {
				var aba = abas[i];
			    if (~aba.url.indexOf("web.whatsapp.com")) {
			    	whatsapp_tab_id = aba.id;
			    }
			  }
		  	if (whatsapp_tab_id == -1) {
				chrome.tabs.create({ url: 'https://web.whatsapp.com/', index : 1}, function(abaId) {whatsapp_tab_id = abaId;});		
			} else {
				chrome.tabs.get(whatsapp_tab_id, function(tab) {
					chrome.tabs.highlight({'tabs': tab.index}, function() {});
				})
			}

		});
	});
}




(function() {
	getNewMessages();
})();

