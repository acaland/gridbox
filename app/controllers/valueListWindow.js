
var path = arguments[0].path;
var rowIndex = arguments[0].selectedRowIndex;
var filtersTv = arguments[0].tv;

var selectedRow = filtersTv.data[0].rows[rowIndex];
var filterIndex = selectedRow.filterIndex;

//Ti.API.info($.valueListWindow);
$.valueListWindow.title = selectedRow.name;

Ti.API.info(rowIndex);
//Ti.API.info(filtersTv.data);
//Ti.API.info(JSON.stringify(filtersTv.data));
Ti.API.info(selectedRow.name);
Ti.API.info(selectedRow.filterIndex);
//Ti.API.info(JSON.stringify(filtersTv.data[rowIndex]));
//Ti.API.info(filtersTv.data[0][rowIndex]);
//Ti.API.info(filtersTv.data[rowIndex]);
//Ti.API.info(filtersTv.data[rowIndex].title);
//Ti.API.info(filtersTv.data[rowIndex].filterIndex);

var filterData = [];

for (var i=0; i < rowIndex; i++) {
	if (filtersTv.data[0].rows[i].value) {
		var filter = {
			field : filtersTv.data[0].rows[i].name,
			data : {
				type : 'list',
				value : [filtersTv.data[0].rows[i].value]
			}
		};
		filterData.push(filter);
	}
	
}

Ti.API.info(JSON.stringify(filterData));


var net = require('net');

var url = Alloy.Globals.gateway + "glibrary/test" + path + "/" +"?filterData=" 
	+ JSON.stringify(filterData);
Ti.API.info(url);

net.apiCall(url, function(response) {
	var data = [];

	for (var i=0; i< response[filterIndex].length; i++) {
		data.push({title: response[filterIndex][i][0] })
		//Ti.API.info(response[filterIndex][i]);
	}
	Ti.API.info(JSON.stringify(data));
	$.valuesTable.setData(data); 
	//Ti.API.info(response[filterIndex][i]);
	
});

function setValue(e) {
	if (e.row.hasCheck) {
		e.row.hasCheck = false;
	} else {
		e.row.hasCheck = true;
		selectedRow.value = e.row.title;
		selectedRow.children[1].text = e.row.title;
		for (var i=rowIndex+1; i < filtersTv.data[0].rowCount; i++) {
			filtersTv.data[0].rows[i].value = "";
			filtersTv.data[0].rows[i].children[1].text = "";
		}
	}
	
}

