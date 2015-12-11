# Javascript Implementation of Vizdom
### eweizman, Fall 2015

#### Basic Usage Instructions
* Drag out key button to create new graph
* Drag around title to move graph
* Drag body of graph onto another graph to make a filter connection
* Drag body of graph to trash can to delete graph
* Drag out key button onto existing graph to create new graph

## Implementation Details *(last updated 12/11/15 by eweizman)*

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
