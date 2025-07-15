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
export default class ML2JSON {
	constructor(basepath) {
		this._id = -1;
		this._jxRoot = undefined;

		this.timeline = [];
		this.proxyNodes = {};
		this.EMnodes = {};
		this.JSONNode = [];
		this.JSON = {};
		this.JSON["context"] = {};
		this.JSON["graphs"] = {};
		this.setBaseFolder(basepath);
	}

	setBaseFolder(basepath) {
		if (basepath === undefined) return;

		this.basepath = basepath;
		this.pathproxies = basepath + "/proxies/";
		this.pathgraphml = basepath + "/em.graphml";
	}

	parseGraphML(onSuccess, onFail) {
		self = this;

		$.get(
			this.pathgraphml,
			(xml) => {
				let jx = Heriverse.x2js.xml_str2json(xml);
				let headnode = jx.graphml.graph.node;

				let tnode = self.findDataWithKey(headnode, Heriverse.YED_dNodeGraphics);
				if (tnode) this.buildTimeline(tnode.TableNode);

				self._jxRoot = headnode.graph;
				self._mainGMLRoot = jx.graphml.graph;

				if (onSuccess) onSuccess();
			},
			"text"
		).fail(() => {
			console.log("ERROR Loading EM GraphML");
			if (onFail) onFail();
		});
	}

	getAttribute(node, attrname) {
		if (!node) return undefined;
		return node["@" + attrname];
	}

	findDataWithKey(node, keyvalue) {
		var data = node.data;
		if (!data) return undefined;

		if (Array.isArray(data)) {
			if (data[0] && this.getAttribute(data[0], "key") === keyvalue) return data[0];
			if (data[1] && this.getAttribute(data[1], "key") === keyvalue) return data[1];
			if (data[2] && this.getAttribute(data[2], "key") === keyvalue) return data[2];
		} else if (this.getAttribute(data, "key") === keyvalue) return data;
	}

	getNodeTime(node) {
		if (!node.data) return undefined;

		var d = this.findDataWithKey(node, Heriverse.YED_dNodeGraphics);

		var G = d.GenericNode || d.ShapeNode || d.SVGNode;
		if (!G) return undefined;

		G = G.Geometry;
		if (!G) return undefined;

		var t = parseFloat(this.getAttribute(G, "y"));
		return -t;
	}

	getNodeShape(node) {
		if (!node.data) return undefined;

		var d = this.findDataWithKey(node, Heriverse.YED_dNodeGraphics);

		if (!d.ShapeNode) return undefined;
		var s = d.ShapeNode.Shape;

		if (!s) return undefined;

		return this.getAttribute(s, "type");
	}

	getNodeFields(node) {
		let R = {
			xmlID: undefined,
			description: undefined,
			url: undefined,
			label: undefined,
		};

		let attrID = this.getAttribute(node, "id");
		if (attrID) {
			R.xmlID = String(attrID);
		}

		let du = this.findDataWithKey(node, Heriverse.YED_dAttrURL);
		if (du && du.__cdata) {
			R.url = du.__cdata;
		}

		let dd = this.findDataWithKey(node, Heriverse.YED_dAttrDesc);
		if (dd) R.description = String(dd.__cdata);

		let dl = this.findDataWithKey(node, Heriverse.YED_dNodeGraphics);
		if (dl) {
			let bSwimlane = false;
			let m = dl.GenericNode || dl.SVGNode || dl.ShapeNode;
			if (!m && dl.TableNode) {
				m = dl.TableNode;
				bSwimlane = true;
			}

			if (!bSwimlane && m) {
				m = m.NodeLabel;
				if (m) R.label = m.toString();
			}
		}

		return R;
	}

	getNodeType(node) {
		if (!node.data) return undefined;

		let d = this.findDataWithKey(node, Heriverse.YED_dNodeGraphics);
		let dd = this.findDataWithKey(node, Heriverse.YED_dAttrDesc);

		if (!d) return undefined;

		if (dd && dd.__cdata) {
			if (dd.__cdata === "_continuity") return Heriverse.NODETYPES.CONTINUITY;
		}

		if (d.ShapeNode) {
			let s = d.ShapeNode.Shape;

			if (!s) return undefined;

			let a = this.getAttribute(s, "type");
			if (a === Heriverse.YED_sSeriation) return Heriverse.NODETYPES.SERIATION;
			if (a === Heriverse.YED_sSF) return Heriverse.NODETYPES.SPECIALFIND;
			if (a === Heriverse.YED_sUS) return Heriverse.NODETYPES.US;
			if (a === Heriverse.YED_sUSVN) return Heriverse.NODETYPES.USVN;
			if (a === Heriverse.YED_sUSVS) return Heriverse.NODETYPES.USVS;
		}

		if (d.GenericNode) {
			let sp = d.GenericNode.StyleProperties;
			if (!sp) return undefined;

			sp = this.getAttribute(sp.Property[3], "value");
			if (!sp) return undefined;

			if (sp != "ARTIFACT_TYPE_ANNOTATION") return Heriverse.NODETYPES.DOCUMENT;
			if (sp === "ARTIFACT_TYPE_ANNOTATION") return Heriverse.NODETYPES.PROPERTY;
		}

		if (d.SVGNode) {
			let M = d.SVGNode.SVGModel;
			if (!M) return undefined;
			if (!M.SVGContent) return undefined;

			M = parseInt(this.getAttribute(M.SVGContent, "refid"));
			if (M === 1) return Heriverse.NODETYPES.EXTRACTOR;
			if (M === 2) return Heriverse.NODETYPES.COMBINER;
		}

		return undefined;
	}

