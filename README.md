# Javascript Implementation of Vizdom
### eweizman, Brown University, Fall 2015

#### Basic Usage Instructions
* Graph Creation
	* Drag out key button to create new graph
	* Drag out key button onto existing graph to create heatmap
* Canvas Organization
	* Drag around title to move graph
* Filtering
	* Drag body of graph onto another graph to make a filter connection
	* Click the and/or button in the top left-hand corner of the graph to change the way multiple filters are applied in relation to each other.
	* Click on a bar/tile to select a key/value pair and create a filter for all downstream charts
	* Ctrl-Click on a bar/tile for multi-select
* Graph Deletion
	* Drag body of graph to trash can to delete graph

To execute Vizdom, the project should be run within a web server due to javascript file restrictions within D3. A simple way to run a local server with python is the [SimpleHTTPServer module](https://docs.python.org/2/library/basehttpserver.html#BaseHTTPServer.BaseHTTPRequestHandler).

## Implementation Details 
##### *(last updated 12/28/15 by eweizman)*

### Libraries Used:
* [NVD3](http://nvd3.org/)
	* Library built on top of D3 for faster and simpler full-featured graph creation
		* However, only supports a small number of types of graphs
	* Used for bar graphs
* [D3](http://d3js.org/)
	* Low-level javascript visualization library
	* Used for heatmaps, as they were not supported by NVD3
* [JSPlumb](https://jsplumbtoolkit.com/)
	* Used to make connections between arrows
* [JQuery](https://jquery.com/)
	* For code simplicity and basic ease of implementation

### Structure

All relevant code is contained within *script.js*.

#### Graph Creation

Bar graphs are created when a button describing the the graph should be connected to is dragged out onto the canvas. The document body (which is the drop event listener) then creates a new graph with the given key.
Information is handed to the drag/drop events through the event's *dataTransfer* object.
Every new graph is made in a new div, with its own svg canvas within it. The id of the div is the id of the chart, which is just "chart" + *#of

#### Data Retrieval 

Right now, data retrieval is rudimentary in anticipation of connection to the back end. 

The source file from which data is retrieved is defined in the global variable *csv* in *script.js*. Currently, the code receives all data from *data/fakedata.csv*, which is filled with dummy data generated from *data/fakedatagen.py*. 

#### Filtering

All filters are held in *filters*, which is an associative array with the following structure:
{chartId1: {key1: [val1,val2,...]}}

##### Setting Filters via Data Selection

When a bar is selected, *onBarSelection* is called. If the control key was being held down, then multiselection mode is in effect. 
Multiselection works with the following rules:
* Multiselection off
	* Selected bar clicked on -> Deselection of all selected bars
	* Unselected bar clicked on -> Deselection of all selected bars + selection of clicked on bar
* Multiselection on
	* Selected bar clicked on -> Deselection of clicked on bar
	* Unselected bar clicked on -> Selection of clicked on bar

The key helper method for filtering is *filterDownstreamChart*, which recursively propogates the given key/value pair to all connected charts as a filter. *filterDownstreamChart* either propogates the filter downwards if the given key/value pair had been selected, or propogates the deselection downwards. 

To refresh a graph, the visual part of the graph is recreated using NVD3 or D3 (bar graphs/heatmaps respectively) taking the new filters into account. This is the functional purpose of *propogateGraphCreationDownwards*.



When a tile is selected, *onTileSelection* is called. It works very similarly to bar selection. The main difference is that for every tile, two filters are applied/removed to every downstream chart. This is because the two key/val pairs in each tile in a heatmap are treated as *independant filters*.

##### Filtering Data

D3 is used to apply filters to the data. This may need to change once the real data source has been hooked up to the front-end. Either that, or the back-end may need to mediate how much data it gives the front-end at once. 

There are two types of ways to combine filters - AND and OR. These can be gotten by using *getFilterType(chartId)*, which reads the displayed string directly from the AND/OR button in the upper left hand corner of the chart div and matches it to the filter identifiers. The filter identifiers are defined by var AND_FILTER and OR_FILTER.

Filtering happens in *applyFilters(key, chartId, data, filterKeys)*. Datapoints are excluded by returning 0 to a function passed to d3.sum. Filtering happens per key (i.e. appropriate values are and/or-ed across only their own keys).

## Extension Tips
Much of 

## Future Goals
* Connection to existing Vizdom backend
* Immediate visualization as the data loads
* Data analysis and display
	* Classifiers
* New chart types
	* Maps

## Known Issues
* jsPlumb.repaint has a bug, so when a chart is moved, jsPlumb.repaintEverything() is called. This is less efficient, but a reasonable solution for now. This is located in *chartMoved(chartId)*.