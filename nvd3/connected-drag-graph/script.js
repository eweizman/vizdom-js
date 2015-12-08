var AND_FILTER = "and";
var OR_FILTER = "or";
var HEATMAP_PREFIX = "heatmap";

Object.size = function(obj) {
	var size = 0,
		key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

addHeaderSelector();
var charts = {};
var chartConnections = {}; // source -> dest map
var chartsConnected = {}; // dest -> source map
var filters = {};
var selected = {};
var csv = "data/fakedata.csv";
var setChartDivStyle = "border:1px solid black;padding-top:10px";

var chartTrash = document.getElementById("chart_trash");
chartTrash.addEventListener('drop', dropTrash, false);
chartTrash.addEventListener('dragover', dragTrash, false);

//createHeatmap();
newHeatmap(100, 100, "age", "salary");

function addHeaderSelector() {
	var csv = "data/fakedata.csv";
	d3.csv(csv, function(error, data) {
		keys = d3.keys(data[0]);
		for (i = 0; i < keys.length; i++) {
			var key = keys[i];
			var button = document.createElement("button");
			button.appendChild(document.createTextNode(key));
			button.setAttribute("type", "button");
			button.setAttribute("draggable", "true");
			button.setAttribute("ondragstart", "drag(event)");
			var div = document.getElementById("header_buttons");
			div.appendChild(button);
		}
		document.body.addEventListener('drop', drop, false);
		document.body.addEventListener('dragover', dragOver, false);
	});
}

function newGraph(x, y, key) {
	var chartId = "chart" + (Object.size(charts) + 1);
	charts[chartId] = "";
	chartConnections[chartId] = [];
	chartsConnected[chartId] = [];
	var newGraphDiv = document.createElement("div");
	newGraphDiv.setAttribute("id", chartId);

	newGraphDiv.setAttribute("style", "position:absolute; TOP:" + y + "px; LEFT:" + x + "px;" + setChartDivStyle);

	var filter = document.createElement("button");
	filter.setAttribute("type", "button");
	filter.appendChild(document.createTextNode(AND_FILTER));
	filter.setAttribute("id", getFilterTypeButtonId(chartId));
	filter.setAttribute("style", "position:absolute");
	filter.onclick = filterButtonPressed(chartId);

	var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
	newGraphDiv.appendChild(filter);
	newGraphDiv.appendChild(svg);

	newGraphDiv.setAttribute("draggable", "true");
	newGraphDiv.setAttribute("ondragstart", "dragChart(event)");
	newGraphDiv.addEventListener("drop", dropChartFromChartId(chartId), false);

	var body = document.getElementById("body");
	var newGraphButton = document.getElementById("newGraphButton");

	body.insertBefore(newGraphDiv, newGraphButton);

	createGraph(chartId, key);
}

function newHeatmap(x,y,key1,key2) {
	var chartId = "chart" + (Object.size(charts) + 1);
	charts[chartId] = "";
	chartConnections[chartId] = [];
	chartsConnected[chartId] = [];
	var newGraphDiv = document.createElement("div");
	newGraphDiv.setAttribute("id", chartId);

	newGraphDiv.setAttribute("style", "position:absolute; TOP:" + y + "px; LEFT:" + x + "px;" + setChartDivStyle);

	var filter = document.createElement("button");
	filter.setAttribute("type", "button");
	filter.appendChild(document.createTextNode(AND_FILTER));
	filter.setAttribute("id", getFilterTypeButtonId(chartId));
	filter.setAttribute("style", "position:absolute");
	filter.onclick = filterButtonPressed(chartId);

	var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
	newGraphDiv.appendChild(filter);
	newGraphDiv.appendChild(svg);

	newGraphDiv.setAttribute("draggable", "true");
	newGraphDiv.setAttribute("ondragstart", "dragChart(event)");
	newGraphDiv.addEventListener("drop", dropChartFromChartId(chartId), false);

	var body = document.getElementById("body");
	var newGraphButton = document.getElementById("newGraphButton");

	body.insertBefore(newGraphDiv, newGraphButton);

	//createGraph(chartId, key);
	createHeatmap(chartId, key1, key2);
}

function isHeatmap(chartId) {
	return Array.isArray(charts[chartId]);
}

function filterButtonPressed(chartId) {
	return function(e) {
		getFilterTypeButton(chartId).firstChild.nodeValue = getFilterType(chartId) == AND_FILTER ? OR_FILTER : AND_FILTER;
		refreshGraph(chartId);
	}
}

function getFilterTypeButtonId(chartId) {
	return "filterTypeButton" + chartId;
}

function getFilterTypeButton(chartId) {
	return document.getElementById(getFilterTypeButtonId(chartId));
}

function getFilterType(chartId) {
	return getFilterTypeButton(chartId).firstChild.nodeValue;
}

function allowDrop(ev) {
	ev.preventDefault();
}

function dragOver(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("type", "newGraph");
	ev.dataTransfer.setData("text", ev.target.firstChild.nodeValue);
	ev.dataTransfer.setData("currentGraphNum", Object.size(charts));
}

function dragChart(ev) {
	ev.dataTransfer.setData("type", "dragChart");
	ev.dataTransfer.setData("chartId", ev.target.id);
}

function drop(ev) {
	console.log("CANVAS")
	ev.preventDefault();
	var x = ev.pageX,
		y = ev.pageY;

	switch (ev.dataTransfer.getData("type")) {
		case "newGraph":
			if (ev.dataTransfer.getData("currentGraphNum") != Object.size(charts)) {
				return;
			}
			var data = ev.dataTransfer.getData("text");
			newGraph(x, y, data);
			break;
		default:
			break;
	}
}

function dragTrash(ev) {
	ev.preventDefault();
	switch (ev.dataTransfer.getData("type")) {
		case "dragChart":
			//set icon image to open trash
			break;
		default:
			break;
	}
}

function dropTrash(ev) {
	ev.preventDefault();
	switch (ev.dataTransfer.getData("type")) {
		case "dragChart":
			var chartId = ev.dataTransfer.getData("chartId");
			deleteChart(chartId);
			break;
		default:
			break;
	}
}

function deleteChart(chartId) {
	for (var i = 0; i < chartsConnected[chartId].length; i++) {
		removeConnection(chartsConnected[chartId][i], chartId);
	}

	for (var i = 0; i < chartConnections[chartId].length; i++) {
		removeConnection(chartId, chartConnections[chartId][i]);
	}

	jsPlumb.remove(chartId);

	delete chartConnections[chartId];
	delete chartsConnected[chartId];
	delete filters[chartId];
	delete selected[chartId];
}

function dropChartFromChartId(chartId2) {
	return function(ev) {
		ev.preventDefault();
		var x = ev.pageX,
		y = ev.pageY;
		switch (ev.dataTransfer.getData("type")) {
			case "dragChart":
				var chartId1 = ev.dataTransfer.getData("chartId");
				connectGraph(chartId1, chartId2);
				break;
		 	case "newGraph":
		 		if (isHeatmap(chartId2)) {
		 			return;
		 		}
		 		var key1 = charts[chartId2];
		 		var key2 = ev.dataTransfer.getData("text");
		 		newHeatmap(x,y,key1,key2);
		 		deleteChart(chartId2);
		 		break;
			default:
				break;
		}
	}
}

function chartMoved(chartId) {
	//jsPlumb.repaint(chartId);
	jsPlumb.repaintEverything(); //less efficient, see if jsPlumb.repaint has a bug
}

function connectGraph(source, dest) {
	if (source == dest || chartConnections[source].indexOf(dest) > -1 || detectLoop(source, dest)) {
		return;
	}
	chartConnections[source].push(dest);
	chartsConnected[dest].push(source);
	if (source in selected) {
		if (Array.isArray(selected[source].key)) {
			filterDownstreamChart(source, dest, selected[source].key[0], selected[source].val[0], true);
			filterDownstreamChart(source, dest, selected[source].key[1], selected[source].val[1], true);
		} else {
			filterDownstreamChart(source, dest, selected[source].key, selected[source].val, true);
		}
	} else if (source in filters) {
		for (var key in filters[source]) {
			for(var i=0;i<filters[source][key].length;i++) {
				propogateFiltersDownward(source, dest, key, filters[source][key][i]);
				refreshAllChildGraphs(dest);
			}
		}
	}

	jsPlumb.connect({
		source: source,
		target: dest,
		endpoint: ["Dot", {
			radius: 5
		}],
		connector: ["Bezier", {
			curviness: 100
		}],
		//connector:["Flowchart", {cornerRadius:10}], //just a style change, see which is nicer
		anchors: ["Continuous", "Continuous"],
		paintStyle: {
			strokeStyle: "darkgray",
			lineWidth: 3
		},
		endpointStyle: {
			fillStyle: "darkgray",
			outlineColor: "gray"
		},
		overlays: [
			["Arrow", {
				width: 12,
				length: 12,
				location: 0.63
			}]
		]
	}, arrow);
	jsPlumb.bind("connectionDetached", function(info, originalEvent) {
		removeConnection(info.source.id, info.target.id);
	});
}

function removeConnection(source, dest) {
	console.log("removeConnection");
	if (chartConnections[source].indexOf(dest) == -1) {
		return;
	}
	chartConnections[source].splice(chartConnections[source].indexOf(dest), 1);
	chartsConnected[dest].splice(chartsConnected[dest].indexOf(source), 1);

	if (selected[source] == undefined) { //nothing was selected
		return;
	}

	removeFilter(dest, selected[source].key, selected[source].val);
}

function removeFilter(chartId, key, val) {
	//delete filters[chartId][key];

	filters[chartId][key].splice(filters[chartId][key].indexOf(val), 1);

	console.log(filters[chartId][key]);

	refreshGraph(chartId);

	for (var i = 0; i < chartConnections[chartId].length; i++) {
		removeFilter(chartConnections[chartId][i], key, val);
	}
}

function makeArrowBetweenSourceAndDest(source, dest) {
	var x1 = document.getElementById(source).offsetLeft;
	var y1 = document.getElementById(source).offsetTop;
	var x2 = document.getElementById(dest).offsetLeft;
	var y2 = document.getElementById(dest).offsetTop;
	var connectionArrow = getConnectionArrow(source, dest);
	connectionArrow.setAttribute("x1", x1); //Create a path in SVG's namespace
	connectionArrow.setAttribute("y1", y1);
	connectionArrow.setAttribute("x2", x2);
	connectionArrow.setAttribute("y2", y2);
}

// JSPlumb will likely be a prettier and easier way to do lines https://github.com/sporritt/jsplumb/
function getConnectionArrow(source, dest) {
	var connectionArrow = document.getElementById(getArrowId(source, dest));
	if (connectionArrow == null) {
		var svg = document.getElementById("background_svg");
		connectionArrow = document.createElementNS("http://www.w3.org/2000/svg", 'line');
		connectionArrow.setAttribute("stroke", "#444");
		connectionArrow.setAttribute("stroke-width", 1);
		connectionArrow.setAttribute("marker-end", "url(#arrow)");
		connectionArrow.setAttribute("id", getArrowId(source, dest));
		svg.appendChild(connectionArrow);
	}
	return connectionArrow;
}

function getArrowId(source, dest) {
	return source + dest + "connectionArrow";
}

function detectLoop(source, dest) {
	if (source == dest) {
		return true;
	}
	if (!dest in chartConnections) {
		return false;
	}
	for (var i = 0; i < chartConnections[dest].length; i++) {
		if (detectLoop(source, chartConnections[dest][i])) {
			return true;
		}
	}
	return false;
}

function createGraph(chartId, key) {
	createGraphFromKey(key, chartId, {});
	charts[chartId] = key;
}

function refreshGraph(chartId) {
	var filterKeys = filters[chartId];
	if (filterKeys == undefined) {
		filterKeys = {};
	}
	if (Array.isArray(charts[chartId])) {
		createHeatmapFromKey(chartId, charts[chartId][0], charts[chartId][1], filterKeys);
	} else {
		createGraphFromKey(charts[chartId], chartId, filterKeys);
	}
	
}

function refreshAllChildGraphs(chartId) {
	refreshGraph(chartId);
	for (var i = 0; i < chartConnections[chartId].length; i++) {
		refreshAllChildGraphs(chartConnections[chartId][i]);
	}
}

function keyNest(key) {
	if (Array.isArray(key)) {
		return d3.nest().key(function(d) { return d[key[0]]; })
			.key(function(d) { return d[key[1]]; });
	} else {
		return d3.nest().key(function(d) {
				return d[key]
			});
	}
}

function applyFilters(key, chartId, data, filterKeys) {
	return keyNest(key)
			.rollup(function(d) {
				return d3.sum(d, function(g) {
					var filterType = getFilterType(chartId);
					if (Object.size(filterKeys) == 0) {
						return 1;
					}
					if (filterType == AND_FILTER) {
						for (var key in filterKeys) {
							for (var i = 0; i < filterKeys[key].length; i++) {
								if (g[key] != filterKeys[key][i]) {
									return 0;
								}
							}
						}
						return 1;
					} else { //OR_FILTER
						var allKeysEmpty = true;
						for (var key in filterKeys) {
							if (filterKeys[key].length != 0) {
								allKeysEmpty = false;
							}
							for (var i = 0; i < filterKeys[key].length; i++) {
								if (g[key] == filterKeys[key][i]) {
									return 1;
								}
							}
						}
						return allKeysEmpty;
					}

				});
			}).entries(data);
}

function createGraphFromKey(key, chartId, filterKeys) {
	var chartNum = '#' + chartId + " svg";
	d3.csv(csv, function(error, data) {
		var group = applyFilters(key, chartId, data, filterKeys);

		group.forEach(function(d) {
			d.label = d.key;
			d.value = d.values;
		})

		var exampleData = [{
			key: "totals",
			values: group
		}];

		nv.addGraph(function() {
			var width = 400,
				height = 300;
			var chart = nv.models.discreteBarChart()
				.x(function(d) {
					return d.label
				})
				.y(function(d) {
					return d.value
				})
				.staggerLabels(true)
				.showValues(true)
				.duration(250)
				.width(width)
				.height(height);
			d3.select(chartNum)
				.datum(exampleData)
				.call(chart)
				.style({
					'width': width,
					'height': height
				});

			function titleDrag(d) {
				var x = d3.event.x;
				var y = d3.event.y;
				var chartDiv = document.getElementById(chartId);
				var top = chartDiv.offsetTop;
				var left = chartDiv.offsetLeft - width / 2;
				chartDiv.setAttribute("style", "position:absolute; TOP:" + (top + y) + "px; LEFT:" + (left + x) + "px;" + setChartDivStyle);
				chartMoved(chartId);
			}

			var drag = d3.behavior.drag()
				.on("drag", titleDrag);

			if (d3.select(chartNum).selectAll(".chart-title").size() == 0) {
				d3.select(chartNum)
					.append("text")
					.attr("x", width / 2)
					.attr("y", 11)
					.attr("text-anchor", "middle")
					.attr("class", "chart-title")
					.text(chartId + " (" + key + ")")
					.call(drag);
			}


			if (chartId in selected) {
				d3.select(selected[chartId].bar).style("fill", "red");
			}

			nv.utils.windowResize(chart.update);
			return chart;
		}, function() {
			d3.selectAll(chartNum + " .nv-bar").on('mousedown', function(d) {
				onBarSelection(chartId, this, key, d.key);

			});
		});
	});
}

function createHeatmapFromKey(chartId, key1, key2, filterKeys) {
	//var width = 400, height = 300;
	var margin = {
			top: 20,
			right: 90,
			bottom: 30,
			left: 50
		},
		width = 500 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%Y-%m-%d").parse,
		formatDate = d3.time.format("%b %d");

	var x = d3.scale.ordinal().rangeBands([0, width]),
		y = d3.scale.ordinal().rangeBands([height, 0]),
		z = d3.scale.linear().range(["white", "steelblue"]);

   var chartNum = '#' + chartId + " svg";

	var svg = d3.select(chartNum)
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.csv("data/fakedata.csv", function(error, data) {
		if (error) throw error;

		var buckets = [];

		var rolledUp = applyFilters([key1,key2], chartId, data, filterKeys);

		rolledUp.forEach(function(d) {
			d.values.forEach(function(d2) {
				var newObj = {};
				newObj[key1] = d.key;
				newObj[key2] = d2.key;
				newObj.count = +d2.values;
				buckets.push(newObj);
			});
		});

		// Compute the scale domains.
		x.domain(buckets.map(function (d) {
			return d[key2];
		}));
		y.domain(buckets.map(function (d) {
			return d[key1];
		}));
		z.domain([0, d3.max(buckets, function(d) {
			return d.count;
		})]);

		// Display the tiles for each non-zero bucket.
		// See http://bl.ocks.org/3074470 for an alternative implementation.
		svg.selectAll(".tile")
			.data(buckets)
			.enter().append("rect")
			.attr("class", "tile")
			.on("click", function(e){
				onTileSelection(chartId, this, key1, key2, e[key1], e[key2]);
			})
			.attr("x", function(d) {
				return x(d[key2]);
			})
			.attr("y", function(d) {
				return y(d[key1]);
			})
			.attr("id", function(d) {
				return heatmapId(d, chartId, key1, key2);
			})
			.attr("width", x.rangeBand())
			.attr("height", y.rangeBand())
			.style("fill", function(d) {
				return z(d.count);
			})
			;

		$("#"+chartId+" .legend").empty();

		// Add a legend for the color values.
		var legend = svg.selectAll(".legend")
			.data(z.ticks(6).slice(1).reverse())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) {
				return "translate(" + (width + 20) + "," + (20 + i * 20) + ")";
			});

		legend.append("rect")
			.attr("width", 20)
			.attr("height", 20)
			.style("fill", z);

		legend.append("text")
			.attr("x", 26)
			.attr("y", 10)
			.attr("dy", ".35em")
			.text(String);

		svg.append("text")
			.attr("class", "label")
			.attr("x", width + 20)
			.attr("y", 10)
			.attr("dy", ".35em")
			.text("Count");

		// Add an x-axis with label.
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.svg.axis().scale(x).orient("bottom"))
			.append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.attr("text-anchor", "end")
			.text(key2);

		// Add a y-axis with label.
		svg.append("g")
			.attr("class", "y axis")
			.call(d3.svg.axis().scale(y).orient("left"))
			.append("text")
			.attr("class", "label")
			.attr("y", 6)
			.attr("dy", ".71em")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-90)")
			.text(key1);
	});

	function titleDrag(d) {
				var x = d3.event.x;
				var y = d3.event.y;
				var chartDiv = document.getElementById(chartId);
				var top = chartDiv.offsetTop;
				var left = chartDiv.offsetLeft - width / 2;
				chartDiv.setAttribute("style", "position:absolute; TOP:" + (top + y) + "px; LEFT:" + (left + x) + "px;" + setChartDivStyle);
				chartMoved(chartId);
			}

			var drag = d3.behavior.drag()
				.on("drag", titleDrag);

			if (d3.select(chartNum).selectAll(".chart-title").size() == 0) {
				d3.select(chartNum)
					.append("text")
					.attr("x", width / 2)
					.attr("y", 11)
					.attr("text-anchor", "middle")
					.attr("class", "chart-title")
					.text(chartId + " (" + key1 + "/" + key2 + ")")
					.call(drag);
			}

}

