/*
    Multigraph class for Heriverse

    author: 3D Research s.r.l.

===========================================================*/
import EMUtils from "./EMutils.js";
import EMNode from "./EMnode.js";
import Period from "./period.js";
import HeriverseNode from "./HeriverseGraph/HeriverseNode.js";
/**
Class representing a Multigraph
@class Multigraph
@example 
new Heriverse.Multigraph()
*/

export default class Multigraph {
	constructor(mdgraph) {
		this._id = -1;
		this.mdgraph = mdgraph;
		this._jsonGraph = undefined;
		this.timeline = [];
		this.representationNodes = {};
		this.panoramaNodes = {};
		this.proxyNodes = {};
		this.stratigraphicNodes = {};
		this.EMnodes = {};
		this.pathproxies = " ";
		this.realize();
	}

	setBaseFolder(basepath) {
		if (basepath === undefined) return;

		this.basepath = basepath;
		this.pathproxies = basepath + "/proxies/";
		this.pathdosco = basepath + "/dosco/";
		this.pathmodels = basepath + "/models/";
		this.pathjson = basepath + "/project.json";
	}

	parseGraphJSON(onSuccess, onFail) {
		self = this;
		if (this._jsonGraph) {
			this.readTimeline(this._jsonGraph.nodes.epochs);
			onSuccess();
		} else {
			$.getJSON(this.pathjson, (json) => {
				this.readTimeline(json.graphs[Object.keys(json.graphs)[0]].nodes.epochs);
				this._jsonGraph = json;
			})
				.done(function () {
					if (onSuccess) {
						onSuccess();
					}
				}, "text")
				.fail(() => {
					console.log("ERROR Loading EM JSON");
					if (onFail) onFail();
				});
		}
	}

	addEpoch(key, min, max, start, end, color, graph) {
		this._jsonGraph.context.epochs[key] = {
			min: min,
			max: max,
			start: start,
			end: end,
			color: color,
			graph: graph,
		};
	}

	addNode(id, type, name, description, author, url, url_type, time_start, time_end, graph) {
		if (!this._jsonGraph.graphs) {
			this._jsonGraph.graphs = {};
		}

		if (!this._jsonGraph.graphs[graph]) {
			this._jsonGraph.graphs[graph] = {};
		}

		if (!this._jsonGraph.graphs[graph].nodes) {
			this._jsonGraph.graphs[graph]["nodes"] = {};
		}
		if (!this._jsonGraph.graphs[graph].edges[type]) {
			this._jsonGraph.graphs[graph].edges[type] = [];
		}
		let dataNode = {
			description: description,
			url: url,
			url_type: url_type,
		};
		if (time_start) {
			dataNode["time_start"] = time_start;
		}
		if (time_end) {
			dataNode["time_end"] = time_end;
		}

		if (author) {
			dataNode["author"] = author;
		}

		let newNode = {
			name: name,
			type: type,
			data: dataNode,
		};

		this._jsonGraph.graphs[graph].nodes[id] = newNode;
	}

	addEdge(type, from, to, graph) {
		if (!this._jsonGraph.graphs) {
			this._jsonGraph.graphs = {};
		}

		if (!this._jsonGraph.graphs[graph]) {
			this._jsonGraph.graphs[graph] = {};
		}

		if (!this._jsonGraph.graphs[graph].edges) {
			this._jsonGraph.graphs[graph]["edges"] = {};
		}
		if (!this._jsonGraph.graphs[graph].edges[type]) {
			this._jsonGraph.graphs[graph].edges[type] = [];
		}
		let newEdge = { from: from, to: to };
		this._jsonGraph.graphs[graph].edges[type].push(newEdge);
	}

	//Read Timeline from JSON
	readTimeline() {
		let epochs = this.mdgraph.getNodes("epoch");
		this.timeline = [];
		for (let epoch in epochs) {
			this.timeline.push(
				new Period(epoch, epochs[epoch].name, 0, 0, epochs[epoch].graph)
					.setMin(epochs[epoch].data.start_time)
					.setMax(epochs[epoch].data.end_time)
					.setColor(new THREE.Color(epochs[epoch].data.color))
			);
		}
		this.timeline.sort(EMUtils.comparePeriod);
	}

	getPeriod(id) {
		if (!this.timeline) return undefined;
		let numPeriods = this.timeline.length;

		for (let p = 0; p < numPeriods; p++) {
			if (this.timeline[p].id === id) return this.timeline[p];
		}

		return undefined;
	}

	getPeriodFromName(nameid) {
		if (!this.timeline) return undefined;
		let numPeriods = this.timeline.length;

		for (let p = 0; p < numPeriods; p++) {
			if (this.timeline[p].name === nameid) return this.timeline[p];
		}

		return undefined;
	}

	getPanoramaUrlFromPeriod(id) {
		let panorama = this.mdgraph.panorama;
		let epoch = this.mdgraph.getNode(id);
		if (epoch) {
			let panos = Object.values(epoch.getNeighborsByType(HeriverseNode.NODE_TYPE.PANORAMA_MODEL));
			let pano = null;
			if (panos.length > 0) {
				pano = panos[0];
			}
			if (pano && pano.data && pano.data.url) {
				panorama = pano.data.url;
			}
		}
		return panorama;
	}

