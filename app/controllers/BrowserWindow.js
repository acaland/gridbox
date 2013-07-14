var path = arguments[0].path || 'gridbox';

var net = require('net');
var moment = require('moment');

function load(_callback) {
	//alert("loading");
	$.loadingView.show();
	$.listTableView.setData([]);
	var url = "http://glibrary.ct.infn.it/amga/" + path;
	net.apiCall(url, function(response) {
		//Ti.API.info(response);
		for (var i = 0; i < response.length; i++) {
			Ti.API.info(response[i]);
			var item = response[i];
			var row = Ti.UI.createTableViewRow({
				height : 58
			});
			if (item.type == 'collection') {
				row.title = item.name;
				row.path = item.path;
				row.leftImage = '/Folder-Add.png';
				row.type = item.type;
				row.hasChild = true;

			} else {
				row.add(Ti.UI.createLabel({
					top : 5,
					left : 65,
					font : {
						fontWeight : 'bold',
						fontSize : '18'
					},
					text : item.FileName
				}));
				row.add(Ti.UI.createLabel({
					bottom : 5,
					left : 65,
					text : Math.round(item.Size / 1024) + "Kb",
					font : {
						fontSize : 12
					},
					color : 'gray'
				}));
				if (item.SubmissionDate) {
					Ti.API.info(item.SubmissionDate);
					row.add(Ti.UI.createLabel({
						bottom : 5,
						font : {
							fontSize : 12
						},
						color : 'gray',
						left : 110,
						text : moment(item.SubmissionDate).format('MMMM D YYYY h:mm')
					}));
				}
				//row.title = item.FileName;
				row.hasDetail = true;
				if (item.Type == 'JPG' || item.Type == 'jpg') {
					row.leftImage = '/jpg.png';
				} else if (item.Type == 'PDF' || item.Type == 'pdf') {
					row.leftImage = '/pdf.png';
				} else if (item.Type == 'DOC' || item.Type == 'doc') {
					row.leftImage = '/doc.png';
				} else if (item.Type == 'PNG' || item.Type == 'png') {
					row.leftImage = '/png.png';
				} else {
					row.leftImage = '/appicon.png';
				}
				row.replica = item.Replica;
				row.FileName = item.FileName;
			}
			$.listTableView.appendRow(row);

		}
		$.loadingView.hide();
		if (typeof(_callback) == 'function') {
			Ti.API.info('callback');
			Ti.API.info(typeof(_callback));
			_callback();
		}
	});
}

function loadChild(e) {
	Ti.API.info('qui:' + e.row.hasChild);
	if (e.row.hasChild) {
		Ti.API.info('figlio');
		var newBrowserWindow = Alloy.createController('BrowserWindow', {
			path : e.row.path
		}).getView();
		newBrowserWindow.navcontroller = $.BrowserWindow.navcontroller;
		newBrowserWindow.title = e.row.title;
		$.BrowserWindow.navcontroller.open(newBrowserWindow);
	} else {
		var replica = e.row.replica.slice(1, -1).split(',');
		replica[0] = {
			'enabled' : 1,
			lat : 37.524946,
			lng : 15.072228,
			'link' : replica[0],
			name : 'INFN Catania'
		};
		var replicaWindow = Alloy.createController("replicaWindow", replica).getView();
		$.BrowserWindow.navcontroller.open(replicaWindow);
		replicaWindow.title = e.row.FileName;
		replicaWindow.navGroup = $.BrowserWindow.navcontroller;
	}
}

function openFolderCreate() {
	$.folderName.value = "";
	$.newFolder.open();
}

function disposeWindow() {
	$.newFolder.close();
}

function disposeUploadWindow() {
	$.uploadWindow.close();
}

function folderCreate() {
	if ($.folderName.value) {
		net.apiCall("http://glibrary.ct.infn.it/amga/addCollection/" + path + "/" + $.folderName.value.replace(/ /g, "_"), function(response) {
			if (response.success) {
				disposeWindow();
				load();
			} else {
				alert("Cannot create folder: " + $.folderName.value);
			}
		});
	} else {
		alert("Please add a folder name");
	}
}

function imgUpload() {
	$.uploadWindow.open();
	$.fileNameTxt.hintText = moment(new Date()).format('MM-D-YYYY--hh:mm:ss') + '.jpg';
	//$.uploadDialog.show();
}

function openDialog() {
	$.uploadDialog.show();
}

