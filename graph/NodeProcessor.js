import { Line2 } from "../src/lines/Line2.js";
import { LineGeometry } from "../src/lines/LineGeometry.js";
import { LineMaterial } from "../src/lines/LineMaterial.js";

const stratigraphicTypes = ["US", "USVs", "SF", "USVn", "USD"];
const relations_material_map = {
	is_before: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.1,
		gapSize: 0.1,
		opacity: 1,
		transparent: true,
	}),
	has_data_provenance: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.4,
		gapSize: 0.1,
		opacity: 1,
		transparent: true,
	}),
};

const nodes_offset = 0.03;

export default class NodeProcessor {
	constructor(mapping) {
		this.mapping = mapping;
		this.nodeRotation = { x: 0, y: 0.0, z: 0.0 };
		this.labelRotation = { x: (-90 * Math.PI) / 180, y: 0.0, z: 0.0 };
	}

	extractLandingNodes(stratigraphicNodes) {
		let primo = null;
		for (const key in stratigraphicNodes) {
			var node = stratigraphicNodes[key];
			DrawGraph.landingNodes.push({ id: key, node: node });
			if (primo == null) {
				primo = key;
			}
		}
		return primo;
	}

	getNode(nodeId) {
		let node;

		switch (DrawGraph.node_types[nodeId]) {
			case "US":
				node = this.nodes.stratigraphic["US"][nodeId];
				break;
			case "USVs":
				node = this.nodes.stratigraphic["USVs"][nodeId];
				break;
			case "SF":
				node = this.nodes.stratigraphic["SF"][nodeId];
				break;
			case "USVn":
				node = this.nodes.stratigraphic["USVn"][nodeId];
				break;
			case "USD":
				node = this.nodes.stratigraphic["USD"][nodeId];
				break;
			case "epoch":
				node = this.nodes.epochs[nodeId];
				break;
			case "ActivityNodeGroup":
			case "ParadataNodeGroup":
				node = this.nodes.groups[nodeId];
				break;
			case "property":
				node = this.nodes.properties[nodeId];
				break;
			case "document":
				node = this.nodes.documents[nodeId];
				break;
			case "extractor":
				node = this.nodes.extractors[nodeId];
				break;
			case "combiner":
				node = this.nodes.combiners[nodeId];
				break;
			case "link":
				node = this.nodes.links[nodeId];
				break;
			case "geo_position":
				node = this.nodes.geo[nodeId];
				break;
		}

		return node;
	}

	drawGrafo1(data, rootId) {
		this.clearAll();

		ATON.setBackgroundColor(new THREE.Color().setHex(0xa4a4a4));
		DrawGraph.pov = new ATON.POV("myView");
		DrawGraph.pov.setPosition(-8, 4, 4);
		DrawGraph.pov.setTarget(0, 2, 2);

		ATON.Nav.setHomePOV(DrawGraph.pov);

		let startY = 2;
		let moltiplicatoreY = 1.2;
		let startRadius = 2;
		var nodes = data._jsonGraph.graph.nodes;

		let level = 1;
		let y = startY;
		let radius = startRadius;
		let arrayFigli = [];
		let fathers;
		let rootPoint = {
			x: 0,
			y: 0,
			z: 0,
		};

		this.disegnaNodo(nodes[rootId], rootId, rootPoint);

		let collezione_vicini = [];
		let start_r = 0.8;
		let start_phi = Math.PI / 2;

		let graph_cut_1 = 1;
		let graph_cut_2 = 3;
		let layer_count = 0;
		let tmp_collezione_vicini = [];

		let root_node = true;
		let count = 0;

		do {
			tmp_collezione_vicini = [];
			let ret;
			if (root_node) {
				ret = this.disegnaAdiacenti_6(nodes[rootId], true, 0, start_r, start_phi);
				tmp_collezione_vicini.push(ret);
			} else {
				collezione_vicini.forEach((collezione) => {
					collezione.vicini.forEach((nodo) => {
						ret = this.disegnaAdiacenti_6(nodo, false, 0, collezione.next_r, start_phi);
						tmp_collezione_vicini.push(ret);
					});
				});
			}
			collezione_vicini = tmp_collezione_vicini;
			root_node = false;
		} while (this.thereAreAdjacent(collezione_vicini));
	}

