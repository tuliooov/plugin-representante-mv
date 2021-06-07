window.onload = function() {
	document.getElementById("verspan").innerHTML = chrome.runtime.getManifest().version;
	console.log('eventos definidos');
	if(document.getElementById('desconectar')  != null){
		document.getElementById('desconectar').addEventListener('click', logout());
	}
	if(document.getElementById('conectar') != null){
		document.getElementById('conectar').addEventListener('click', login());
	}
	
};

function login() {
	console.log('login');
	sessionStorage.setItem('chaveAcesso', '1212');
	document.getElementById('loginTxt').disabled = true;
	document.getElementById('senhaTxt').disabled = true;
	document.getElementById('conectar').style.display = 'none';
	document.getElementById('desconectar').style.display = 'block';
	window.href = window.href;
}

function logout() {
	console.log('logout');
	sessionStorage.setItem('chaveAcesso', null);
	document.getElementById('loginTxt').disabled = false;
	document.getElementById('senhaTxt').disabled = false;
	document.getElementById('conectar').style.display = 'block';
	document.getElementById('desconectar').style.display = 'none';
	window.href = window.href;
	
}

document.getElementById("buttonTodos").addEventListener("click",function(){
	chrome.runtime.sendMessage({
		type: "button_EnviarTodos", 
		mensagem: document.getElementById('mensagemParaEnviar')?.value, 
		imagem: document.getElementById('base64')?.value,
		quaisContato: 'chats',
		teste: document.querySelector('#teste').checked ? true : false,
		naoHoje: document.getElementById('naoHoje')?.value,
		quemVouMandar: document.getElementById('quemVouMandar')?.value,
		tempo: document.getElementById('tempo').value,
	});
});

// document.getElementById("buttonWhatsapp").addEventListener("click",function(){
// 	chrome.runtime.sendMessage({type: "button_openTabWhatsapp",value:1});
// });



if (window.File && window.FileReader && window.FileList && window.Blob) {
	document.getElementById('files').addEventListener('change', handleFileSelect, false);
  } else {
	
  }
  
  function handleFileSelect(evt) {
	var f = evt.target.files[0]; // FileList object
	var reader = new FileReader();
	// Closure to capture the file information.
	reader.onload = (function(theFile) {
	  return function(e) {
		var binaryData = e.target.result;
		//Converting Binary Data to base 64
		var base64String = window.btoa(binaryData);
		//showing file converted to base64
		var base = "data:image/jpeg;base64,"+base64String;
		document.getElementById('base64').value = base
		document.getElementById('imagemPronta').src = base
		// alert('File converted to base64 successfuly!\nCheck in Textarea');
	  };
	})(f);
	// Read in the image file as a data URL.
	reader.readAsBinaryString(f);
  }if (window.File && window.FileReader && window.FileList && window.Blob) {
	document.getElementById('files').addEventListener('change', handleFileSelect, false);
  } else {
	
  }
  
  function handleFileSelect(evt) {
	var f = evt.target.files[0]; // FileList object
	var reader = new FileReader();
	// Closure to capture the file information.
	reader.onload = (function(theFile) {
	  return function(e) {
		var binaryData = e.target.result;
		//Converting Binary Data to base 64
		var base64String = window.btoa(binaryData);
		//showing file converted to base64
		var base = "data:image/jpeg;base64,"+base64String;
		document.getElementById('base64').value = base
		document.getElementById('imagemPronta').src = base
		// alert('File converted to base64 successfuly!\nCheck in Textarea');
	  };
	})(f);
	// Read in the image file as a data URL.
	reader.readAsBinaryString(f);
  }
  