function prepareUpload() {
	$.uploadWindow.close();
	var media = $.preview.image;
	Ti.API.info(media.length);
	Ti.API.info(media.mimeType);
	Ti.API.info(media.nativePath);
	Ti.API.info(media.size);
	Ti.API.info(media.width);
	Ti.API.info(media.height);
	if ($.fileNameTxt.value) {
		var filename = $.fileNameTxt.value.replace(/ /g, '_') + '.jpg';
	} else {
		var filename = moment(new Date()).format('MM-D-YYYY--hh:mm:ss') + '.jpg';
	}

	var row = Ti.UI.createTableViewRow({
		height : 58
	});
	row.add(Ti.UI.createImageView({
		image : media.imageAsThumbnail(60, 0, 5),
		left : 2
	}));

	var pb = Titanium.UI.createProgressBar({
		visible : true,
		top : 10,
		left : 65,
		width : 250,
		height : 'auto',
		min : 0,
		max : 1,
		value : 0,
		//color : '#fff',
		message : 'Uploading ' + filename,
		font : {
			fontSize : 10,
			fontWeight : 'bold'
		},
		style : Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
	});
	row.add(pb);
	if ($.listTableView.data.length > 0) {
		$.listTableView.insertRowBefore(0, row);
	} else {
		$.listTableView.appendRow(row);
	}

	var url = Alloy.Globals.gateway + "dm/put/vo.indicate-project.eu/" + filename + "/" + "infn-se-03.ct.pi2s2.it/dpm/ct.pi2s2.it/home/vo.indicate-project.eu/glibrary/";
	Ti.API.info(url);
	var xhr = Ti.Network.createHTTPClient();
	xhr.media = media;
	xhr.filename = filename;
	xhr.row = row;
	xhr.onload = function() {
		var response = JSON.parse(xhr.responseText);
		Ti.API.info(JSON.stringify(response));
		if (response.status == "409") {
			alert(response.reason + ": file exists");
			pb.value = 0;
			pb.message = 'File exists';
		}
		if (response.status == "307") {
			uploadFile(response.redirect, this.filename, this.media, this.row);
		}
		Ti.API.info(JSON.stringify(response));
	};
	xhr.onerror = function(e) {
		alert(e);
		pb.value = 0;
		pb.message = 'Upload failed';
	};
	xhr.open("GET", url);
	xhr.send();

};

function uploadFile(url, filename, media, row) {
	var xhr = Ti.Network.createHTTPClient();
	var metadata = {};
	metadata.FileName = filename;
	metadata.Type = 'jpg';
	metadata.Size = media.length;
	metadata.Replica = '{' + Alloy.Globals.gateway + 'dm/vo.indicate-project.eu/infn-se-03.ct.pi2s2.it/dpm/ct.pi2s2.it/home/vo.indicate-project.eu/glibrary/' + filename + '}';
	xhr.metadata = metadata;
	xhr.onload = function() {
		Ti.API.info(xhr.responseText);
		storeMetadata(this.metadata, function(e) {
			if (e.success) {
				row.children[1].message = "done!";
			} else {
				row.children[1].message = e.message;
			}
		});

		/*var newFile = Alloy.createModel("File", {
		 "name": filename,
		 "size": $.iv.image.length,
		 "thumb": thumbFile,
		 "upload_date": new Date()
		 });
		 newFile.save();
		 Alloy.Collections.File.add(newFile);	*/

	};
	xhr.onerror = function(e) {
		alert(e);
		row.children[1].value = 0;
		row.children[1].message = 'Upload failed';
	};
	xhr.onsendstream = function(e) {
		//Ti.API.info("sono su onsendstream");
		//Ti.API.info(JSON.stringify(e));
		//alert(JSON.stringify(e));
		row.children[1].value = e.progress;
	};
	Ti.API.info("Upload URL:" + url);
	xhr.open("PUT", url);
	xhr.send(media);
}

function storeMetadata(metadata, _callback) {
	var xhr = Ti.Network.createHTTPClient();
	Ti.API.info(metadata);
	var url = 'http://glibrary.ct.infn.it/amga/addEntry/' + path + '/';
	Ti.API.info(url);
	xhr.onload = function() {
		var response = JSON.parse(xhr.responseText);
		_callback({
			success : response.success
		});
	};
	xhr.onerror = function(e) {
		alert(e);
		_callback({
			success : false,
			message : 'Failed to Store Metadata'
		});
		//row.children[1].message = 'Failed to Store Metadata';
	};
	xhr.open('POST', url);
	xhr.send(metadata);
}