	clearAll() {
		for (const nodeId in DrawGraph.nodes) {
			ATON.getRootScene().remove(DrawGraph.nodes[nodeId]);
		}

		DrawGraph.node4deletion.forEach((node) => {
			ATON.getRootScene().remove(node);
			node.delete();
		});

		DrawGraph.labels.forEach((label) => {
			label.delete();
		});

		DrawGraph.stagedSemantic.forEach((node) => {
			ATON.SemFactory.deleteSemanticNode(node.name);
			node.delete();
		});

		DrawGraph.edges.forEach((edge) => {
			edge.visible = false;
			ATON.getRootScene().remove(edge);
		});

		DrawGraph.nodes = {};
		DrawGraph.edges = [];
		DrawGraph.labels = [];
		DrawGraph.node4deletion = [];
		DrawGraph.stagedNodes = {};
		DrawGraph.stagedBrothers = [];
		DrawGraph.stagedChilds = [];
		DrawGraph.stagedSemantic = [];
	}

	disegnaAdiacenti(node, root_sons, y_node, r_node, phi) {
		let root_node = DrawGraph.nodes[node.id];
		let neighbors;
		if (root_sons) {
			neighbors = Object.values(node.getNeighborsByType("property"));
		} else {
			neighbors = [];
		}

		let m = neighbors.length;

		let neighbor_index = 0;

		let x_node = root_node.position.x;
		let z_node = root_node.position.z;
		let next_r;
		let tmp_r;

		let theta = 0;
		neighbors.forEach((neighbor) => {
			tmp_r = -1;
			if (root_sons) {
				theta = (2 * Math.PI * neighbor_index) / m;
			} else {
				theta = Math.PI - phi / 2 + (phi * neighbor_index) / m + Math.PI / (2 * m);
			}
			neighbor_index++;

			let new_point = {};
			new_point.x =
				x_node < 0
					? x_node + r_node * Math.cos(theta)
					: x_node + r_node * Math.cos(theta + Math.PI);
			new_point.z =
				z_node < 0
					? z_node + r_node * Math.sin(theta)
					: z_node + r_node * Math.sin(theta + Math.PI);
			new_point.y = y_node;

			this.disegnaNodo(neighbor, neighbor.id, new_point, "fratello");

			if (neighbors.length > 1) {
				if (tmp_r === -1) {
					tmp_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
				} else {
					let current_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
					tmp_r = Math.min(tmp_r, current_r);
				}
			} else if (neighbors.length === 1) {
				tmp_r = m / 2;
			}
		});
		theta = 0;

		next_r = tmp_r;

		return { vicini: neighbors, next_r: next_r };
	}