function createHeatmap(chartId,key1, key2) {
	createHeatmapFromKey(chartId, key1, key2, {});
	charts[chartId] = [key1, key2];
}

function heatmapId(d, chartId, key1, key2) {
	return HEATMAP_PREFIX+chartId+"-"+d[key1]+"-"+d[key2];
}

function onTileSelection(chartId, tile, key1, key2, val1, val2) {
	var isSelected;
	if (chartId in selected) {
		isSelected = !(selected[chartId].val.indexOf(val1) != -1) || !(selected[chartId].val.indexOf(val2) != -1);
	} else {
		isSelected = true;
	}

	deselectSelected(chartId);

	if (isSelected) {

		if (chartId in selected) {
			for (var i = 0; i < chartConnections[chartId].length; i++) {
				propogateDeselectionDownwards(chartConnections[chartId][i], selected[chartId].key[0], selected[chartId].val[0]);
				propogateDeselectionDownwards(chartConnections[chartId][i], selected[chartId].key[1], selected[chartId].val[1]);
			}
		}

		emphasizeSelectedTile(chartId, tile, key1, key2, val1, val2);
	} else {
		delete selected[chartId];
	}

	//Find all those charts downstream to current chart
	for (var charti = 0; charti < chartConnections[chartId].length; charti++) {
		var chartId2 = chartConnections[chartId][charti];
		filterDownstreamChart(chartId, chartId2, key1, val1, isSelected);
		filterDownstreamChart(chartId, chartId2, key2, val2, isSelected);
	}
}

