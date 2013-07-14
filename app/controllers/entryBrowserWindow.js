var path = arguments[0].path;
var typeName = arguments[0].name;

var visibleAttrs = arguments[0].visibleAttrs.split(" ");

if (!visibleAttrs[0]) {
	visibleAttrs = ["FileName", "Size", "FileType", "Keywords", "LastModificationDate"];
}

var net = require('net');
var repoName = Alloy.Globals.repository;

var totalRows;

var filterQuery = "";




$.entryBrowserWindow.addEventListener('open', function() {
	loadMetadata();
});

function loadMetadata(query) {
	Ti.API.info("entryBrowserWindow focus");
	$.itemBrowserTableView.hide();
	$.activityIndicator.show();
	//$.activityIndicator.show();
	Ti.API.info("query:" + query);
	var url = Alloy.Globals.gateway + "glibrary/glib" + path + "/";
	if (query) {
		filterQuery = query;
		url = url + "/" + "?" + filterQuery;
		var items = $.toolbar.items;
		items.push(clearBtn);
		$.toolbar.items = items;
	}
	net.apiCall(url, function(response) {
		//Ti.API.info(response);
		var data = [];
		
		totalRows = response.total;
		//Ti.API.info(response.records);
		for (var i = 0; i < response.records.length; i++) {
			//Ti.API.info(response.records[i]);
			var row = Ti.UI.createTableViewRow({
				height : 100
			});
			//Ti.API.info(response.records[i]);
			row.metadata = response.records[i];
			/*var title = response.records[i].FileName;
			row.add(Ti.UI.createLabel({
				text : title,
				top: 5,
				left : 85,
				font : {
					fontSize : 16,
					fontWeight : "bold"
				}
			})); */
			for (var j = 0; j< visibleAttrs.length; j++ ) {
				//Ti.API.info(visibleAttrs[j]);
				row.add(Ti.UI.createLabel({
					left: 85,
					text: visibleAttrs[j] + ": " + response.records[i][visibleAttrs[j]],
					top: 5 + j*16,
					height: 16,
					font: {
						fontSize: "14dp",
						fontWeight: (j == 0 ? "bold" : "regular")
					},
					width: 240
				}));
			} 
			row.hasChild = true;
			//Ti.API.info("/" + repoName + "/Thumbs:Data");
			//Ti.API.info(response.records[i]);
			row.add(Ti.UI.createImageView({
				left : 10,
				width : 60,
				borderRadius: 5,
				//height: 80,
				image : Ti.Utils.base64decode(response.records[i]["/" + repoName + "/" + "Thumbs:Data"])
			})); 
			row.id = response.records[i][path + ":FILE"];
			//Ti.API.info(row.id);
			data.push(row); 
		} 
		$.activityIndicator.hide();
		//Ti.API.info(data);
		//$.browserWindow.title = e.row.children[0].text;
		$.entryBrowserWindow.title = typeName;
		$.itemBrowserTableView.setData(data);
		$.itemBrowserTableView.show();
	}); 

};

exports.loadMetadata = loadMetadata;


function loadMore(row) {
	updating = true;
	$.itemBrowserTableView.appendRow(Ti.UI.createTableViewRow({title:"Loading..."}));
	var url = Alloy.Globals.gateway + "glibrary/glib" + path;
	if (filterQuery) {
		url = url + "/" + "?" + filterQuery + "&start=" + row;
	} else {
		url = url + "?start=" + row;
	}
	Ti.API.info("loadMore");
	net.apiCall(url, function(response) {
		//Ti.API.info(response);
		$.itemBrowserTableView.deleteRow(lastRow,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.NONE});
		var data = [];
		//Ti.API.info(response.records);
		for (var i = 0; i < response.records.length; i++) {
			//Ti.API.info(response.records[i]);
			var row = Ti.UI.createTableViewRow({
				height : 100
			});
			//Ti.API.info(response.records[i]);
			row.metadata = response.records[i];
			/*var title = response.records[i].FileName;
			row.add(Ti.UI.createLabel({
				text : title,
				left : 90,
				font : {
					fontSize : 16,
					fontWeight : "bold"
				}
			})); */
			for (var j = 0; j< visibleAttrs.length; j++ ) {
				//Ti.API.info(visibleAttrs[j]);
				row.add(Ti.UI.createLabel({
					left: 85,
					text: visibleAttrs[j] + ": " + response.records[i][visibleAttrs[j]],
					top: 5 + j*16,
					height: 16,
					font: {
						fontSize: "14dp",
						fontWeight: (j == 0 ? "bold" : "regular")
					},
					width: 240
				}));
			}
			row.hasChild = true;
			row.add(Ti.UI.createImageView({
				left : 10,
				width : 60,
				borderRadius: 5,
				//height: 80,
				image : Ti.Utils.base64decode(response.records[i]["/" + repoName + "/" + "Thumbs:Data"])
			}));
			row.id = response.records[i][path + ":FILE"];
			//Ti.API.info(row.id);
			$.itemBrowserTableView.appendRow(row);
			//data.push(row);
		}
		//$.activityIndicator.hide();
		//Ti.API.info(data);
		//$.browserWindow.title = e.row.children[0].text;
		//$.entryBrowserWindow.title = typeName;
		//$.itemBrowserTableView.setData(data);
		//$.itemBrowserTableView.show();
		updating = false;
		lastRow = lastRow + response.records.length;
		Ti.API.info("lastRow: " + lastRow);
	}); 
}

var lastRow = 50;
var lastDistance = 0;
var updating = false;

function loadOnScroll(e) {
 // calculate location to determine direction
	
	
	var offset = e.contentOffset.y;
	var height = e.size.height;
	var total = offset + height;
	var theEnd = e.contentSize.height;
	var distance = theEnd - total;

	// going down is the only time we dynamically load,
	// going up we can safely ignore -- note here that
	// the values will be negative so we do the opposite
	if (distance < lastDistance)
	{
		// adjust the % of rows scrolled before we decide to start fetching
		var nearEnd = theEnd * .75;

		if (!updating && (total >= nearEnd) && lastRow < totalRows)
		{
			loadMore(lastRow);
		}
	}
	lastDistance = distance;
	
}

var filtersWindow;

function applyFilters() {
	//alert("ci siamo");
	if (!filtersWindow) {
		filtersWindow = Alloy.createController("FiltersWindow", {path: path, parent: $}).getView();
	}
	
	$.entryBrowserWindow.navGroup.open(filtersWindow);
	filtersWindow.navGroup = $.entryBrowserWindow.navGroup;
}


var clearBtn = Ti.UI.createButton({
	title: "Clear Filters",
	style: Ti.UI.iPhone.SystemButtonStyle.BAR
});
clearBtn.addEventListener('click', function()  {
	filterQuery = "";
	filtersWindow = null;
	var items = $.toolbar.items;
	items.pop();
	$.toolbar.items = items;
	//$.cancel.visible = false;
	loadMetadata();

});

function showMetadata(e) {
	var entryDetailWindow = Alloy.createController("entryDetailWindow", {id: e.rowData.id, metadata: e.rowData.metadata}).getView();
	$.entryBrowserWindow.navGroup.open(entryDetailWindow);
	entryDetailWindow.navGroup = $.entryBrowserWindow.navGroup;
}