	disegnaAdiacenti_3(node, root_sons, y_node, r_node, phi) {
		let root_node = DrawGraph.nodes[node.id];

		let neighbors = [];
		if (root_sons) {
			neighbors = Object.values(node.getNeighborsByType("property"));
		} else if (node.type === "property") {
			let extractors = Object.values(node.getNeighborsByType("extractor"));
			let combiners = Object.values(node.getNeighborsByType("combiner"));
			let links = Object.values(node.getNeighborsByType("link"));
			neighbors = Object.values(node.getNeighborsByType("document")).concat(
				extractors,
				combiners,
				links
			);
		} else if (node.type === "document") {
			neighbors = Object.values(node.getNeighborsByType("link"));
		} else if (node.type === "extractor") {
			let links = Object.values(node.getNeighborsByType("link"));
			neighbors = Object.values(node.getNeighborsByType("document")).concat(links);
		} else if (node.type === "combiner") {
			let extractors = Object.values(node.getNeighborsByType("extractor"));
			let links = Object.values(node.getNeighborsByType("link"));
			neighbors = Object.values(node.getNeighborsByType("document")).concat(extractors, links);
		} else {
			return { vicini: neighbors, next_r: -1 };
		}

		let m = neighbors.length;

		let neighbor_index = 0;

		let x_node = root_node.position.x;
		let z_node = root_node.position.z;
		let next_r;
		let tmp_r;

		let theta = 0;
		neighbors.forEach((neighbor) => {
			tmp_r = -1;
			if (root_sons) {
				theta = (2 * Math.PI * neighbor_index) / m;
			} else {
				theta = Math.PI - phi / 2 + (phi * neighbor_index) / m + Math.PI / (2 * m);
			}
			neighbor_index++;

			let new_point = {};
			new_point.x =
				x_node < 0
					? x_node + r_node * Math.cos(theta)
					: x_node + r_node * Math.cos(theta + Math.PI);
			new_point.z =
				z_node < 0
					? z_node + r_node * Math.sin(theta)
					: z_node + r_node * Math.sin(theta + Math.PI);
			new_point.y = y_node;

			this.disegnaNodo(neighbor, neighbor.id, new_point);
			this.disegnaArco(root_node.name, root_node.position, neighbor.id, new_point);

			if (neighbors.length > 1) {
				if (tmp_r === -1) {
					tmp_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
				} else {
					let current_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
					tmp_r = Math.min(tmp_r, current_r);
				}
			} else if (neighbors.length === 1) {
				tmp_r = m * 1.2;
			}
		});
		theta = 0;

		next_r = tmp_r;

		return { vicini: neighbors, next_r: next_r };
	}

	disegnaAdiacenti_4(node, root_sons, y_node, r_node, phi) {
		let root_node = DrawGraph.nodes[node.id];

		if (root_node.type === "link") {
			return { vicini: [], next_r: -1 };
		}

		let edges_available = [];
		let relation_selected = [];
		for (let relation in DrawGraph.active_relations) {
			if (DrawGraph.active_relations[relation]) relation_selected.push(relation);
		}

		edges_available = relation_selected;

		let neighbors = [];
		if (root_sons) {
			for (let relation of edges_available) {
				neighbors = neighbors.concat(Object.values(node.getNeighborsByRelationP(relation, "both")));
			}
		} else {
			for (let relation of edges_available) {
				neighbors = neighbors.concat(Object.values(node.getNeighborsByRelationP(relation, "to")));
			}
		}

		let m = neighbors.length;

		let neighbor_index = 0;

		let x_node = root_node.position.x;
		let z_node = root_node.position.z;
		let next_r;
		let tmp_r;

		let theta = 0;
		neighbors.forEach((neighbor) => {
			tmp_r = -1;
			if (root_sons) {
				theta = (2 * Math.PI * neighbor_index) / m;
			} else {
				theta = Math.PI - phi / 2 + (phi * neighbor_index) / m + Math.PI / (2 * m);
			}
			neighbor_index++;

			let new_point = {};
			new_point.x =
				x_node < 0
					? x_node + r_node * Math.cos(theta)
					: x_node + r_node * Math.cos(theta + Math.PI);
			new_point.z =
				z_node < 0
					? z_node + r_node * Math.sin(theta)
					: z_node + r_node * Math.sin(theta + Math.PI);
			new_point.y = y_node;

			this.disegnaNodo(neighbor, neighbor.id, new_point);
			this.disegnaArco(root_node.name, root_node.position, neighbor.id, new_point);

			if (neighbors.length > 1) {
				if (tmp_r === -1) {
					tmp_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
				} else {
					let current_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
					tmp_r = Math.min(tmp_r, current_r);
				}
			} else if (neighbors.length === 1) {
				tmp_r = m / 2;
			}
		});
		theta = 0;

		next_r = tmp_r;

		return { vicini: neighbors, next_r: next_r };
	}