	buildTimeline(tablenode) {
		var g = tablenode.Geometry;
		if (!g) return;

		let yStart = parseFloat(this.getAttribute(g, "y"));

		let nodelabels = tablenode.NodeLabel;
		if (!nodelabels) return;

		let TL = {};
		this.timeline = [];

		for (let i = 0; i < nodelabels.length; i++) {
			let L = nodelabels[i];

			let pstr = L.toString().trim();

			let strID = undefined;
			if (i > 0) strID = "row_" + (i - 1);

			let tMid = parseFloat(this.getAttribute(L, "y"));
			tMid += 0.5 * parseFloat(this.getAttribute(L, "width"));

			let pColorHex = this.getAttribute(L, "backgroundColor");

			if (strID) {
				TL[strID] = {};
				TL[strID].name = pstr;
				TL[strID].min = tMid + yStart;
				TL[strID].max = tMid + yStart;

				if (pColorHex) TL[strID].color = new THREE.Color(pColorHex);
			}
		}

		if (!tablenode.Table || !tablenode.Table.Rows || !tablenode.Table.Rows.Row) return;
		var spantable = tablenode.Table.Rows.Row;

		for (let r = 0; r < spantable.length; r++) {
			var row = spantable[r];

			var rID = this.getAttribute(row, "id");
			var h = 0.5 * parseFloat(this.getAttribute(row, "height"));

			if (TL[rID]) {
				TL[rID].min += h;
				TL[rID].max -= h;

				TL[rID].min = -TL[rID].min;
				TL[rID].max = -TL[rID].max;

				this.timeline.push(
					new Period(TL[rID].name).setMin(TL[rID].min).setMax(TL[rID].max).setColor(TL[rID].color)
				);
			}
		}

		this.timeline.sort(EMUtils.comparePeriod);
		let epochs = {};
		this.timeline.forEach((p) => {
			epochs[p.name] = {
				min: p.min,
				max: p.max,
				color: "#" + p.color.getHexString(),
			};
		});
		this.JSON["context"]["epochs"] = epochs;
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

	getPeriodIndexFromTime(t) {
		if (!this.timeline) return undefined;
		let numPeriods = this.timeline.length;

		for (let p = 0; p < numPeriods; p++) {
			if (this.timeline[p].min < t && t < this.timeline[p].max) return p;
		}

		return undefined;
	}
	getNodeTypeName = (value) => {
		for (const key in Heriverse.NODETYPES) {
			if (Heriverse.NODETYPES[key] === value) {
				return key;
			}
		}
		return null;
	};

	realizeProxyGraphFromJSONNode(graphnode) {
		if (this.JSON.graphs.graph1 == null) {
			this.JSON.graphs["graph1"] = {};
			this.JSON.graphs.graph1.nodes = {};
		}
		let nodes;
		if (!graphnode) nodes = this._jxRoot.node;
		else nodes = graphnode.node;

		for (let i = 0; i < nodes.length; i++) {
			let n = nodes[i];
			let bProxyNode = false;
			if (n.graph) {
				this.realizeProxyGraphFromJSONNode(n.graph);
			}

			let type = this.getNodeType(n);
			let t = this.getNodeTime(n);
			let fields = this.getNodeFields(n);

			let pid = this.getPeriodIndexFromTime(t);
			if (this.pathproxies && fields.label) {
				let periodName = undefined;

				if (this.timeline[pid]) {
					periodName = this.timeline[pid].name;
				}

				if (
					type === Heriverse.NODETYPES.SPECIALFIND ||
					type === Heriverse.NODETYPES.US ||
					type === Heriverse.NODETYPES.USVN ||
					type === Heriverse.NODETYPES.USVS
				) {
					bProxyNode = true;
				}

				if (type && periodName && fields.xmlID) {
					let EMkey = fields.xmlID;

					this.EMnodes[EMkey] = new EMNode();
					this.EMnodes[EMkey].type = type;
					this.EMnodes[EMkey].time = t;
					this.EMnodes[EMkey].period = periodName;

					this.EMnodes[EMkey].label = fields.label;
					this.EMnodes[EMkey].description = fields.description;
					this.EMnodes[EMkey].url = fields.url;

					let na = fields.label ? fields.label : "";
					this.JSON.graphs.graph1.nodes[EMkey] = {
						type: this.getNodeTypeName(type),
						name: na,
						data: {
							description: fields.description,
							epochs: [periodName],
							url: fields.url,
							time: t,
						},
					};
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

	buildEMgraph(graphnode) {
		if (!graphnode) graphnode = this._mainGMLRoot;

		if (!graphnode.edge) return;
		this.JSON.graphs.graph1["edges"] = {};
		this.JSON.graphs.graph1.edges["dashed"] = [];
		this.JSON.graphs.graph1.edges["line"] = [];
		let numEdges = graphnode.edge.length;
		for (let i = 0; i < numEdges; i++) {
			let E = graphnode.edge[i];
			if (E) {
				let type = E.data.PolyLineEdge.LineStyle["@type"];
				if (!this.JSON.graphs.graph1.edges[type]) {
					this.JSON.graphs.graph1.edges[type] = [];
				}
				let sourceID = String(this.getAttribute(E, "source"));
				let targetID = String(this.getAttribute(E, "target"));

				let sourceNode = this.EMnodes[sourceID];
				let targetNode = this.EMnodes[targetID];
				this.JSON.graphs.graph1.edges[type].push({ from: sourceID, to: targetID });

				if (sourceNode !== undefined && targetNode !== undefined) {
					sourceNode.addChild(targetNode);
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
					let proxNode = currGroup.children[c];

					let EMdata = proxNode.userData.EM;
					EMdata.periods[pnamerec] = true;
				}
			}
		}
	}
}
