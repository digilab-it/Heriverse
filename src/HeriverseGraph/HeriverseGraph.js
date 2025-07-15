import MultidimensionalGraph from "../Multigraph/MultidimensionalGraph.js";
import HeriverseNode from "./HeriverseNode.js";
import HeriverseEdge from "./HeriverseEdge.js";
import MGEdge from "../Multigraph/MGedge.js";

/**
 * Class related to a multidimensional graph.
 */
export default class HeriverseGraph extends MultidimensionalGraph {
	static stratigraphicTypes = [
		"serSU",
		"SF",
		"US",
		"USD",
		"USVn",
		"USVs",
		"serUSVs",
		"serUSVn",
		"UTR",
		"VSF",
		"TSU",
		"SE",
	];

	/**
	 * Initialize the object who'll host the graph and set the basepath
	 * to the JSON file conteining the graph.
	 * @param {String} basepath
	 */
	constructor(basepath, json) {
		super(basepath, json);
		this.panorama = "";
	}

	/**
	 * Method whom generate the graph after read the json. The json is the one
	 * obtained from the basepath indicated in the constructor.
	 */
	readJsofn(onSuccess) {
		try {
			$.getJSON(this.basepath, (json) => {}).done(function () {
				if (onSuccess) {
					onSuccess();
				}
			}, "JSON PARSED");
		} catch (error) {
			console.error(error);
		}
	}

	parseJson() {
		this._jsonGraph = {};
		const graphKeys = Object.keys(this.json.graphs);
		for (let graphKey of graphKeys) {
			const nodeGroups = this.json.graphs[graphKey].nodes;
			const edgeGroups = this.json.graphs[graphKey].edges;
			let default_authors = this.json.graphs[graphKey].defaults
				? this.json.graphs[graphKey].defaults.authors
				: "anonymous";
			let default_license = this.json.graphs[graphKey].defaults
				? this.json.graphs[graphKey].defaults.license
				: "none";
			let default_embargo_until = this.json.graphs[graphKey].defaults
				? this.json.graphs[graphKey].defaults.embargo_until
				: "none";
			this.panorama = this.json.graphs[graphKey].defaults
				? this.json.graphs[graphKey].defaults.panorama
				: "";
			Object.keys(nodeGroups).forEach((key) => {
				if (key === "stratigraphic") {
					const subNodeGroups = nodeGroups.stratigraphic;
					Object.keys(subNodeGroups).forEach((subKey) => {
						Object.keys(subNodeGroups[subKey]).forEach((id) => {
							let node = subNodeGroups[subKey][id];
							let license = node.license || default_license;
							let authors = node.authors || default_authors;
							let embargo_until = node.embargo_until || default_embargo_until;
							this.addNode(
								graphKey + "_" + id,
								node.type,
								node.name,
								node.description,
								node.data,
								license,
								authors,
								embargo_until,
								graphKey
							);
						});
					});
				} else {
					Object.keys(nodeGroups[key]).forEach((id) => {
						let node = nodeGroups[key][id];
						let license = node.license || default_license;
						let authors = node.authors || default_authors;
						let embargo_until = node.embargo_until || default_embargo_until;
						this.addNode(
							graphKey + "_" + id,
							node.type,
							node.name,
							node.description,
							node.data,
							license,
							authors,
							embargo_until,
							graphKey
						);
					});
				}
			});
			Object.keys(edgeGroups).forEach((key) => {
				if (edgeGroups[key].length > 0) {
					Object.keys(edgeGroups[key]).forEach((id) => {
						let edge = edgeGroups[key][id];
						this.addEdge(
							graphKey + "_" + edge.id,
							key,
							this.getNode(graphKey + "_" + edge.from),
							this.getNode(graphKey + "_" + edge.to),
							graphKey
						);
					});
				}
			});
		}
	}

	/**
	 * Method to add a new node to the graph. It requests: the id of the node; the type of the node; the name; the description;
	 * @param {String} id
	 * @param {String} type
	 * @param {String} name
	 * @param {String} description
	 * @param {Object} data
	 */
	addNode(id, type, name, description, data, license, authors, embargo_until, graph) {
		if (!this._jsonGraph.graph) {
			this._jsonGraph.graph = {};
		}
		if (!this._jsonGraph.graph.nodes) {
			this._jsonGraph.graph["nodes"] = {};
		}

		let newNode = new HeriverseNode();
		newNode.setNodeInfo(id, type, name, description, data, license, authors, embargo_until, graph);
		this._jsonGraph.graph.nodes[id] = newNode;
	}

	/**
	 * Method to add a new edge to the graph. Requested informations are:
	 * - the identifier of the edge;
	 * - the type;
	 * - the node whom starts the edge;
	 * - the node where the edge ends;
	 * @param {String} id
	 * @param {String} type
	 * @param {HeriverseNode} from
	 * @param {HeriverseNode} to
	 * @param {String} graph
	 */
	addEdge(id, type, from, to, graph) {
		if (!this._jsonGraph.graph) {
			this._jsonGraph.graph = {};
		}
		if (!this._jsonGraph.graph.edges) {
			this._jsonGraph.graph["edges"] = {};
		}

		let newEdge = new HeriverseEdge();

		newEdge.setEdgeInfo(id, type, from, to, graph);
		if (from && to) {
			from.addNeighbor(to, to.type, "to", type);
			to.addNeighbor(from, from.type, "from", type);
		}
		this._jsonGraph.graph.edges[id] = newEdge;
	}