	disegnaAdiacenti_5(node, root_sons, y_node, r_node, phi) {
		let root_node = DrawGraph.nodes[node.id];

		if (
			!root_sons &&
			(stratigraphicTypes.indexOf(node.type) !== -1 ||
				node.type === "epoch" ||
				node.type === "ActivityNodeGroup" ||
				node.type === "ParadataNodeGroup" ||
				node.type === "semantic_shape")
		) {
			return { vicini: [], next_r: -1 };
		}

		let edges_available = [];
		let relation_selected = [];
		for (let relation in DrawGraph.active_relations) {
			if (DrawGraph.active_relations[relation]) relation_selected.push(relation);
		}

		edges_available = relation_selected;

		let neighbors = [];
		if (root_sons) {
			for (let relation of edges_available) {
				neighbors = neighbors.concat(Object.values(node.getNeighborsByRelationP(relation, "both")));
			}
		} else {
			for (let relation of edges_available) {
				neighbors = neighbors.concat(Object.values(node.getNeighborsByRelationP(relation, "to")));
			}
		}

		let m = neighbors.length;

		let neighbor_index = 0;

		let x_node = root_node.position.x;
		let z_node = root_node.position.z;
		let next_r;
		let tmp_r;

		let theta = 0;
		neighbors.forEach((neighbor) => {
			tmp_r = -1;
			if (root_sons) {
				theta = (2 * Math.PI * neighbor_index) / m;
			} else {
				theta = Math.PI - phi / 2 + (phi * neighbor_index) / m + Math.PI / (2 * m);
			}
			neighbor_index++;

			let new_point = {};
			new_point.y = y_node;
			if (x_node < 0 && z_node > 0) {
				new_point.x = x_node + r_node * Math.cos(theta - Math.PI / 4);
				new_point.z = z_node + r_node * Math.sin(theta - Math.PI / 4);
			} else if (x_node < 0 && z_node < 0) {
				new_point.x = x_node + r_node * Math.cos(theta + Math.PI / 4);
				new_point.z = z_node + r_node * Math.sin(theta + Math.PI / 4);
			} else if (x_node > 0 && z_node < 0) {
				new_point.x = x_node + r_node * Math.cos(theta + Math.PI / 4); /** - */
				new_point.z = z_node + r_node * Math.sin(theta + Math.PI / 4);
			} else if (x_node > 0 && z_node > 0) {
				new_point.x = x_node + r_node * Math.cos(theta - Math.PI / 2); /** - */
				new_point.z = z_node + r_node * Math.sin(theta - Math.PI / 2);
			} else if (x_node === 0 && z_node === 0) {
				new_point.x = x_node + r_node * Math.cos(theta);
				new_point.z = z_node + r_node * Math.sin(theta);
			} else if (x_node === 0) {
				new_point.x = x_node + r_node * Math.cos(theta);
				if (z_node < 0) {
					new_point.z = z_node + r_node * Math.sin(theta - Math.PI / 2);
				} else if (z_node > 0) {
					new_point.z = z_node + r_node * Math.sin(theta + Math.PI / 2);
				}
			} else if (z_node === 0) {
				new_point.z = z_node + r_node * Math.sin(theta);
				if (x_node < 0) {
					new_point.x = x_node + r_node * Math.cos(theta);
				} else if (x_node > 0) {
					new_point.x = x_node + r_node * Math.cos(theta - Math.PI);
				}
			}

			this.disegnaNodo(neighbor, neighbor.id, new_point);
			this.disegnaArco(root_node.name, root_node.position, neighbor.id, new_point);

			if (neighbors.length > 1) {
				if (tmp_r === -1) {
					tmp_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
				} else {
					let current_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
					tmp_r = Math.max(tmp_r, current_r);
				}
			} else if (neighbors.length === 1) {
				tmp_r = m;
			}
		});
		theta = 0;

		next_r = tmp_r;

		return { vicini: neighbors, next_r: next_r };
	}

