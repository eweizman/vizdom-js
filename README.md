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
* Graph Deletion
	* Drag body of graph to trash can to delete graph

## Implementation Details 
##### *(last updated 12/11/15 by eweizman)*

###Libraries Used:
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

Right now the code receives all data from *data/fakedata.csv*, which is filled with dummy data generated from *data/fakedatagen.py*. The source file is defined in the global variable csv in *script.js*.

All relevant code is contained within *script.js*.

## Known Issues
* Cascading filtering w/ heatmaps