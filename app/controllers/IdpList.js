
$.idpsTableView.data = arguments[0].data;
var navGroup = arguments[0].navGroup;
$.IdpList.parentWin = arguments[0].parentWin;

Ti.Platform.osname

function openIdpLoginWindow(e) {
	
	var login_url = "https://gridp.garr.it/ds/WAYF?entityID="+ Alloy.Globals.gateway + "shibboleth&action=selection&origin=";
	//idpsListWindow.setTitle("Back");
	
	if (OS_IOS) {
		var idpLoginWindow = Alloy.createController("IdpLoginWindow", {url: login_url + e.rowData.origin, navGroup: navGroup}).getView();
		navGroup.open(idpLoginWindow);
	} else {
		var idpLoginWindow = Alloy.createController("IdpLoginWindow", {url: login_url + e.rowData.origin, parentWin: $.IdpList}).getView();
		idpLoginWindow.fullscreen = false;
		idpLoginWindow.open();
	}
	
	idpLoginWindow.setTitle(e.rowData.name);
	idpLoginWindow.backButtonTitle = 'Back'
	//loginWindow.leftNavButton = Titanium.UI.createButton({title:'Back'});
	//Ti.API.info(e.rowData.origin);
	
	
}