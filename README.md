# Javascript Implementation of Vizdom
### eweizman, Fall 2015

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

## Implementation Details 
##### *(last updated 12/13/15 by eweizman)*

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
Every new graph is made in a new div, with its own svg canvas within it.

#### Data Retrieval 

Right now, data retrieval is rudimentary in anticipation of connection to the back end. 

The source file from which data is retrieved is defined in the global variable *csv* in *script.js*. Currently, the code receives all data from *data/fakedata.csv*, which is filled with dummy data generated from *data/fakedatagen.py*. 

#### Filtering

All filters are held in *filters*, which is an associative array with the following structure:
{chartId1: {key1: [val1,val2,...]}}

##### Setting Filters via Data Selection

When a bar is selected, onBarSelection is called. If the control key was being held down, then multiselection mode is in effect. 
Multiselection works with the following rules:
* Multiselection off
	* Selected bar clicked on -> Deselection of all selected bars
	* Unselected bar clicked on -> Deselection of all selected bars + selection of clicked on bar
* Multiselection on
	* Selected bar clicked on -> Deselection of clicked on bar
	* Unselected bar clicked on -> Selection of clicked on bar

When a tile is selected, onTileSelection is called. It works very similarly to bar selection. The main difference is that for every tile, two filters are applied/removed to every downstream chart.

##### Filtering Data

Filters are passed down to downstream charts recursively.

## Future Goals
* New chart types
	* Maps

## Known Issues
* Cascading deselection of filters w/ heatmaps
* jsPlumb.repaint has a bug, so when a chart is moved, jsPlumb.repaintEverything() is called. This is less efficient, but a reasonable solution for now. This is located in *chartMoved(chartId)*.