function onBarSelection(chartId, bar, key, val) {
	//Determine whether the bar is being selected or deselected
	var isSelected;
	if (chartId in selected) {
		isSelected = selected[chartId].val != val;
	} else {
		isSelected = true;
	}

	deselectSelected(chartId);

	if (isSelected) {

		if (chartId in selected) {
			for (var i = 0; i < chartConnections[chartId].length; i++) {
				propogateDeselectionDownwards(chartConnections[chartId][i], selected[chartId].key, selected[chartId].val);
			}
		}

		//Return previously selected bar to red color
		emphasizeSelectedBar(chartId, bar, key, val);
	} else {
		delete selected[chartId];
	}

	//Find all those charts downstream to current chart
	for (var charti = 0; charti < chartConnections[chartId].length; charti++) {
		var chartId2 = chartConnections[chartId][charti];
		filterDownstreamChart(chartId, chartId2, key, val, isSelected);
	}
}

function filterDownstreamChart(chartId, chartId2, key, val, isSelected) {
	//var chart2Key = charts[chartId2];

	//Add currently selected item to filter of downstream chart
	var filter;
	if (!(chartId2 in filters)) {
		filters[chartId2] = {};
	}
	filter = filters[chartId2];

	//prevent infinite loops if charts are parents and children of each other
	if (isSelected && filter[key] == val) {
		//return;
	}
	if (isSelected) {
		propogateFiltersDownward(chartId, chartId2, key, val);
	} else {
		propogateDeselectionDownwards(chartId2, key, val);
	}

	propogateGraphCreationDownwards(chartId2);
}

