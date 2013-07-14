var replicas = arguments[0];

$.mapview.setRegion({
	latitude: replicas[0].lat,
	longitude: replicas[0].lng,
	latitudeDelta: 12,
	longitudeDelta: 12
});

for (var i = 0; i < replicas.length; i++) {
	var ann = Titanium.Map.createAnnotation({
		latitude : replicas[i].lat,
		longitude : replicas[i].lng,
		title : replicas[i].name,
		pincolor : Titanium.Map.ANNOTATION_RED,
		animate : true,
		leftButton : '/storage.png'
	});

	if (replicas[i].enabled == "1") {
		//Ti.API.info(response[i].enabled);
		ann.pincolor = Titanium.Map.ANNOTATION_GREEN;
		ann.rightButton = Titanium.UI.iPhone.SystemButton.DISCLOSURE;
		ann.link = replicas[i].link;
		$.mapview.selectAnnotation(ann);

	}
	//$.mapview.entryID = e.rowData.id;
	$.mapview.addAnnotation(ann);

}

function downloadReplica(e) {
	if (e.clicksource == 'rightButton') {
		Ti.API.info("Annotation.link:" + e.annotation.link);
		//var url = e.annotation.link.split('=')[1].slice(0, -7);
		
		//Ti.API.info("url:" + url );
		//if (url.indexOf("glibrary") == 1) {
		//	url = Alloy.Globals.gateway + url;
			//alert(url);
		//}
		//Ti.API.info("Splitted URL:" + url);
		//var fileType = url.substring(url.length - 3);
		var url = e.annotation.link;
		var webView = Alloy.createController("WebViewer", {url:url}).getView();
		webView.backButtonTitle = "Replicas";
		webView.title = url.split("/")[url.split("/").length-1];
		webView.orientationModes = [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.PORTRAIT];
		$.replicaWindow.navGroup.open(webView);
	}
}
