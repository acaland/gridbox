
var net = require("net");
//net.retrieveIdpList("https://indicate-gw.consorzio-cometa.it/shibboleth", function(federations) {



var entityId = Alloy.Globals.gateway + "shibboleth";


net.retrieveIdpList(entityId, function(federations) {
	//Ti.API.info("federations:");
	//Ti.API.info(federations);
	var federationData = [];
	//federationData[0] = {title: "All", hasChild: true}
	//federationData[0].idps = [];
	for (var i=0; i < federations.length; i++) {
		//federationData[0].idps = federationData[0].idps.concat(federations[i].idps);

		/*federationData[i] = {
			title: federations[i].name, 
			leftImage: federations[i].flag,
			rightImage: federations[i].logo,
			country: federations[i].country, 
			idps:  federations[i].idps, 
			color: "black", hasChild: true
		}; */

		var row = Ti.UI.createTableViewRow();
		row.add(Ti.UI.createImageView({
			image: federations[i].flag,
			left: 15,
			top: 5,
			width: "50dp",
			//borderWidth: 1
		}));
		row.add(Ti.UI.createLabel({
			text: federations[i].country,
			textAlign: "center",
			bottom: 5,
			left: 0,
			width: "80dp",
			font: {
				fontSize: "14dp"
			},
			color: "black"
			//borderWidth: 1
		}));

		row.add(Ti.UI.createLabel({
			text: federations[i].name,
			left: 100,
			//borderWidth: 1,
			font: {
				fontSize: "20dp",
				fontWeight: "bold"
			},
			color: "black"
		}));
		
		row.add(Ti.UI.createImageView({
			image: federations[i].logo,
			right: 5,
			width: 80
		}));
		//row.title = federations[i].name;
		row.height = "80dp";
		row.hasChild = true;
		row.color = "black";
		row.idps = federations[i].idps;
		row.className = "federationList";
		row.name = federations[i].name;

		if ( row.name == "GrIDP") {
			federationData.unshift(row);
			//$.federationsTableView.insertRowBefore(0, row);
		} else {
			federationData.push(row);
			//$.federationsTableView.appendRow(row);
		}
		
		//Ti.API.info(federationData[i]);
	}
	/* federationData[0].idps.sort(function(a, b) {
 		var nameA=a.displayName.toLowerCase(), nameB=b.displayName.toLowerCase();
 		if (nameA < nameB) //sort string ascending
  			return -1; 
 		if (nameA > nameB)
  			return 1;
 		return 0; //default return value (no sorting)
	}); */
	
	$.federationsTableView.setData(federationData);
	//$.federationsTableView.selectRow(0);
	//$.federationsTableView.fireEvent('click', {rowData:federationData[0]});
});


function openIdpList(e) {
	//Ti.API.info("navGroup: " + JSON.stringify($.federationList.navGroup));
	var idpsData = [];
	//detailNav.open(idpsListWindow);
	//Ti.API.info(JSON.stringify(e.row));
	//alert(JSON.stringify(e.row));
	if (e.row.name == "GrIDP") {
		
		for (var i=0; i < e.row.idps.length; i++) {

			var row = Ti.UI.createTableViewRow({height: 70});

			row.add(Ti.UI.createImageView({
				image: e.row.idps[i].flag,
				left: "25dp",
				top: "5dp",
				width: "40dp",
				//borderWidth: 1
			}));
			row.add(Ti.UI.createLabel({
				text: e.row.idps[i].country,
				textAlign: "center",
				bottom: 5,
				left: 0,
				width: "90dp",
				font: {
					fontSize: "12dp"
				},
				color: "black"
				//borderWidth: 1
			}));

			row.add(Ti.UI.createLabel({
				text: e.row.idps[i].displayName,
				left: "90dp",
				right: "70dp",
				//borderWidth: 1,
				font: {
					fontSize: "18dp",
					fontWeight: "bold"
				}, 
				color: "black"
			}));
			
			row.add(Ti.UI.createImageView({
					image: e.row.idps[i].logo,
				right: 5,
				width: "60dp"
			}));
			row.name = e.row.idps[i].displayName;
			row.origin = e.row.idps[i].origin;
			row.className = "IdpList";

			//Ti.API.info(JSON.stringify(row));

			if (row.name == "IDPOPEN GARR") {
				idpsData.unshift(row);
			} else {
				idpsData.push(row);
			} 
			
		}
	} else {
		
		for (var i=0; i < e.row.idps.length; i++) {
			idpsData[i] = {
				title: e.row.idps[i].displayName, 
				name: e.row.idps[i].displayName,
				origin: e.row.idps[i].origin, 
				color: "black", 
				hasChild: true}
		}
	}
	Ti.API.info(idpsData);
	
	if (OS_IOS) {
		var idpListWindow = Alloy.createController("IdpList", {data: idpsData, navGroup: $.federationList.navGroup}).getView();
		$.federationList.navGroup.open(idpListWindow);
	} else {
		var idpListWindow = Alloy.createController("IdpList", {data: idpsData, parentWin: $.federationList }).getView();
		idpListWindow.fullscreen = false;
		idpListWindow.open();
		
	}
	
}