function propogateGraphCreationDownwards(chartId) {
	for (var i = 0; i < chartConnections[chartId].length; i++) {
		var chartId2 = chartConnections[chartId][i];
		propogateGraphCreationDownwards(chartId2);
	}

	var filter = filters[chartId];
	var key = charts[chartId];

	if (key != "") {
		if (Array.isArray(key)) {
			createHeatmapFromKey(chartId, key[0], key[1], filter);
		} else {
			createGraphFromKey(key, chartId, filter);
		}
	}
}

function propogateFiltersDownward(chartId, chartId2, key, val) {
	if (!(chartId2 in filters)) {
		filters[chartId2] = {};
	}
	filter = filters[chartId2];

	/* if (chartId == chartId2 || filter[key] == val) {
	     return;
	 }*/

	if (chartId == chartId2) {
		return;
	}

	for (var i = 0; i < chartConnections[chartId2].length; i++) {
		var chartId3 = chartConnections[chartId2][i];
		propogateFiltersDownward(chartId2, chartId3, key, val);
	}

	//make sure all filters that are applied to upstream chart get applied to downstream chart as well
	for (var filterKey in filters[chartId]) {
		//filter[filterKey] = filters[chartId][filterKey];
		if (filterKey in filter) {
			filter[filterKey].push(filters[chartId][filterKey]);
		} else {
			filter[filterKey] = [filters[chartId][filterKey]];
		}
	}

	if (key in filters[chartId2]) {
		filters[chartId2][key].push(val);
	} else {
		filters[chartId2][key] = [val];
	}
}

function propogateDeselectionDownwards(chartId, key, val) {
	if (!chartId in filters || !chartId in chartConnections) {
		return;
	}
	for (var i = 0; i < chartConnections[chartId].length; i++) {
		var chartId2 = chartConnections[chartId][i];
		propogateDeselectionDownwards(chartId2, key, val);
	}

	filters[chartId][key].splice(filters[chartId][key].indexOf(val), 1);
}

function emphasizeSelectedBar(chartId, bar, key, val) {
	selected[chartId] = {
		key: key,
		val: val,
		bar: bar,
		color: d3.select(bar).style("fill")
	};
	d3.select(bar).style("fill", "red");
}

function emphasizeSelectedTileIndependantly(chartId) {
	if (chartId in selected) {
		d3.select(selected[chartId].bar).style("fill", "red");
	}
}

function emphasizeSelectedTile(chartId, tile, key1, key2, val1, val2) {
	selected[chartId] = {
		key: [key1, key2],
		val: [val1, val2],
		bar: tile,
		color: d3.select(tile).style("fill")
	};
	d3.select(tile).style("fill", "red");
}

function deselectSelected(chartId) {
	if (chartId in selected) {
		d3.select(selected[chartId].bar).style("fill", selected[chartId].color);
	}
}