	getEpoch(id) {
		if (!this.timeline) return undefined;
		let numPeriods = this.timeline.length;

		for (let p = 0; p < numPeriods; p++) {
			if (this.timeline[p].id === id) return this.timeline[p];
		}

		return undefined;
	}

	getPeriodIndexFromName(nameid) {
		if (!this.timeline) return undefined;
		let numPeriods = this.timeline.length;

		for (let p = 0; p < numPeriods; p++) {
			if (this.timeline[p].name === nameid) return p;
		}

		return undefined;
	}

	checkPeriodFromTime(start_t, end_t) {
		let numPeriods = this.timeline.length;
		for (let p = 0; p < numPeriods; p++) {
			let period = this.timeline[p];
			if (period.min <= start_t && start_t <= period.max) {
				return true;
			}
			if (period.min <= end_t && end_t <= period.max) {
				return true;
			}
			if (period.min >= start_t && period.max <= end_t) {
				return true;
			}
		}
		return false;
	}

	getPeriodIndexFromTime(start_t, end_t) {
		if (!this.timeline) return undefined;
		this.checkPeriodFromTime(start_t, end_t);
		let numPeriods = this.timeline.length;
		let start = 0;
		let end = numPeriods - 1;
		for (let p = 0; p < numPeriods; p++) {
			if (start_t > this.timeline[p].max) {
				if (p < numPeriods - 1) start = p + 1;
			}
			if (end_t < this.timeline[p].min) {
				if (p > 0) {
					end = p - 1;
					break;
				}
			}
		}
		//return (numPeriods-1);
		return [start, end];
	}

	//Popolare le epoche
	//Trovare tramite generic_connection tutti i reppresentation models e inserirli nelle epoche giuste
	//Trovare tramite has_first_epoch e survive_in_epoch le unità stratigrafiche e inserirli nelle rispettive epoche

	readAll() {
		let rnodes = this.mdgraph.getNodes();
		for (let id in rnodes) {
			if (rnodes[id].graph !== "shelf") this.EMnodes[id] = rnodes[id];
		}
	}

	getNode(id) {
		return this.EMnodes[id];
	}

	readRepresentationNodes() {
		let rnodes = this.mdgraph.getNodes("representation_model");
		for (let id in rnodes) {
			this.representationNodes[id] = rnodes[id];
		}
	}

	readSemanticShapes() {
		let rnodes = this.mdgraph.getStratigraphicNodes();
		for (let id in rnodes) {
			this.stratigraphicNodes[id] = rnodes[id];
		}
	}

	readPanoramaNodes() {
		let rnodes = this.mdgraph.getNodes(HeriverseNode.TYPE.PANORAMA_MODELS);
		for (let id in rnodes) {
			this.panoramaNodes[id] = rnodes[id];
		}
	}

	createNodeGraph(key, node) {
		this.EMnodes[key] = node;
	}

	realize() {
		this.readAll();
		this.readTimeline();
		this.readRepresentationNodes();
		this.readSemanticShapes();
		this.readPanoramaNodes();
	}

	realizeProxyGraphFromJSON() {
		this.MultidimensionalGraph.readJson(this.realize);

		return;
	}

	getSourceGraphByProxyID(id) {
		for (let i in this.EMnodes) {
			let xn = this.EMnodes[i];
			if (xn.name === id) return xn;
		}
		return undefined;
	}

	buildEMgraphFromJSON() {
		let edge_types = this._jsonGraph.graphs[Object.keys(this._jsonGraph.graphs)[0]].edges;
		for (const edgeType in edge_types) {
			let edges = edge_types[edgeType];
			if (edgeType == "generic_connection") {
				for (let edge in edges) {
					for (let i = 0; i < this.timeline.length; i++) {
						let e = edges[edge];
						if (this.timeline[i].id == e.to) {
							if (this.EMnodes[e.from]) {
								if (this.EMnodes[e.from].children == null) {
									this.EMnodes[e.from].children = {};
								}
								this.EMnodes[e.from].children[e.to] = this.timeline[i];
								this.addRepresentationModel(this.EMnodes[e.from], this.timeline[i].id);
							}
						}
					}
				}
			}
			if (edgeType == "has_first_epoch" || edgeType == "survive_in_epoch") {
				for (let edge in edges) {
					for (let i = 0; i < this.timeline.length; i++) {
						let e = edges[edge];
						if (this.timeline[i].name == e.to) {
							if (this.EMnodes[e.from]) {
								if (this.EMnodes[e.from].children == null) {
									this.EMnodes[e.from].children = {};
								}
								this.EMnodes[e.from].children[e.to] = this.timeline[i];
								this.addSemanticShape(this.EMnodes[e.from], this.timeline[i].name);
							}
						}
					}
				}
			}
		}

		return;
	}

	buildContinuity() {
		return;
	}

	buildRec() {
		for (let p in this.timeline) {
			let pname = this.timeline[p].name;

			let pnamerec = pname + " Rec";

			let currGroup = ATON.getSemanticNode(pname);
			let recGroup = ATON.getSemanticNode(pnamerec);

			if (currGroup && recGroup) {
				for (let c in currGroup.children) {
					let proxNode = currGroup.children[c];

					let EMdata = proxNode.userData.EM;
					EMdata.periods[pnamerec] = true;
				}
			}
		}
	}
}
