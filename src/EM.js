/*
    Extended Matrix class for EMviq

    author: bruno.fanini_AT_gmail.com

===========================================================*/
import EMUtils from "./EMutils.js";
import EMNode from "./EMnode.js";
import Period from "./period.js";

/**
Class representing a single Extended Matrix
@class EM
@example 
new Heriverse.EM()
*/

export default class EM {
	constructor(basepath) {
		this._id = -1;
		this._jsonGraph = undefined;
		this.timeline = [];
		this.proxyNodes = {};
		this.EMnodes = {};

		this.setBaseFolder(basepath);
	}

	setBaseFolder(basepath) {
		if (basepath === undefined) return;

		this.basepath = basepath;
		this.pathproxies = basepath + "/proxies/";
		this.pathjson = basepath + "/em.json";
		this.pathcollection = basepath;
		this.pathcollection = this.pathcollection.replace("scenes", "collections");
	}

	parseGraphJSON(onSuccess, onFail) {
		self = this;
		if (this._jsonGraph) {
			this.readTimeline(this._jsonGraph.context.epochs);
			onSuccess();
		} else {
			$.getJSON(this.pathjson, (json) => {
				this.readTimeline(json.context.epochs);
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

	addEpoch(key, min, max, start, end, color) {
		this._jsonGraph.context.epochs[key] = {
			min: min,
			max: max,
			start: start,
			end: end,
			color: color,
		};
	}

	addNode(id, type, name, description, author, url, url_type, time_start, time_end) {
		if (!this._jsonGraph.graphs) {
			this._jsonGraph.graphs = {};
		}

		if (!this._jsonGraph.graphs.graph1) {
			this._jsonGraph.graphs["graph1"] = {};
		}

		if (!this._jsonGraph.graphs.graph1.nodes) {
			this._jsonGraph.graphs.graph1["nodes"] = {};
		}
		if (!this._jsonGraph.graphs.graph1.edges[type]) {
			this._jsonGraph.graphs.graph1.edges[type] = [];
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

		this._jsonGraph.graphs.graph1.nodes[id] = newNode;
	}

	addEdge(type, from, to) {
		if (!this._jsonGraph.graphs) {
			this._jsonGraph.graphs = {};
		}

		if (!this._jsonGraph.graphs.graph1) {
			this._jsonGraph.graphs["graph1"] = {};
		}

		if (!this._jsonGraph.graphs.graph1.edges) {
			this._jsonGraph.graphs.graph1["edges"] = {};
		}
		if (!this._jsonGraph.graphs.graph1.edges[type]) {
			this._jsonGraph.graphs.graph1.edges[type] = [];
		}
		let newEdge = { from: from, to: to };
		this._jsonGraph.graphs.graph1.edges[type].push(newEdge);
	}

	//Read Timeline from JSON
	readTimeline(epochs) {
		this.timeline = [];
		for (let epoch in epochs) {
			this.timeline.push(
				new Period(epoch)
					.setMin(epochs[epoch].start)
					.setMax(epochs[epoch].end)
					.setColor(new THREE.Color(epochs[epoch].color))
			);
		}
		this.timeline.sort(EMUtils.comparePeriod);

		this.timeline.forEach((p) => {
			let pGroup = ATON.createSemanticNode(p.name);
			pGroup.attachToRoot();

			EMUtils.getOrCreateEMData(pGroup).pcolor = p.color;
		});
	}

	getPeriodFromName(nameid) {
		if (!this.timeline) return undefined;
		let numPeriods = this.timeline.length;

		for (let p = 0; p < numPeriods; p++) {
			if (this.timeline[p].name === nameid) return this.timeline[p];
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

	realizeProxyGraphFromJSON() {
		let nodes = this._jsonGraph.graphs.graph1.nodes;
		for (let node in nodes) {
			let typeString = nodes[node].type.toUpperCase();
			let type = Heriverse.NODETYPES[typeString];
			let name = nodes[node].name;
			let start_t = nodes[node].data.time;
			let end_t = nodes[node].data.end_time;
			let url = nodes[node].url;
			let fields = nodes[node].data;
			let periods = this.getPeriodIndexFromTime(start_t, end_t);
			if (periods[1] < periods[0]) periods[1] = periods[0];
			let bProxyNode = false;
			if (this.pathproxies && name) {
				let periodNameStart = undefined;
				let periodNameEnd = undefined;
				//let periodColor = undefined;
				//let periodTexture = undefined;

				if (this.timeline[periods[0]]) {
					periodNameStart = this.timeline[periods[0]].name;
					periodNameEnd = this.timeline[periods[0]].name;
				}
				if (this.timeline[periods[1]]) {
					periodNameEnd = this.timeline[periods[1]].name;
				}
				if (
					type === Heriverse.NODETYPES.SPECIALSPECIALFIND ||
					type === Heriverse.NODETYPES.US ||
					type === Heriverse.NODETYPES.USVN ||
					type === Heriverse.NODETYPES.USVS
				) {
					bProxyNode = true;
					if (periodNameStart) {
						let semNode = null;
						if (url) {
							semNode = ATON.createSemanticNode(name).load(url);
						} else {
							semNode = ATON.createSemanticNode(name).load(this.pathproxies + name + ".gltf");
						}
						semNode.setDefaultAndHighlightMaterials(
							Heriverse.matProxyOFF[type],
							Heriverse.matProxyON[type]
						);
						semNode.setMaterial(Heriverse.matProxyOFF[type]);

						let EMdata = EMUtils.getOrCreateEMData(semNode);
						EMdata.isProxy = true;
						EMdata.type = type;
						EMdata.time = start_t;
						EMdata.period = periodNameStart;
						EMdata.endPeriod = periodNameEnd;
						for (let i = 0; i < this.timeline.length; i++) {
							if (i >= periods[0] && i <= periods[1]) {
								EMdata.periods[this.timeline[i].name] = true;
							}
						}

						EMdata.description = fields.description;
						EMdata.url = fields.url;
						this.proxyNodes[name] = semNode;
					}
				}
				if (type) {
					let EMkey = node;

					this.EMnodes[EMkey] = new EMNode();
					this.EMnodes[EMkey].type = type;
					this.EMnodes[EMkey].time = start_t;

					this.EMnodes[EMkey].label = name;
					this.EMnodes[EMkey].description = fields.description;
					this.EMnodes[EMkey].url = fields.url;
					if (type == Heriverse.NODETYPES.PROPERTY && (name == "start" || name == "end")) {
						this.EMnodes[EMkey].timeStart = nodes[node].data.time_start;
						this.EMnodes[EMkey].timeEnd = nodes[node].data.time_end;
					}
				}
			}
		}
	}

	getSourceGraphByProxyID(id) {
		for (let i in this.EMnodes) {
			let xn = this.EMnodes[i];
			if (xn.label === id) return xn;
		}
		return undefined;
	}

	buildEMgraphFromJSON() {
		let edges = this._jsonGraph.graphs.graph1.edges;
		if (!edges) return;
		let dashed = 0;
		for (let i = 0; i < edges.dashed.length; i++) {
			let sourceNode = this.EMnodes[edges.dashed[i].from];
			let targetNode = this.EMnodes[edges.dashed[i].to];
			if (sourceNode !== undefined && targetNode !== undefined) {
				sourceNode.addChild(targetNode, "dashed");
				dashed++;
			}
		}

		//line
		let line = 0;
		for (let i = 0; i < edges.line.length; i++) {
			let sourceNode = this.EMnodes[edges.line[i].from];
			let targetNode = this.EMnodes[edges.line[i].to];
			if (sourceNode !== undefined && targetNode !== undefined) {
				sourceNode.addChild(targetNode, "line");
				line++;
			}
			if (targetNode && sourceNode && targetNode.label && targetNode.label == "start") {
				sourceNode.timeStart = targetNode.timeStart;
			}
			if (targetNode && sourceNode && targetNode.label && targetNode.label == "end") {
				sourceNode.timeEnd = targetNode.timeEnd;
			}
			if (sourceNode && sourceNode.timeStart && sourceNode.timeEnd) {
				let periods = this.getPeriodIndexFromTime(sourceNode.timeStart, sourceNode.timeEnd);
				if (periods[1] < periods[0]) periods[1] = periods[0];
				let periodNameStart = undefined;
				let periodNameEnd = undefined;
				let type = sourceNode.type;
				if (this.timeline[periods[0]]) {
					periodNameStart = this.timeline[periods[0]].name;
					periodNameEnd = this.timeline[periods[0]].name;
				}
				if (this.timeline[periods[1]]) {
					periodNameEnd = this.timeline[periods[1]].name;
				}
				let semNode = null;
				if (sourceNode.url) {
					semNode = ATON.createSemanticNode(sourceNode.label).load(sourceNode.url);
				} else {
					semNode = ATON.createSemanticNode(sourceNode.label).load(
						this.pathproxies + sourceNode.label + ".gltf"
					);
				}

				semNode.setDefaultAndHighlightMaterials(
					Heriverse.matProxyOFF[type],
					Heriverse.matProxyON[type]
				);
				semNode.setMaterial(Heriverse.matProxyOFF[type]);
				semNode.attachTo(periodNameStart);
				let EMdata = EMUtils.getOrCreateEMData(semNode);

				EMdata.period = periodNameStart;
				EMdata.endPeriod = periodNameEnd;
				for (let i = 0; i < this.timeline.length; i++) {
					if (i >= periods[0] && i <= periods[1]) {
						EMdata.periods[this.timeline[i].name] = true;
					}
				}
			}
		}
	}

	buildContinuity() {
		for (let n in this.EMnodes) {
			let N = this.EMnodes[n];

			if (N.type === Heriverse.NODETYPES.CONTINUITY) {
				let T = N.children[0];
				let iend = this.getPeriodIndexFromName(N.period);

				if (T && iend) {
					let istart = this.getPeriodIndexFromName(T.period);

					let proxyid = T.label;

					for (let p = istart + 1; p <= iend; p++) {
						let period = this.timeline[p].name;

						let semNode = ATON.getSemanticNode(proxyid);

						let EMdata = semNode.userData.EM;
						EMdata.periods[period] = true;
					}
				}
			}
		}
	}

	buildRec() {
		for (let p in this.timeline) {
			let pname = this.timeline[p].name;

			let pnamerec = pname + " Rec";

			let currGroup = ATON.getSemanticNode(pname);
			let recGroup = ATON.getSemanticNode(pnamerec);

			if (currGroup && recGroup) {
				for (let c in currGroup.children) {
					//recGroup.add(currGroup.children[c]);
					let proxNode = currGroup.children[c];

					let EMdata = proxNode.userData.EM;
					EMdata.periods[pnamerec] = true;
					//EMUtils.assignProxyNodeToPeriod(proxNode, pnamerec);
				}
			}
		}
	}
}
