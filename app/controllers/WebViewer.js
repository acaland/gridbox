var url = arguments[0].url;
Ti.API.info("url:" + url);

var net = require('net');

$.pbar.show();
var xhr = Ti.Network.createHTTPClient({
	timeout : 3000,
	autoRedirect : false
});
xhr.onload = function() {
	Ti.API.info("redirect found");
	Ti.API.info(xhr.location);

	var redirectUrl = xhr.getResponseHeader("Location");
	Ti.API.info("redirect URL: " + redirectUrl);

	var urlTokens = url.split("/");
	Ti.API.info("url_tokenized:" + JSON.stringify(urlTokens));
	var filename = urlTokens[urlTokens.length - 1];

	if (redirectUrl) {
		//$.pbar.show();
		download(redirectUrl, filename);
	} else {
		$.pbar.hide();
		$.wv.show();
		$.wv.data = xhr.responseData;
	}
};

xhr.ondatastream = function(e) {
	Ti.API.info(e.progress);
	$.pbar.value = e.progress;
};

xhr.onerror = function(e) {
	Ti.API.info(JSON.stringify(e));
	Ti.API.info(xhr.responseText);
	Ti.API.info(xhr.location);
	//Ti.API.info(xhr.responseData);
	alert(e);
}

xhr.open('GET', url);
Ti.API.info("URL : " + url);
//Ti.API.info("cookie : " + net.shibCookie);
xhr.setRequestHeader("Cookie", net.shibCookie);
xhr.send();

function download(url, filename) {
	var xhr = Ti.Network.createHTTPClient({
		timeout : 3000
	});
	xhr.onload = function() {

		Ti.API.info("filename:" + filename);

		var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
		//Ti.API.info(Ti.Filesystem.applicationDataDirectory);
		f.write(this.responseData);
		$.pbar.hide();
		Ti.API.info(Ti.Filesystem.applicationDataDirectory + filename);
		$.wv.show();
		$.wv.url = Ti.Filesystem.applicationDataDirectory + filename;

	};

	xhr.ondatastream = function(e) {
		Ti.API.info(e.progress);
		$.pbar.value = e.progress;
	};

	xhr.onerror = function(e) {
		Ti.API.info(JSON.stringify(e));
		Ti.API.info(xhr.responseText);
		Ti.API.info(xhr.location);
		//Ti.API.info(xhr.responseData);
		alert(e);
	}

	xhr.open('GET', url);
	Ti.API.info("URL : " + url);
	//Ti.API.info("cookie : " + net.shibCookie);
	//xhr.setRequestHeader("Cookie", net.shibCookie);
	xhr.send();
}

//$.wv.evalJS("document.cookie='" + net.shibCookie + "';");
//$.wv.url = url;

function shareLink() {
	$.shareDialog.show();
}

function chooseLink(e) {
	if (e.index == 0) {

		var emailDialog = Ti.UI.createEmailDialog()
		emailDialog.subject = "Public link: " + $.WebViewer.title;
		emailDialog.html = true;
		//emailDialog.toRecipients = ['foo@yahoo.com'];
		var purl = "http://glibrary.ct.infn.it/dm/vo.indicate-project.eu/infn-se-03.ct.pi2s2.it/dpm/ct.pi2s2.it/home/vo.indicate-project.eu/glibrary/" + $.WebViewer.title;
		emailDialog.messageBody = 'Download your file at <a href="' + purl +'">' + purl + '</a>';
		emailDialog.open();
	} else if (e.index == 1) {
		var emailDialog = Ti.UI.createEmailDialog()
		emailDialog.subject = "Shibboleth protected file: " + $.WebViewer.title;
		emailDialog.html = true;
		//emailDialog.toRecipients = ['foo@yahoo.com'];
		emailDialog.messageBody = 'Download your file at <a href="' + url +'">' + url + '</a>';
		emailDialog.open();
	}
}