	disegnaAdiacenti_6(node, root_sons, y_node, r_node, phi) {
		let root_node = DrawGraph.nodes[node.id];
		const r_edge = r_node * 0.00005;

		if (!root_sons && (stratigraphicTypes.indexOf(node.type) !== -1 || node.type === "document")) {
			return { vicini: [], next_r: -1 };
		}

		let types = {};
		let directions = {};

		let edges_available = [];
		let relation_selected = [];
		for (let relation in DrawGraph.active_relations) {
			if (DrawGraph.active_relations[relation]) relation_selected.push(relation);
		}

		edges_available = relation_selected;

		let neighbors = [];
		if (root_sons) {
			for (let relation of edges_available) {
				neighbors = neighbors.concat(Object.values(node.getNeighborsByRelationP(relation, "both")));
			}
		} else {
			for (let relation of edges_available) {
				neighbors = neighbors.concat(Object.values(node.getNeighborsByRelationP(relation, "to")));
			}
		}

		if (neighbors.length === 0) {
			return { vicini: [], next_r: -1 };
		}

		if (neighbors.length > 0) {
			for (let neighbor in node.getNeighborsByRelationP("is_before", "from")) {
				if (!types[neighbor]) types[neighbor] = "is_before";
				if (!directions[neighbor]) directions[neighbor] = "from";
			}
			for (let neighbor in node.getNeighborsByRelationP("is_before", "to")) {
				if (!types[neighbor]) types[neighbor] = "is_before";
				if (!directions[neighbor]) directions[neighbor] = "to";
				else if (directions[neighbor] === "from") directions[neighbor] = "both";
			}
			for (let neighbor in node.getNeighborsByRelationP("has_data_provenance", "from")) {
				if (!types[neighbor]) types[neighbor] = "has_data_provenance";
				if (!directions[neighbor]) directions[neighbor] = "from";
			}
			for (let neighbor in node.getNeighborsByRelationP("has_data_provenance", "to")) {
				if (!types[neighbor]) types[neighbor] = "has_data_provenance";
				if (!directions[neighbor]) directions[neighbor] = "to";
				else if (directions[neighbor] === "from") directions[neighbor] = "both";
			}
		}

		let m = neighbors.length;

		let neighbor_index = 0;

		let x_node = root_node.position.x;
		let z_node = root_node.position.z;
		let next_r;
		let tmp_r;

		let theta = 0;
		neighbors.forEach((neighbor) => {
			if (
				[
					"ActivityNodeGroup",
					"ParadataNodeGroup",
					"epoch",
					"link",
					"geo_position",
					"semantic_shape",
					"representation_model",
					"panorama_model",
				].includes(neighbor.type)
			) {
				return;
			}
			tmp_r = -1;
			if (root_sons) {
				theta = (2 * Math.PI * neighbor_index) / m;
			} else {
				let baseAngle = Math.atan2(z_node, x_node);
				if (m > 1) theta = baseAngle - phi / 2 + (phi * neighbor_index) / m + Math.PI / (2 * m);
				else theta = baseAngle;
			}
			neighbor_index++;

			let new_point = this.calculatePoint(x_node, y_node, z_node, null, null, null, r_node, theta);
			let new_point_edge = {};
			new_point_edge.y = y_node - nodes_offset;
			new_point_edge.x = new_point.x;
			new_point_edge.z = new_point.z;

			this.disegnaNodo(neighbor, neighbor.id, new_point);

			let origin_for_edge = {
				x: root_node.position.x,
				y: root_node.position.y - nodes_offset,
				z: root_node.position.z,
			};
			this.drawEdge(
				root_node.name,
				origin_for_edge,
				neighbor.id,
				new_point_edge,
				types[neighbor.id],
				directions[neighbor.id]
			);

			if (neighbors.length > 1) {
				if (tmp_r === -1) {
					tmp_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
				} else {
					let current_r =
						(1 / 2) *
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2));
					tmp_r = Math.max(tmp_r, current_r);
				}
			} else if (neighbors.length === 1) {
				tmp_r = m / 2;
			}
		});
		theta = 0;

		next_r = tmp_r;

		return { vicini: neighbors, next_r: next_r };
	}

	calculatePoint(x, y, z, start_position, horizontal, sideFace, r, theta) {
		let new_point = { x: 0, y: 0, z: 0 };

		new_point.x = x + r * Math.cos(theta);
		new_point.z = z + r * Math.sin(theta);
		new_point.y = y;

		return new_point;
	}

	disegnaNodo(node, nodeId, posizione) {
		if (node != undefined) {
			let sceneNode = ATON.createUINode(nodeId);

			if (node.type) {
				if (node.type == "property") {
					this.createTextSprite(node.name, node.type, node.name).then((sprite) => {
						sceneNode.add(sprite);
					});
				} else {
					this.createTextSprite(node.name, node.type, node.name).then((sprite) => {
						sceneNode.add(sprite);
					});
				}
			}

			if (node.layout && node.layout.scale) sceneNode.setScale(node.layout.scale);
			else sceneNode.setScale(10);
			sceneNode.setPosition(posizione.x, posizione.y, posizione.z);

			sceneNode.setRotation(this.nodeRotation.x, this.nodeRotation.y, this.nodeRotation.z);

			sceneNode.onSelect = (k) => {
				let url = this.nodes[sceneNode.name].data.url;
				if (url != "") window.open(url, "_blank");
			};

			sceneNode.onHover = () => {};

			sceneNode.onLeave = () => {};

			sceneNode.attachToRoot();

			if (
				node.type == "document" ||
				node.type == "epoch" ||
				node.type == "semantic_shape" ||
				node.type == "link" ||
				node.type == "author" ||
				node.type == "ActivityNodeGroup" ||
				node.type == "ParadataNodeGroup"
			) {
				let sem = ATON.createSemanticNode(node.name);
				sem.attachToRoot();

				let handleLocation = new THREE.Vector3(posizione.x, posizione.y, posizione.z);
				let handleRadius = 0.2;
				ATON.SemFactory.createSphere(node.name, handleLocation, handleRadius);

				ATON.on("SemanticNodeLeave", (semid) => {
					let S = ATON.getSemanticNode(semid);
					if (S) S.restoreDefaultMaterial();
				});

				ATON.on("SemanticNodeHover", (semid) => {
					let S = ATON.getSemanticNode(semid);
					if (S) S.highlight();
				});

				DrawGraph.stagedSemantic.push(sem);
			}

			DrawGraph.nodes[nodeId] = sceneNode;
			DrawGraph.stagedNodes[nodeId] = sceneNode;
			DrawGraph.node4deletion.push(sceneNode);
		}
	}

	createTextSprite(text, fileName, nodeName) {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		canvas.width = 512;
		canvas.height = 256;

		const background = new Image();
		background.src = "../res/graphicons/" + fileName + ".svg";

		return new Promise((resolve) => {
			background.onload = () => {
				context.drawImage(background, 0, 0, canvas.width, canvas.height);

				context.font = "38pt Arial";
				context.color = "red";
				switch (fileName) {
					case "property":
					case "SF":
					case "serSU":
					case "US":
					case "USD":
					case "UTR":
						context.fillStyle = "black";
						break;
					case "USVs":
					case "USVn":
					case "USVseries":
					case "VSF":
						context.fillStyle = "white";
						break;
					default:
						context.fillStyle = "darkgreen";
						break;
				}

				context.textAlign = "center";
				switch (fileName) {
					case "combiner":
					case "extractor":
					case "document":
					case "epoch":
					case "link":
					case "semantic_shape":
					case "ActivityNodeGroup":
					case "ParadataNodeGroup":
					case "author":
						context.fillText(" ", canvas.width / 2, canvas.height / 2);
						break;
					case "property":
						context.fillText(nodeName, canvas.width / 2, canvas.height / 2);
						break;
					default:
						context.fillText(text, canvas.width / 2, canvas.height / 2);
						break;
				}

				const texture = new THREE.Texture(canvas);
				texture.needsUpdate = true;

				const material = new THREE.SpriteMaterial({ map: texture });
				const sprite = new THREE.Sprite(material);

				const scaleFactor = 0.00005;
				const scaleFactor2 = 0.0001;

				switch (fileName) {
					case "property":
					case "SF":
					case "serSU":
					case "US":
					case "USD":
					case "UTR":
					case "USVs":
					case "USVn":
					case "USVseries":
					case "VSF":
						sprite.scale.set(scaleFactor * canvas.width, scaleFactor * canvas.height);
						break;
					case "document":
						sprite.scale.set(scaleFactor * canvas.height, scaleFactor * canvas.width);
						break;
					default:
						sprite.scale.set(scaleFactor * canvas.width, scaleFactor2 * canvas.height);
						break;
				}

				resolve(sprite);
			};
		});
	}

	show(nodeId) {
		for (const nodeId in DrawGraph.nodes) {
			DrawGraph.nodes[nodeId].hide();
		}

		DrawGraph.nodes[nodeId].show();

		let fathers = [nodeId];
		let arrayFigli = [];
		do {
			arrayFigli = [];
			let ret;
			fathers.forEach((nodoPadre) => {
				this.edges.forEach((edge) => {
					if (nodoPadre == edge.from) arrayFigli.push(edge.to);
				});
			});

			arrayFigli.forEach((nodo) => {
				DrawGraph.nodes[nodo].show();
			});

			fathers = arrayFigli;
		} while (arrayFigli.length > 0);

		DrawGraph.edges.forEach((linea) => {
			if (
				DrawGraph.nodes[linea.userData.node1].visible == true &&
				DrawGraph.nodes[linea.userData.node2].visible == true
			) {
				linea.visible = true;
			} else {
				linea.visible = false;
			}
		});
	}

	showFigli(toShow) {
		DrawGraph.stagedChilds.forEach((element) => {
			if (toShow) element.show();
			else element.hide();
		});

		DrawGraph.stagedSemantic.forEach((element) => {
			let node = ATON.getSemanticNode(element);
			if (toShow) ATON.getSemanticNode(element).show();
			else ATON.getSemanticNode(element).hide();
		});

		DrawGraph.edges.forEach((element) => {
			let node1 = element.userData.node1;
			let node2 = element.userData.node2;

			if (DrawGraph.stagedNodes[node1].visible && DrawGraph.stagedNodes[node2].visible)
				element.visible = true;
			else element.visible = false;
		});
	}

	showFratelli(toShow) {
		DrawGraph.stagedBrothers.forEach((element) => {
			if (toShow) element.show();
			else element.hide();
		});

		DrawGraph.edges.forEach((element) => {
			let node1 = element.userData.node1;
			let node2 = element.userData.node2;

			if (DrawGraph.stagedNodes[node1].visible && DrawGraph.stagedNodes[node2].visible)
				element.visible = true;
			else element.visible = false;
		});
	}

	disegnaArco(id1, position1, id2, position2) {
		const material = new THREE.LineBasicMaterial({
			color: ATON.MatHub.colors["white"],
		});
		const points = [];
		points.push(new THREE.Vector3(position1.x, position1.y, position1.z));
		points.push(new THREE.Vector3(position2.x, position2.y, position2.z));

		const geometry = new THREE.BufferGeometry().setFromPoints(points);

		const line = new THREE.Line(geometry, material);
		ATON.getRootScene().add(line);
		line.userData = { node1: id1, node2: id2 };
		DrawGraph.edges.push(line);
	}

	drawEdge(id1, position1, id2, position2, type, direction) {
		let material;

		if (type === "is_before") {
			material = new LineMaterial({
				color: 0x000000,
				linewidth: 2,
				dashed: true,
				dashScale: 1,
				dashSize: this.convertPosition(position1).distanceTo(this.convertPosition(position2)) * 1,
				gapSize: this.convertPosition(position1).distanceTo(this.convertPosition(position2)) * 0,
				opacity: 1,
				transparent: true,
			});
		} else if (type === "has_data_provenance") {
			material = new LineMaterial({
				color: 0x000000,
				linewidth: 2,
				dashed: true,
				dashSize: this.convertPosition(position1).distanceTo(this.convertPosition(position2)) * 0.3,
				gapSize:
					this.convertPosition(position1).distanceTo(this.convertPosition(position2)) * 0.025,
				opacity: 1,
				transparent: true,
			});
		}

		const edgeGroup = new THREE.Group();

		const geometry = new LineGeometry();
		geometry.setPositions([
			position1.x,
			position1.y,
			position1.z,
			position2.x,
			position2.y,
			position2.z,
		]);

		const line = new Line2(geometry, material);
		line.computeLineDistances();
		edgeGroup.add(line);

		const arrowHead = new THREE.Mesh(
			new THREE.PlaneGeometry(0.08, 0.08),
			new THREE.MeshBasicMaterial({
				map: new THREE.TextureLoader().load("../res/graphicons/play.svg"),
				transparent: true,
				side: THREE.DoubleSide,
			})
		);

		if (direction === "from") {
			arrowHead.position.copy(this.convertPosition(position2));
			const directionPoint = new THREE.Vector3()
				.subVectors(this.convertPosition(position2), this.convertPosition(position1))
				.normalize();
			arrowHead.setRotationFromQuaternion(
				new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), directionPoint)
			);

			arrowHead.position.sub(
				directionPoint.multiplyScalar(
					this.convertPosition(position1).distanceTo(this.convertPosition(position2)) * 0.5
				)
			);

			edgeGroup.add(arrowHead);
		} else if (direction === "to") {
			arrowHead.position.copy(this.convertPosition(position2));
			const directionPoint = new THREE.Vector3()
				.subVectors(this.convertPosition(position1), this.convertPosition(position2))
				.normalize();
			arrowHead.setRotationFromQuaternion(
				new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), directionPoint)
			);

			arrowHead.position.add(
				directionPoint.multiplyScalar(
					this.convertPosition(position1).distanceTo(this.convertPosition(position2)) * 0.5
				)
			);

			edgeGroup.add(arrowHead);
		} else if (direction === "both") {
			const arrowHead_2 = new THREE.Mesh(
				new THREE.PlaneGeometry(0.08, 0.08),
				new THREE.MeshBasicMaterial({
					map: new THREE.TextureLoader().load("../res/graphicons/play.svg"),
					transparent: true,
					side: THREE.DoubleSide,
				})
			);

			arrowHead.position.copy(this.convertPosition(position2));
			arrowHead_2.position.copy(this.convertPosition(position2));
			const directionPoint = new THREE.Vector3()
				.subVectors(this.convertPosition(position1), this.convertPosition(position2))
				.normalize();
			const directionPoint_2 = new THREE.Vector3()
				.subVectors(this.convertPosition(position2), this.convertPosition(position1))
				.normalize();

			const angle = Math.atan2(directionPoint.y, directionPoint.x);
			arrowHead.rotation.z = angle;
			const angle_2 = Math.atan2(directionPoint_2.y, directionPoint_2.x);
			arrowHead_2.rotation.z = angle_2;

			arrowHead.position.add(
				directionPoint.multiplyScalar(
					this.convertPosition(position1).distanceTo(this.convertPosition(position2)) * 0.25
				)
			);
			arrowHead_2.position.sub(
				directionPoint.multiplyScalar(
					this.convertPosition(position1).distanceTo(this.convertPosition(position2)) * 0.75
				)
			);

			edgeGroup.add(arrowHead);
			edgeGroup.add(arrowHead_2);
		}

		ATON.getRootScene().add(edgeGroup);
		line.userData = { node1: id1, node2: id2 };
		DrawGraph.edges.push(edgeGroup);
	}

	thereAreAdjacent(collection) {
		for (let collectionIndex in collection) {
			let curr_vicini = collection[collectionIndex].vicini.filter(
				(elem) => typeof elem !== "HeriverseNode"
			);
			if (curr_vicini.length > 0) return true;
		}
		return false;
	}

	normalize(point) {
		let normalizedVector = new THREE.Vector3(point.x, point.y, point.z);
		return normalizedVector.normalize();
	}
	convertPosition(point) {
		return new THREE.Vector3(point.x, point.y, point.z);
	}
}
