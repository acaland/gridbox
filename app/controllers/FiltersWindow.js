
var slide_in =  Titanium.UI.createAnimation({bottom:0});
var slide_out =  Titanium.UI.createAnimation({bottom:-251});

var path = arguments[0].path;
//var filter = arguments[0].query;
var entryBrowserController = arguments[0].parent;
var filterQuery, lastFilterQuery;

var picker = Ti.UI.createPicker({top:43, selectionIndicator: true, type: Titanium.UI.PICKER_TYPE_PLAIN});


var net = require('net');

net.apiCall(Alloy.Globals.gateway + "glibrary/metadata" + path, function(response) {
	//Ti.API.info(response.filters);

	var rows = [];
	for (var i=0; i<response.filters.length; i++) {
		rows.push(Ti.UI.createPickerRow({title: response.filters[i].dataIndex, index: i}));
		//Ti.API.info(response.filters[i].dataIndex)
	}
	picker.add(rows);
	$.pickerView.add(picker);
});

function chooseFilter() {
	
	$.pickerView.animate(slide_in);
	$.addFilter.enabled = false;
	//Ti.API.info(JSON.stringify($.filterList));
}

function hidePickerView() {
	$.pickerView.animate(slide_out);
	$.addFilter.enabled = true;
}

function filterChoosen() {
	$.pickerView.animate(slide_out);
	$.addFilter.enabled = true;
	var selection = picker.getSelectedRow(0).title;
	var index = picker.getSelectedRow(0).index;
	var row = Ti.UI.createTableViewRow({
		name: selection, 
		value: "", 
		filterIndex: index, 
		hasChild: true,
		height: '60dp',
		className: "filters"
	});
	row.add(Ti.UI.createLabel({
		text: row.name,
		left: 10,
		font: {fontWeight: "bold"},
		width: "45%"
	}));
	row.add(Ti.UI.createLabel({
		text: row.value,
		right: 10,
		width: "45%",
		textAlign: "right"
	}));
	$.filters.appendRow(row);
}

function filterValues(e) {
	var valuesListWindow = Alloy.createController("valueListWindow", {path: path, selectedRowIndex: e.index, tv: $.filters}).getView();
	$.FiltersWindow.navGroup.open(valuesListWindow);
}


$.FiltersWindow.addEventListener('close', function() {
	Ti.API.info("FilterWindow closing");
	//var filter = [];
	lastFilterQuery = filterQuery;
	if ($.filters.data[0]) {
		for (var i=0; i< $.filters.data[0].rowCount; i++) {
			if ($.filters.data[0].rows[i].value) {
				var f = "filter[" + i + "][field]=" + $.filters.data[0].rows[i].name +
					"&filter[" + i + "][data][type]=list" +
					"&filter[" + i + "][data][value]=" + $.filters.data[0].rows[i].value;
				if (i>0) {
					filterQuery = filterQuery + "&" + f; 
				} else {
					filterQuery = f;
				}
			}
			
		}
		Ti.API.info(filterQuery);
		if (lastFilterQuery != filterQuery) {
			lastFilterQuery = filterQuery;
			entryBrowserController.loadMetadata(filterQuery);
		}
		
	}
	
});