function chooseOrigin(e) {
	//alert(e.index);
	if (e.index == 0) {
		//alert("camera");
		Ti.Media.showCamera({
			success : function(camera) {
				var resizedImg = camera.media.imageAsResized(camera.media.width / 3, camera.media.height / 3);
				$.preview.image = resizedImg;
				//prepareUpload(resizedImg);
			},
			animated : true,
			allowEditing : true
		});
	} else if (e.index == 1) {
		Ti.Media.openPhotoGallery({
			success : function(camera) {
				var resizedImg = camera.media.imageAsResized(camera.media.width / 2, camera.media.height / 2);
				$.preview.image = resizedImg;
				//prepareUpload(resizedImg);
			},
			animated : true,
			allowEditing : true
		});
	}
}

function storageType(e) {
	if (e.row.hasCheck) {
		e.row.hasCheck = false;
	} else {
		e.row.hasCheck = true;
	}
}

// pull to refresh
function formatDate() {
	var date = new Date();
	var datestr = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
	if (date.getHours() >= 12) {
		datestr += ' ' + (date.getHours() == 12 ? date.getHours() : date.getHours() - 12) + ':' + date.getMinutes() + ' PM';
	} else {
		datestr += ' ' + date.getHours() + ':' + date.getMinutes() + ' AM';
	}
	return datestr;
}

var border = Ti.UI.createView({
	backgroundColor : "#576c89",
	height : 2,
	bottom : 0
});

var tableHeader = Ti.UI.createView({
	backgroundColor : "#e2e7ed",
	width : 320,
	height : 60
});

// fake it til ya make it..  create a 2 pixel
// bottom border
tableHeader.add(border);

var arrow = Ti.UI.createView({
	backgroundImage : "/whiteArrow.png",
	width : 23,
	height : 60,
	bottom : 10,
	left : 20
});

var statusLabel = Ti.UI.createLabel({
	text : "Pull to reload",
	left : 55,
	width : 200,
	bottom : 30,
	height : "auto",
	color : "#576c89",
	textAlign : "center",
	font : {
		fontSize : 13,
		fontWeight : "bold"
	},
	shadowColor : "#999",
	shadowOffset : {
		x : 0,
		y : 1
	}
});

var lastUpdatedLabel = Ti.UI.createLabel({
	text : "Last Updated: " + formatDate(),
	left : 55,
	width : 200,
	bottom : 15,
	height : "auto",
	color : "#576c89",
	textAlign : "center",
	font : {
		fontSize : 12
	},
	shadowColor : "#999",
	shadowOffset : {
		x : 0,
		y : 1
	}
});

var actInd = Titanium.UI.createActivityIndicator({
	left : 20,
	bottom : 13,
	width : 30,
	height : 30,
	style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK
});

tableHeader.add(arrow);
tableHeader.add(statusLabel);
tableHeader.add(lastUpdatedLabel);
tableHeader.add(actInd);

$.listTableView.headerPullView = tableHeader;

var pulling = false;
var reloading = false;

function beginReloading() {
	// just mock out the reload
	load(endReloading);
}

function endReloading() {

	// when you're done, just reset
	$.listTableView.setContentInsets({
		top : 0
	}, {
		animated : true
	});
	reloading = false;
	lastUpdatedLabel.text = "Last Updated: " + formatDate();
	statusLabel.text = "Pull down to refresh...";
	actInd.hide();
	arrow.show();
}

$.listTableView.addEventListener('scroll', function(e) {
	var offset = e.contentOffset.y;
	if (offset <= -65.0 && !pulling && !reloading) {
		var t = Ti.UI.create2DMatrix();
		t = t.rotate(-180);
		pulling = true;
		arrow.animate({
			transform : t,
			duration : 180
		});
		statusLabel.text = "Release to refresh...";
	} else if (pulling && (offset > -65.0 && offset < 0) && !reloading) {
		pulling = false;
		var t = Ti.UI.create2DMatrix();
		arrow.animate({
			transform : t,
			duration : 180
		});
		statusLabel.text = "Pull down to refresh...";
	}
});

var event1 = 'dragEnd';
if (Ti.version >= '3.0.0') {
	event1 = 'dragend';
}

$.listTableView.addEventListener(event1, function(e) {
	if (pulling && !reloading) {
		reloading = true;
		pulling = false;
		arrow.hide();
		actInd.show();
		statusLabel.text = "Reloading...";
		$.listTableView.setContentInsets({
			top : 60
		}, {
			animated : true
		});
		arrow.transform = Ti.UI.create2DMatrix();
		beginReloading();
	}
});