	newNode(node) {
		if (!this._jsonGraph.graph) {
			this._jsonGraph.graph = {};
		}
		if (!this._jsonGraph.graph.nodes) {
			this._jsonGraph.graph["nodes"] = {};
		}

		this._jsonGraph.graph.nodes[node.id] = node;

		if (HeriverseGraph.stratigraphicTypes.includes(node.type)) {
			this.json.graphs[Object.keys(this.json.graphs)[0]].nodes["stratigraphic"][node.type][
				node.id
			] = {
				type: node.type,
				name: node.name,
				description: node.description,
				data: node.data,
			};
		} else {
			this.json.graphs[Object.keys(this.json.graphs)[0]].nodes[
				this.fromNodeType2GraphType(node.type)
			][node.id] = {
				type: node.type,
				name: node.name,
				description: node.description,
				data: node.data,
			};
		}
	}

	fromNodeType2GraphType(nodetype) {
		const typeMapping = {
			[HeriverseNode.NODE_TYPE.AUTHOR]: HeriverseNode.TYPE.AUTHORS,
			[HeriverseNode.NODE_TYPE.STRATIGRAPHIC]: HeriverseNode.TYPE.STRATIGRAPHIC,
			[HeriverseNode.NODE_TYPE.EPOCH]: HeriverseNode.TYPE.EPOCHS,
			[HeriverseNode.NODE_TYPE.GROUP]: HeriverseNode.TYPE.GROUPS,
			[HeriverseNode.NODE_TYPE.PROPERTY]: HeriverseNode.TYPE.PROPERTIES,
			[HeriverseNode.NODE_TYPE.DOCUMENT]: HeriverseNode.TYPE.DOCUMENTS,
			[HeriverseNode.NODE_TYPE.EXTRACTOR]: HeriverseNode.TYPE.EXTRACTORS,
			[HeriverseNode.NODE_TYPE.COMBINER]: HeriverseNode.TYPE.COMBINERS,
			[HeriverseNode.NODE_TYPE.LINK]: HeriverseNode.TYPE.LINKS,
			[HeriverseNode.NODE_TYPE.GEO]: HeriverseNode.TYPE.GEO,
			[HeriverseNode.NODE_TYPE.SEMANTIC_SHAPE]: HeriverseNode.TYPE.SEMANTIC_SHAPES,
			[HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL]: HeriverseNode.TYPE.REPRESENTATION_MODELS,
			[HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_DOC]:
				HeriverseNode.TYPE.REPRESENTATION_MODEL_DOC,
			[HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_SF]: HeriverseNode.TYPE.REPRESENTATION_MODEL_SF,
			[HeriverseNode.NODE_TYPE.PANORAMA_MODEL]: HeriverseNode.TYPE.PANORAMA_MODELS,
		};

		return typeMapping[nodetype] || null;
	}

	newEdge(id, from, to, type) {
		if (!this._jsonGraph.graph) {
			this._jsonGraph.graph = {};
		}
		if (!this._jsonGraph.graph.edges) {
			this._jsonGraph.graph["edges"] = {};
		}

		let newEdge = new MGEdge();

		let _id = id || crypto.randomUUID();

		newEdge.setEdgeInfo(_id, type, from, to);
		if (from && to) {
			from.addNeighbor(to, to.type, "to", type);
			to.addNeighbor(from, from.type, "from", type);
		}
		this._jsonGraph.graph.edges[_id] = newEdge;
		if (!this.json.graphs[Heriverse.currGraphId].edges[type])
			this.json.graphs[Heriverse.currGraphId].edges[type] = [];
		this.json.graphs[Heriverse.currGraphId].edges[type].push({
			id: _id,
			from: from.id,
			to: to.id,
		});
	}

	newEdgeFromIds(id, fromId, toId, type) {
		if (!this._jsonGraph.graph) {
			this._jsonGraph.graph = {};
		}
		if (!this._jsonGraph.graph.edges) {
			this._jsonGraph.graph["edges"] = {};
		}

		let newEdge = new MGEdge();

		let _id = id || crypto.randomUUID();

		let from = this.getNode(fromId);
		let to = this.getNode(toId);

		newEdge.setEdgeInfo(id, type, from, to);
		if (from && to) {
			from.addNeighbor(to, to.type, "to", type);
			to.addNeighbor(from, from.type, "from", type);
		}
		this._jsonGraph.graph.edges[_id] = newEdge;
		if (!this.json.graphs[Heriverse.currGraphId].edges[type])
			this.json.graphs[Heriverse.currGraphId].edges[type] = [];
		this.json.graphs[Heriverse.currGraphId].edges[type].push({
			id: _id,
			from: from.id,
			to: to.id,
		});
	}

	/**
	 * Method who return all stratigraphic nodes.
	 * @returns
	 */
	getStratigraphicNodes() {
		let resNodes = {};
		Object.keys(this._jsonGraph.graph.nodes).forEach((key) => {
			let node = this._jsonGraph.graph.nodes[key];
			if (HeriverseGraph.stratigraphicTypes.includes(node.type)) {
				resNodes[key] = node;
			}
		});
		return resNodes;
	}

	/**
	 * Method to get all edges composing the graph.
	 * @returns
	 */
	getEdges() {
		return this._jsonGraph.graph.edges;
	}
	/**
	 * Method to get edges according to the type or the direction.
	 * @param {String} typeOrDirection
	 * @returns
	 */
	getEdges(type) {
		let resEdges = {};
		Object.keys(this._jsonGraph.graph.edges).forEach((key) => {
			let edge = this._jsonGraph.graph.edges[key];
			if (edge.type === type) {
				resEdges[edge.id] = edge;
			}
		});
		return resEdges;
	}
}
