

var numeroJanela = -1;
var whatsapp_tab_id = -1;
var telefones_permitidos = []

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
});


function inicializarTabs() {
	whatsapp_tab_id = -1;
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

	if (~details.url.indexOf("https://web.whatsapp.com/")) {
		console.log("Abriu a página web.whatsapp.com");	
		whatsapp_tab_id = details.tabId;
		chrome.tabs.executeScript(details.tabId, {file: "js/content.js"});
	}

	
});


function clientMessage(data, funcPre = () => {}) {
	funcPre()
	chrome.tabs.sendMessage(whatsapp_tab_id, data);
}

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
	var json = {"tipo" : "text", "numeroCelular" : remetente, "mensagem" : mensagem};
	clientMessage(json);
}

function init() {
	if (localStorage.getItem('pause')) {
		pause()
	} else{
		start()
		setTimeout(sendWaitMessage,5000);
	}
}

function sendWaitMessage() {
	clientMessage({tipo : "aguardarmensagem"});
}

function start() {
	clientMessage({tipo : "logado"}, () => localStorage.removeItem('pause'));
}

function pause() {
	clientMessage({tipo : "pausado"}, () => localStorage.setItem('pause', true));
}

function logout() {
}



function abrirAbaWhatsapp(){
	whatsapp_tab_id = -1;
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
				chrome.tabs.create({ url: 'https://web.whatsapp.com/', index : 1}, function(abaId) {whatsapp_tab_id = abaId;});		
			} else {
				chrome.tabs.get(whatsapp_tab_id, function(tab) {
					chrome.tabs.highlight({'tabs': tab.index}, function() {});
				})
			}

		});
	});
}




