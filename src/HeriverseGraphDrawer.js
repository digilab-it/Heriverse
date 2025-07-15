/*
 *
 *  Scene Aton:
 *    ATON._mainRoot
 *    ATON._rootVisibleGlobal
 *  Camere Aton:
 *    Nav._camOrbit
 *    Nav._camFP
 *    Nav._camDevOri
 *  Renderer Aton:
 *    ATON._renderer
 *
 *  XR.rig
 *
 */
import { Line2 } from "./lines/Line2.js";
import { LineMaterial } from "./lines/LineMaterial.js";
import { LineGeometry } from "./lines/LineGeometry.js";
import HeriverseNode from "./HeriverseGraph/HeriverseNode.js";
import HeriverseEvents from "./HeriverseEvents.js";
import HeriverseGraph from "./HeriverseGraph/HeriverseGraph.js";

let HeriverseGraphDrawer = {};

const MAIN_PANEL_WIDTH = 0.25;
const MAIN_PANEL_HEIGHT = 0.125;
const BUTTON_WIDTH = 12;

const SIDES = {
	RIGHT: 0,
	LEFT: 1,
	BOTH: 2,
};

const APP_PATH = Heriverse.APP.basePath.includes("heriverse-wapp")
	? "/a/heriverse-wapp/"
	: "/a/heriverse/";

HeriverseGraphDrawer.rightPanelElements = [];
HeriverseGraphDrawer.leftPanelElements = [];
HeriverseGraphDrawer.uiElements = {};
HeriverseGraphDrawer.elementsToDetachR = [];
HeriverseGraphDrawer.elementsToDetachL = [];
HeriverseGraphDrawer.textureLoader = new THREE.TextureLoader();
HeriverseGraphDrawer.activeRelations = [];
const welcome_text = "Welcome to Heriverse!";

const relations_material_map = {
	is_before: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.1,
		gapSize: 0.1,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_same_time: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	changed_from: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.1,
		gapSize: 0.1,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_data_provenance: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	contrasts_with: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.1,
		gapSize: 0.1,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_first_epoch: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	survive_in_epoch: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.1,
		gapSize: 0.1,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_activity: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_property: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.1,
		gapSize: 0.1,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	extracted_from: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	combines: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_timebranch: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	generic_connection: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_author: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_geoposition: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_linked_resource: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_representation_model: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
	has_semantic_shape: new LineMaterial({
		color: 0x000000,
		linewidth: 2,
		dashed: true,
		dashSize: 0.6,
		gapSize: 0.3,
		opacity: 1,
		transparent: true,
		depthTest: false,
	}),
};

window.HeriverseGraphDrawer = HeriverseGraphDrawer;

HeriverseGraphDrawer.nodes = {};
HeriverseGraphDrawer.stagedNodes = {};
HeriverseGraphDrawer.node4deletion = [];
HeriverseGraphDrawer.stagedSemantic = [];
HeriverseGraphDrawer.edges = [];

HeriverseGraphDrawer.getPositionInfo = () => {
	let position_info = {};
	let clicked_object = ATON._rcSemantics.intersectObjects(
		ATON.getRootSemantics().children,
		true
	)[0];

	position_info.click_point = clicked_object.point;

	position_info.horizontal =
		Math.round(clicked_object.face.normal.y) == 1 || Math.round(clicked_object.face.normal.y) == -1;
	position_info.sideFace =
		Math.round(clicked_object.face.normal.x) == 1 || Math.round(clicked_object.face.normal.x) == -1;

	position_info.face_normal = clicked_object.face.normal;

	return position_info;
};

HeriverseGraphDrawer.drawGraph = (node, position, normal, horizontal, sideFace) => {
	HeriverseGraphDrawer.clearAll();

	if (node) {
		const pos_node_offset = 0.03;
		let start_r = 0.6;
		let start_phi = Math.PI / 2;
		let root_node = true;

		if (normal) {
			if (horizontal) {
				let y_face = Math.round(normal.y);
				if (y_face == 1) position.y += 0.4 + pos_node_offset;
				else if (y_face == -1) position.y -= 0.4 - pos_node_offset;
			}
			if (sideFace) {
				let x_face = Math.round(normal.x);
				if (x_face == 1) position.x += 0.4 + pos_node_offset;
				else if (x_face == -1) position.x -= 0.4 - pos_node_offset;
			} else {
				let z_face = Math.round(normal.z);
				if (z_face == 1) position.z += 0.4 + pos_node_offset;
				else if (z_face == -1) position.z -= 0.4 - pos_node_offset;
			}
		}

		let cam_position = ATON.Nav.getCurrentEyeLocation();

		drawNode(node, node.id, position);

		let tmp_collezione_vicini = [];
		let collezione_vicini = [];
		do {
			tmp_collezione_vicini = [];
			let ret;
			if (root_node) {
				ret = drawAdjacent(
					node,
					root_node,
					position,
					normal,
					horizontal,
					sideFace,
					start_r,
					start_phi
				);
				tmp_collezione_vicini.push(ret);
			} else {
				collezione_vicini.forEach((collezione) => {
					collezione.vicini.forEach((nodo) => {
						ret = drawAdjacent(
							nodo,
							root_node,
							position,
							normal,
							horizontal,
							sideFace,
							collezione.next_r,
							start_phi
						);
						tmp_collezione_vicini.push(ret);
					});
				});
			}
			collezione_vicini = tmp_collezione_vicini;
			root_node = false;
		} while (thereAreAdjacent(collezione_vicini));
	}
};

HeriverseGraphDrawer.clearAll = () => {
	HeriverseGraphDrawer.node4deletion.forEach((node) => {
		node.disablePicking();
		node.delete();
	});

	HeriverseGraphDrawer.stagedSemantic.forEach((node) => {
		ATON.SemFactory.deleteSemanticNode(node);
	});

	HeriverseGraphDrawer.edges.forEach((edge) => {
		edge.visible = false;
		ATON.getRootScene().remove(edge);
	});

	HeriverseGraphDrawer.nodes = {};
	HeriverseGraphDrawer.stagedNodes = {};
	HeriverseGraphDrawer.node4deletion = [];
	HeriverseGraphDrawer.stagedSemantic = [];
	HeriverseGraphDrawer.edges = [];
};

function drawNode(node, nodeId, position) {
	let sceneNode = ATON.createUINode(nodeId);
	sceneNode.enablePicking();

	if (node.type) {
		if (node.type == "property") {
			createTextSprite(node.name, node.type, node.name).then((sprite) => {
				sceneNode.add(sprite);
			});
		} else {
			createTextSprite(node.name, node.type, node.name).then((sprite) => {
				sceneNode.add(sprite);
			});
		}
	}

	if (node.layout && node.layout.scale) sceneNode.setScale(node.layout.scale);
	else sceneNode.setScale(10);
	sceneNode.setPosition(position.x, position.y, position.z);

	sceneNode.onHover = () => {};

	sceneNode.onLeave = () => {};

	sceneNode.attachToRoot();

	if (node.type === "document") {
		if (!HeriverseGraphDrawer.stagedSemantic.includes(node.id)) {
			let sem = ATON.createSemanticNode(node.id).attachToRoot();
			let handleLocation = new THREE.Vector3(position.x, position.y, position.z);
			let handleRadius = 0.2;

			ATON.SemFactory.createSphere(node.id, handleLocation, handleRadius);
			sem.enablePicking();

			sem.onHover = () => {
				ATON.fireEvent("SemanticNodeHover");
			};
			sem.onLeave = () => {
				ATON.fireEvent("SemanticNodeLeave");
			};

			HeriverseGraphDrawer.stagedSemantic.push(node.id);
		}
	} else {
		if (!HeriverseGraphDrawer.stagedSemantic.includes(node.id)) {
			let sem = ATON.createSemanticNode(node.id).attachToRoot();
			let handleLocation = new THREE.Vector3(position.x, position.y, position.z);
			let handleRadius = 0.2;

			ATON.SemFactory.createSphere(node.id, handleLocation, handleRadius);
			sem.enablePicking();

			sem.onHover = () => {
				ATON.fireEvent("SemanticNodeHover");
			};
			sem.onLeave = () => {
				ATON.fireEvent("SemanticNodeLeave");
			};

			HeriverseGraphDrawer.stagedSemantic.push(node.id);
		}
	}

	HeriverseGraphDrawer.nodes[nodeId] = sceneNode;
	HeriverseGraphDrawer.stagedNodes[nodeId] = sceneNode;
	HeriverseGraphDrawer.node4deletion.push(sceneNode);
}

function drawAdjacent(
	node,
	root_sons,
	start_position,
	normal,
	horizontal,
	sideFace,
	r_node,
	phi,
	activeRelations = HeriverseGraphDrawer.activeRelations
) {
	const typesForStop =
		Heriverse.currEM.stratigraphicNodes[node.id] !== undefined ||
		node.type === HeriverseNode.NODE_TYPE.DOCUMENT ||
		node.type === HeriverseNode.NODE_TYPE.LINK ||
		node.type === HeriverseNode.NODE_TYPE.EPOCH ||
		node.type === "ActivityNodeGroup" ||
		node.type === "ParadataNodeGroup";

	if (!root_sons && typesForStop) {
		return { vicini: [], next_r: -1 };
	}

	let root_node = HeriverseGraphDrawer.nodes[node.id];

	let types = {};
	let directions = {};
	let adjacent = [];

	if (root_sons) {
		activeRelations.forEach((relation) => {
			if (relation === HeriverseNode.RELATIONS.HAS_PROPERTY)
				adjacent = adjacent.concat(Object.values(node.getNeighborsByRelationP(relation, "to")));
			else
				adjacent = adjacent.concat(Object.values(node.getNeighborsByRelationP(relation, "both")));
		});
		if (!adjacent.length) return { vicini: [], next_r: -1 };
		activeRelations.forEach((relation) => {
			if (relation === HeriverseNode.RELATIONS.HAS_PROPERTY) {
				for (let neighbor in node.getNeighborsByRelationP(
					HeriverseNode.RELATIONS.HAS_PROPERTY,
					"to"
				)) {
					if (!types[neighbor]) types[neighbor] = HeriverseNode.RELATIONS.HAS_PROPERTY;
					if (!directions[neighbor]) directions[neighbor] = "to";
				}
			} else {
				for (let neighbor in node.getNeighborsByRelationP(relation, "from")) {
					if (!types[neighbor]) types[neighbor] = relation;
					if (!directions[neighbor]) directions[neighbor] = "from";
				}
				for (let neighbor in node.getNeighborsByRelationP(relation, "to")) {
					if (!types[neighbor]) types[neighbor] = relation;
					if (!directions[neighbor]) directions[neighbor] = "to";
					else if (directions[neighbor] === "from") directions[neighbor] = "both";
				}
			}
		});
	} else {
		let node_relations;
		if (node.type === "property") node_relations = ["has_data_provenance", "generic_connection"];
		else if (node.type === "extractor") node_relations = ["extracted_from", "generic_connection"];
		else if (node.type === "combiner") node_relations = ["combines", "generic_connection"];

		for (let relation in node_relations) {
			adjacent = adjacent.concat(
				Object.values(node.getNeighborsByRelationP(node_relations[relation], "to")) || []
			);
		}
		if (adjacent.length > 0) {
			for (let relation in node_relations) {
				for (let neighbor in node.getNeighborsByRelationP(node_relations[relation], "to")) {
					if (!types[neighbor]) types[neighbor] = node_relations[relation];
					if (!directions[neighbor]) directions[neighbor] = "from";
				}
			}
		}
	}

	if (adjacent.length === 0) {
		return { vicini: [], next_r: -1 };
	}

	let m = adjacent.length;

	let neighbor_index = 0;

	let x_node = root_node.position.x;
	let y_node = root_node.position.y;
	let z_node = root_node.position.z;

	let next_r;
	let tmp_r;

	let theta = 0;

	adjacent.forEach((neighbor) => {
		tmp_r = -1;
		if (root_sons) {
			theta = (2 * Math.PI * neighbor_index) / m;
		} else {
			let baseAngle;
			if (Math.round(normal.y) === 1) baseAngle = Math.atan2(x_node, z_node);
			else if (Math.round(normal.y) === -1) baseAngle = Math.atan2(x_node, z_node);
			else if (Math.round(normal.x) === 1) baseAngle = Math.atan2(z_node, y_node);
			else if (Math.round(normal.x) === -1) baseAngle = Math.atan2(z_node, y_node);
			else if (Math.round(normal.z) === 1) baseAngle = Math.atan2(x_node, y_node);
			else if (Math.round(normal.z) === -1) baseAngle = Math.atan2(x_node, y_node);

			if (m >= 1) theta = baseAngle - phi / 2 + (phi * neighbor_index) / m + Math.PI / (2 * m);
			else theta = baseAngle;
		}
		neighbor_index++;

		const nodes_offset = 0.03;
		let new_point = calculatePoint(
			x_node,
			y_node,
			z_node,
			start_position,
			0,
			normal,
			horizontal,
			sideFace,
			r_node,
			theta
		);

		drawNode(neighbor, neighbor.id, new_point);
		drawEdge(
			root_node.name,
			root_node.position,
			neighbor.id,
			new_point,
			types[neighbor.id],
			directions[neighbor.id]
		);

		if (adjacent.length > 1) {
			if (tmp_r === -1) {
				if (horizontal) {
					tmp_r =
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2)) / 2;
				} else {
					if (sideFace) {
						tmp_r =
							Math.sqrt(Math.pow(new_point.y - y_node, 2) + Math.pow(new_point.z - z_node, 2)) / 2;
					} else {
						tmp_r =
							Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.y - y_node, 2)) / 2;
					}
				}
			} else {
				let current_r;
				if (horizontal) {
					current_r =
						Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.z - z_node, 2)) / 2;
				} else {
					if (sideFace) {
						current_r =
							Math.sqrt(Math.pow(new_point.z - z_node, 2) + Math.pow(new_point.y - y_node, 2)) / 2;
					} else {
						current_r =
							Math.sqrt(Math.pow(new_point.x - x_node, 2) + Math.pow(new_point.y - y_node, 2)) / 2;
					}
				}
				tmp_r = Math.min(tmp_r, current_r);
			}
		} else if (adjacent.length === 1) {
			tmp_r = m * 0.8;
		}
	});
	theta = 0;

	next_r = tmp_r;

	return { vicini: adjacent, next_r: next_r };
}

function calculatePoint(
	x,
	y,
	z,
	start_position,
	nodeOffset,
	normal,
	horizontal,
	sideFace,
	r,
	theta
) {
	let new_point = { x: 0, y: 0, z: 0 };
	let horizontal_pos, horizontal_neg, sideFace_pos, sideFace_neg, face_pos, face_neg;
	if (normal === undefined) {
		horizontal_pos = Math.round(normal.y) == 1;
		horizontal_neg = Math.round(normal.y) == -1;
		sideFace_pos = Math.round(normal.x) == 1;
		sideFace_neg = Math.round(normal.x) == -1;
		face_pos = Math.round(normal.z) == 1;
		face_neg = Math.round(normal.z) == -1;
	}

	if (horizontal) {
		if (nodeOffset) {
			if (horizontal_pos) {
				new_point.x = x + r * Math.cos(theta);
				new_point.z = z + r * Math.sin(theta);
				new_point.y = start_position.y + nodeOffset;
			} else if (horizontal_neg) {
				new_point.x = x + r * Math.cos(theta);
				new_point.z = z + r * Math.sin(theta);
				new_point.y = start_position.y - nodeOffset;
			}
		} else {
			new_point.x = x + r * Math.cos(theta);
			new_point.z = z + r * Math.sin(theta);
			new_point.y = start_position.y;
		}
	} else if (sideFace) {
		if (nodeOffset) {
			if (sideFace_pos) {
				new_point.y = y + r * Math.cos(theta);
				new_point.z = z + r * Math.sin(theta);
				new_point.x = start_position.x + nodeOffset;
			} else if (sideFace_neg) {
				new_point.y = y + r * Math.cos(theta);
				new_point.z = z + r * Math.sin(theta);
				new_point.x = start_position.x - nodeOffset;
			}
		} else {
			new_point.y = y + r * Math.cos(theta);
			new_point.z = z + r * Math.sin(theta);
			new_point.x = start_position.x;
		}
	} else {
		if (nodeOffset) {
			if (face_pos) {
				new_point.x = x + r * Math.cos(theta);
				new_point.y = y + r * Math.sin(theta);
				new_point.z = start_position.z + nodeOffset;
			} else if (face_neg) {
				new_point.x = x + r * Math.cos(theta);
				new_point.y = y + r * Math.sin(theta);
				new_point.z = start_position.z - nodeOffset;
			}
		} else {
			new_point.x = x + r * Math.cos(theta);
			new_point.y = y + r * Math.sin(theta);
			new_point.z = start_position.z;
		}
	}

	return new_point;
}

function thereAreAdjacent(collection) {
	for (let collectionIndex in collection) {
		let curr_vicini = collection[collectionIndex].vicini.filter(
			(elem) => elem instanceof HeriverseNode
		);
		if (curr_vicini.length > 0) return true;
	}
	return false;
}

function createTextSprite(text, fileName, nodeName) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 512;
	canvas.height = 256;

	const background = new Image();
	background.src = APP_PATH + "res/graphicons/" + fileName + ".svg";

	return new Promise((resolve) => {
		background.onload = () => {
			context.drawImage(background, 0, 0, canvas.width, canvas.height);

			context.font = "38pt Arial";
			context.color = "red";
			switch (fileName) {
				case HeriverseNode.NODE_TYPE.PROPERTY:
				case HeriverseNode.STRATIGRAPHIC_TYPE.SF:
				case HeriverseNode.STRATIGRAPHIC_TYPE.SERSU:
				case HeriverseNode.STRATIGRAPHIC_TYPE.US:
				case HeriverseNode.STRATIGRAPHIC_TYPE.USD:
				case HeriverseNode.STRATIGRAPHIC_TYPE.UTR:
					context.fillStyle = "black";
					break;
				case HeriverseNode.STRATIGRAPHIC_TYPE.USVs:
				case HeriverseNode.STRATIGRAPHIC_TYPE.USVn:
				case HeriverseNode.STRATIGRAPHIC_TYPE.SERUSVN:
				case HeriverseNode.STRATIGRAPHIC_TYPE.SERUSVS:
				case HeriverseNode.STRATIGRAPHIC_TYPE.VSF:
					context.fillStyle = "white";
					break;
				default:
					context.fillStyle = "darkgreen";
					break;
			}

			context.textAlign = "center";
			switch (fileName) {
				case HeriverseNode.NODE_TYPE.COMBINER:
				case HeriverseNode.NODE_TYPE.EXTRACTOR:
				case HeriverseNode.NODE_TYPE.DOCUMENT:
				case HeriverseNode.NODE_TYPE.EPOCH:
				case HeriverseNode.NODE_TYPE.ACTIVITY_NODE_GROUP:
				case HeriverseNode.NODE_TYPE.PARADATA_NODE_GROUP:
				case HeriverseNode.NODE_TYPE.LINK:
					context.fillText("", canvas.width / 2, canvas.height / 2);
					break;
				case HeriverseNode.NODE_TYPE.LINK:
					context.fillText(nodeName, canvas.width / 2, canvas.height / 2);
					break;
				default:
					context.fillText(text, canvas.width / 2, canvas.height / 2);
					break;
			}

			const texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;

			const material = new THREE.SpriteMaterial({
				map: texture,
				depthTest: false,
			});
			const sprite = new THREE.Sprite(material);

			const scaleFactor = 0.00008;
			const scaleFactor2 = 0.00008;
			const scaleFactor3 = 0.00005;
			const scaleFactor4 = 0.00007;

			switch (fileName) {
				case HeriverseNode.NODE_TYPE.PROPERTY:
				case HeriverseNode.STRATIGRAPHIC_TYPE.SF:
				case HeriverseNode.STRATIGRAPHIC_TYPE.SERSU:
				case HeriverseNode.STRATIGRAPHIC_TYPE.US:
				case HeriverseNode.STRATIGRAPHIC_TYPE.USD:
				case HeriverseNode.STRATIGRAPHIC_TYPE.UTR:
				case HeriverseNode.STRATIGRAPHIC_TYPE.USVs:
				case HeriverseNode.STRATIGRAPHIC_TYPE.USVn:
				case HeriverseNode.STRATIGRAPHIC_TYPE.SERUSVN:
				case HeriverseNode.STRATIGRAPHIC_TYPE.SERUSVS:
				case HeriverseNode.STRATIGRAPHIC_TYPE.VSF:
				case HeriverseNode.STRATIGRAPHIC_TYPE.TSU:
				case HeriverseNode.STRATIGRAPHIC_TYPE.SE:
					sprite.scale.set(scaleFactor * canvas.width, scaleFactor * canvas.height);
					break;
				case HeriverseNode.NODE_TYPE.DOCUMENT:
					sprite.scale.set(scaleFactor4 * canvas.height, scaleFactor3 * canvas.width);
					break;
				default:
					sprite.scale.set(scaleFactor * canvas.height, scaleFactor2 * canvas.height);
					break;
			}

			resolve(sprite);
		};
	});
}

function drawEdge_old_old(id1, position1, id2, position2) {
	const material = new THREE.LineBasicMaterial({
		color: ATON.MatHub.colors["white"],
		depthTest: false,
	});
	const points = [];
	points.push(new THREE.Vector3(position1.x, position1.y, position1.z));
	points.push(new THREE.Vector3(position2.x, position2.y, position2.z));

	const geometry = new THREE.BufferGeometry().setFromPoints(points);

	const line = new THREE.Line(geometry, material);
	ATON.getRootScene().add(line);
	line.userData = { node1: id1, node2: id2 };
	HeriverseGraphDrawer.edges.push(line);
}

function drawEdge_old(id1, position1, id2, position2, type, direction) {
	let material = relations_material_map[type];

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
	ATON.getRootScene().add(line);
	line.userData = { node1: id1, node2: id2 };
	HeriverseGraphDrawer.edges.push(line);
}

function drawEdge(id1, position1, id2, position2, type, direction) {
	let material;

	if (type === "is_before") {
		material = new LineMaterial({
			color: 0x000000,
			linewidth: 2,
			dashed: true,
			dashSize: convertPosition(position1).distanceTo(convertPosition(position2)) * 0.1,
			gapSize: convertPosition(position1).distanceTo(convertPosition(position2)) * 0.1,
			opacity: 1,
			transparent: true,
			depthTest: false,
		});
	} else if (type === "has_data_provenance") {
		material = new LineMaterial({
			color: 0x000000,
			linewidth: 2,
			dashed: true,
			dashSize: convertPosition(position1).distanceTo(convertPosition(position2)) * 0.3,
			gapSize: convertPosition(position1).distanceTo(convertPosition(position2)) * 0.025,
			opacity: 1,
			transparent: true,
			depthTest: false,
		});
	} else {
		material = relations_material_map[type];
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
		new THREE.ConeGeometry(0.04, 0.07, 16),
		new THREE.MeshBasicMaterial({ color: 0x000000, depthTest: false })
	);

	if (direction === "from") {
		arrowHead.position.copy(convertPosition(position2));
		const directionPoint = new THREE.Vector3()
			.subVectors(convertPosition(position2), convertPosition(position1))
			.normalize();
		arrowHead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), directionPoint);

		arrowHead.position.sub(
			directionPoint.multiplyScalar(
				convertPosition(position1).distanceTo(convertPosition(position2)) * 0.5
			)
		);

		edgeGroup.add(arrowHead);
	} else if (direction === "to") {
		arrowHead.position.copy(convertPosition(position2));
		const directionPoint = new THREE.Vector3()
			.subVectors(convertPosition(position1), convertPosition(position2))
			.normalize();
		arrowHead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), directionPoint);

		arrowHead.position.add(
			directionPoint.multiplyScalar(
				convertPosition(position1).distanceTo(convertPosition(position2)) * 0.5
			)
		);

		edgeGroup.add(arrowHead);
	} else if (direction === "both") {
		const arroeHead_2 = new THREE.Mesh(
			new THREE.ConeGeometry(0.02, 0.05, 16),
			new THREE.MeshBasicMaterial({ color: 0x000000 })
		);

		arrowHead.position.copy(convertPosition(position2));
		arroeHead_2.position.copy(convertPosition(position2));
		const directionPoint = new THREE.Vector3()
			.subVectors(convertPosition(position1), convertPosition(position2))
			.normalize();
		const directionPoint_2 = new THREE.Vector3()
			.subVectors(convertPosition(position2), convertPosition(position1))
			.normalize();
		arrowHead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), directionPoint);
		arroeHead_2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), directionPoint_2);

		arrowHead.position.add(
			directionPoint.multiplyScalar(
				convertPosition(position1).distanceTo(convertPosition(position2)) * 0.25
			)
		);
		arroeHead_2.position.sub(
			directionPoint.multiplyScalar(
				convertPosition(position1).distanceTo(convertPosition(position2)) * 0.75
			)
		);

		edgeGroup.add(arrowHead);
		edgeGroup.add(arroeHead_2);
	}

	ATON.getRootScene().add(edgeGroup);
	line.userData = { node1: id1, node2: id2 };
	HeriverseGraphDrawer.edges.push(edgeGroup);
}

function convertPosition(point) {
	return new THREE.Vector3(point.x, point.y, point.z);
}

HeriverseGraphDrawer.currentQueryValidForLocomotion = () => {
	return HeriverseGraphDrawer._bValidLocomotion;
};

HeriverseGraphDrawer.locomotionValidator = () => {
	if (ATON._queryDataSem === undefined) {
		HeriverseGraphDrawer._bValidLocomotion = false;
		return;
	}

	let qs = ATON._queryDataSem;

	let P = qs.p;
	let N = qs.n;
	let d = qs.d;

	if (d <= ATON.Nav.MIN_LOC_VALID_DIST) {
		HeriverseGraphDrawer._bValidLocomotion = false;
		return;
	}

	if (!N) {
		HeriverseGraphDrawer._bValidLocomotion = false;
		return;
	}

	if (N.y <= 0.7) {
		HeriverseGraphDrawer._bValidLocomotion = false;
		return;
	}

	HeriverseGraphDrawer._bValidLocomotion = true;
};
HeriverseGraphDrawer.teleportOnQueriedPoint = () => {
	if (!HeriverseGraphDrawer.currentQueryValidForLocomotion()) return false;

	const P = ATON._queryDataSem.p;

	HeriverseGraphDrawer.requestPOV(
		new ATON.POV().setPosition(P.x, P.y + ATON.userHeight, P.z),
		XR.STD_TELEP_DURATION
	);

	return true;
};
HeriverseGraphDrawer.requestPOV = (pov, duration, bApplyWorldScale) => {
	if (ATON._tPOVcall >= 0.0) return;
	if (pov === undefined) return;
	if (ATON.XR._bPresenting && ATON.XR._sessionType === "immersive-ar") return;

	if (duration !== undefined) Nav.POVtransitionDuration = duration;
	else Nav.POVtransitionDuration = Nav.STD_POV_TRANS_DURATION;

	if (ATON.XR.isPresenting()) {
		Nav._reqPOV.pos.copy(pov.pos ? pov.pos : Nav._currPOV.pos);
		Nav._fromPOV.pos.copy(Nav._currPOV.pos);

		ATON.XR._reqPos.copy(pov.pos ? pov.pos : Nav._currPOV.pos);
		ATON.XR._fromPos.copy(ATON.XR._currPos);
	} else {
		Nav._reqPOV.pos.copy(pov.pos ? pov.pos : Nav._currPOV.pos);
		Nav._reqPOV.target.copy(pov.target ? pov.target : Nav._currPOV.target);
		Nav._reqPOV.fov = pov.fov ? pov.fov : Nav._currPOV.fov;

		Nav._fromPOV.pos.copy(Nav._currPOV.pos);
		Nav._fromPOV.target.copy(Nav._currPOV.target);
		Nav._fromPOV.fov = Nav._currPOV.fov;
	}

	if (bApplyWorldScale) {
		if (pov.pos) {
			Nav._reqPOV.pos.x *= ATON._worldScale;
			Nav._reqPOV.pos.y *= ATON._worldScale;
			Nav._reqPOV.pos.z *= ATON._worldScale;

			if (ATON.XR.isPresenting()) {
				ATON.XR._reqPos.x *= ATON._worldScale;
				ATON.XR._reqPos.y *= ATON._worldScale;
				ATON.XR._reqPos.z *= ATON._worldScale;
			}
		}
		if (pov.target) {
			Nav._reqPOV.target.x *= ATON._worldScale;
			Nav._reqPOV.target.y *= ATON._worldScale;
			Nav._reqPOV.target.z *= ATON._worldScale;
		}
	}

	Nav._tPOVcall = ATON._clock.elapsedTime;
	ATON.fireEvent("POVTransitionRequested", pov.id);
};

HeriverseGraphDrawer.drawController = (controller) => {
	if (controller == ATON.XR.HAND_R) {
		HeriverseGraphDrawer.wristRightPanel = new ThreeMeshUI.Block({
			width: MAIN_PANEL_WIDTH,
			height: MAIN_PANEL_HEIGHT,
			padding: 0.02,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: new THREE.Color(0x666666),
			borderRadius: 0.02,
			fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
			fontTexture: APP_PATH + "res/fonts/custom.png",
		});
		const text = new ThreeMeshUI.Text({
			content: welcome_text,
			fontSize: 0.02,
		});
		HeriverseGraphDrawer.rightPanelElements.push(text);

		HeriverseGraphDrawer.wristRightPanel.add(text);
		HeriverseGraphDrawer.wristRightPanel.position.set(0.05, 0, 0.15);
		HeriverseGraphDrawer.wristRightPanel.rotation.x = -Math.PI / 2;
		HeriverseGraphDrawer.wristRightPanel.rotation.z = -Math.PI / 2;
		HeriverseGraphDrawer.wristRightPanel.rotation.y = Math.PI / 2;
		ATON.XR.controller0.add(HeriverseGraphDrawer.wristRightPanel);
		setTimeout(() => {
			HeriverseGraphDrawer.wristRightPanel.update(true, true, true);
			ThreeMeshUI.update();
		}, 150);
	} else if (controller == ATON.XR.HAND_L) {
		const border_offset = 0.01;

		HeriverseGraphDrawer.wristLeftPanel = new ThreeMeshUI.Block({
			padding: 0.02,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: new THREE.Color(0x666666),
			borderRadius: 0.02,
			fontFamily: APP_PATH + "res/fonts/Inter-VariableFont_opsz,wght-msdf.json",
			fontTexture: APP_PATH + "res/fonts/Inter-VariableFontopszwght.png",
		});

		let final_height = 0;
		let timeline_lenght = Heriverse.timeline.length;
		for (let i = 0; i < timeline_lenght; i++) {
			let tp = Heriverse.timeline[i];

			let epochButton = epochButtonBuilder(tp, SIDES.LEFT);
			HeriverseGraphDrawer.leftPanelElements.push(epochButton);
			HeriverseGraphDrawer.wristLeftPanel.add(epochButton);
			if (HeriverseGraphDrawer.wristLeftPanel.width !== epochButton.width + border_offset * 2) {
				HeriverseGraphDrawer.wristLeftPanel.width = epochButton.width + border_offset * 2;
			}
			final_height += epochButton.height + epochButton.margin * 2;
		}

		HeriverseGraphDrawer.wristLeftPanel.position.set(-0.05, 0, 0.15);
		HeriverseGraphDrawer.wristLeftPanel.rotation.x = Math.PI / 2;
		HeriverseGraphDrawer.wristLeftPanel.rotation.z = -Math.PI / 2;
		HeriverseGraphDrawer.wristLeftPanel.rotation.y = -Math.PI / 2;
		HeriverseGraphDrawer.wristLeftPanel.height = final_height + 2 * border_offset;
		ATON.XR.controller1.add(HeriverseGraphDrawer.wristLeftPanel);
		setTimeout(() => {
			HeriverseGraphDrawer.wristLeftPanel.update(true, true, true);
			ThreeMeshUI.update();
		}, 150);
	}
};

function epochButtonBuilder(tp, side) {
	let buttonId = tp.id + "Btn";
	let st = undefined;

	let epochButtonBlock = new ThreeMeshUI.Block({
		width: MAIN_PANEL_WIDTH * 0.65,
		height: MAIN_PANEL_HEIGHT * 0.25,
		margin: 0.005,
		borderRadius: 0.01,
		textAlign: "center",
		justifyContent: "center",
		backgroundOpacity: 0.4,
	});
	epochButtonBlock.add(
		new ThreeMeshUI.Text({
			content: tp.name,
			fontSize: 0.015,
		})
	);

	let buttonBlock = new ThreeMeshUI.Block({
		width: MAIN_PANEL_WIDTH * 0.65,
		height: MAIN_PANEL_HEIGHT * 0.25,
		backgroundOpacity: 0,
	});

	let epochButton = new Button(buttonId, BUTTON_WIDTH * 0.65);
	if (tp.color) {
		epochButtonBlock.backgroundColor = tp.color;
		epochButton.setBaseColor(new THREE.Color().setRGB(tp.r, tp.g, tp.b));
	}
	epochButton.onSelect = () => {
		Heriverse.goToPeriodById(tp.id);
	};
	epochButton.onHover = () => {
		epochButtonBlock.backgroundOpacity = 1;
	};
	epochButton.onLeave = () => {
		epochButtonBlock.backgroundOpacity = 0.4;
	};

	epochButton
		.setScale(0.2)
		.setBackgroundOpacity(0)
		.setBaseColor(new THREE.Color().setRGB(tp.color.r, tp.color.g, tp.color.b));

	buttonBlock.add(epochButton);
	epochButtonBlock.add(buttonBlock);

	if (side === SIDES.RIGHT) HeriverseGraphDrawer.elementsToDetachR.push(epochButton);
	else if (side === SIDES.LEFT) HeriverseGraphDrawer.elementsToDetachL.push(epochButton);

	return epochButtonBlock;
}

HeriverseGraphDrawer.drawDetailsOnWrist = (controller, node) => {
	if (controller == ATON.XR.HAND_R) {
		if (node) {
			resetPanel(SIDES.LEFT);
			resetPanel(SIDES.RIGHT);
			clearPanel(SIDES.LEFT);
			clearPanel(SIDES.RIGHT);
			addElementToPanel(SIDES.LEFT, node);
			addElementToPanel(SIDES.RIGHT, node);
			setTimeout(() => {
				HeriverseGraphDrawer.wristLeftPanel.update(true, true, true);
				HeriverseGraphDrawer.wristRightPanel.update(true, true, true);
				ThreeMeshUI.update();
			}, 150);
		} else {
			clearPanel(SIDES.LEFT);
			clearPanel(SIDES.RIGHT);
			resetPanel(SIDES.LEFT);
			resetPanel(SIDES.RIGHT);
			setTimeout(() => {
				HeriverseGraphDrawer.wristLeftPanel.update(true, true, true);
				HeriverseGraphDrawer.wristRightPanel.update(true, true, true);
				ThreeMeshUI.update();
			}, 150);
		}
	} else if (controller == ATON.XR.HAND_L) {
		resetPanel(SIDES.RIGHT);
		clearPanel(SIDES.RIGHT);

		setTimeout(() => {
			ThreeMeshUI.update();
		}, 150);
	}
};

function addElementToPanel(side, node) {
	if (side === SIDES.LEFT) {
		HeriverseGraphDrawer.wristLeftPanel.justifyContent = "";
		HeriverseGraphDrawer.wristLeftPanel.alignItems = "start";
		HeriverseGraphDrawer.wristLeftPanel.padding = 0;
		HeriverseGraphDrawer.wristLeftPanel.width = MAIN_PANEL_WIDTH;

		let offset = 0.015;

		const subPanel1 = new ThreeMeshUI.Block({
			width: MAIN_PANEL_WIDTH,
			height: MAIN_PANEL_HEIGHT,
			backgroundColor: new THREE.Color(0x222222),
			backgroundOpacity: 0,
			fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
			fontTexture: APP_PATH + "res/fonts/custom.png",
		});

		const subPanel2 = new ThreeMeshUI.Block({
			width: MAIN_PANEL_WIDTH,
			height: MAIN_PANEL_HEIGHT * 0.65,
			contentDirection: "row",
			alignItems: "start",
			backgroundColor: new THREE.Color(0x222222).toArray(),
			backgroundOpacity: 0,
			fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
			fontTexture: APP_PATH + "res/fonts/custom.png",
		});
		HeriverseGraphDrawer.leftPanelElements.push(subPanel2);
		HeriverseGraphDrawer.wristLeftPanel.add(subPanel2);

		const subPanel3 = new ThreeMeshUI.Block({
			width: MAIN_PANEL_WIDTH,
			height: MAIN_PANEL_HEIGHT * 0.5,
			contentDirection: "row",
			alignItems: "center",
			justifyContent: "space-evenly",
			backgroundColor: new THREE.Color(0x222222),
			backgroundOpacity: 0,
		});
		HeriverseGraphDrawer.leftPanelElements.push(subPanel3);
		HeriverseGraphDrawer.wristLeftPanel.add(subPanel3);

		const nameBlock = new ThreeMeshUI.Block({
			width: subPanel1.width,
			height: subPanel1.height * 0.25,
			textAlign: "center",
			backgroundOpacity: 0,
			fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
			fontTexture: APP_PATH + "res/fonts/custom.png",
		});
		subPanel1.add(nameBlock);
		const nodeName = new ThreeMeshUI.Text({
			content: node.name,
			fontSize: 0.02,
		});
		nameBlock.add(nodeName);
		if (node.description) {
			const descriptionBlock = new ThreeMeshUI.Block({
				width: subPanel1.width,
				height: subPanel1.height * 0.75,
				padding: 0.01,
				textAlign: "left",
				backgroundOpacity: 0,
				fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
				fontTexture: APP_PATH + "res/fonts/custom.png",
			});
			subPanel1.add(descriptionBlock);
			const nodeDescr = new ThreeMeshUI.Text({
				content: node.description,
				fontSize: 0.01,
			});
			descriptionBlock.add(nodeDescr);
		}

		const nodes_relation = [];
		let nodes_relation_index = 0;
		for (let relation in node.edges) {
			if (relation !== "from" && relation !== "to") {
				nodes_relation.push(relation);
			}
		}

		const adjacentsPanelCollection = [];
		for (let relation in nodes_relation) {
			let panel = panelAdjacentByRelation(node, nodes_relation[relation]);
			panel.visible = false;
			deactivatePanelButtons(panel.children);
			adjacentsPanelCollection.push(panel);
			subPanel2.add(panel);
		}

		let sP2length = Math.max(...adjacentsPanelCollection.map((obj) => obj.height));
		subPanel2.height = sP2length;
		adjacentsPanelCollection[nodes_relation_index].visible = true;
		adjacentsPanelCollection[nodes_relation_index].position.set(0.05, 0, 0);
		activatePanelButtons(adjacentsPanelCollection[nodes_relation_index].children);

		const blockButtonPrev = new ThreeMeshUI.Block({
			width: subPanel3.width * 0.25,
			height: subPanel3.height,
			backgroundOpacity: 0,
		});
		const buttonPrev = new Button("bPrev");
		buttonPrev.setScale(0.35).setIcon(APP_PATH + "res/graphicons/play_rev.png", true);
		buttonPrev.onSelect = () => {
			if (nodes_relation_index > 0) {
				adjacentsPanelCollection[nodes_relation_index].visible = false;
				deactivatePanelButtons(adjacentsPanelCollection[nodes_relation_index].children);
				nodes_relation_index--;
				adjacentsPanelCollection[nodes_relation_index].visible = true;
				adjacentsPanelCollection[nodes_relation_index].position.set(0, 0, 0);
				activatePanelButtons(adjacentsPanelCollection[nodes_relation_index].children);
				subPanel2.height = adjacentsPanelCollection[nodes_relation_index].height;
			}
		};
		blockButtonPrev.add(buttonPrev);
		HeriverseGraphDrawer.elementsToDetachL.push(buttonPrev);

		const blockButtonNext = new ThreeMeshUI.Block({
			width: subPanel3.width * 0.25,
			height: subPanel3.height,
			backgroundOpacity: 0,
		});
		const buttonNext = new Button("bNext");
		buttonNext.setScale(0.35).setIcon(APP_PATH + "res/graphicons/play.png", true);
		buttonNext.onSelect = () => {
			if (nodes_relation_index < nodes_relation.length - 1) {
				adjacentsPanelCollection[nodes_relation_index].visible = false;
				deactivatePanelButtons(adjacentsPanelCollection[nodes_relation_index].children);
				nodes_relation_index++;
				adjacentsPanelCollection[nodes_relation_index].visible = true;
				adjacentsPanelCollection[nodes_relation_index].position.set(0, 0, 0);
				activatePanelButtons(adjacentsPanelCollection[nodes_relation_index].children);
				subPanel2.height = adjacentsPanelCollection[nodes_relation_index].height;
			}
		};
		blockButtonNext.add(buttonNext);
		HeriverseGraphDrawer.elementsToDetachL.push(buttonNext);

		subPanel3.add(blockButtonPrev);
		subPanel3.add(blockButtonNext);

		HeriverseGraphDrawer.wristLeftPanel.height = subPanel2.height + subPanel3.height + offset;
	} else if (side === SIDES.RIGHT) {
		const titleBlock = new ThreeMeshUI.Block({
			width: MAIN_PANEL_WIDTH,
			height: MAIN_PANEL_HEIGHT * 0.25,
			interLine: 0.01,
			backgroundColor: new THREE.Color(0x222222),
			backgroundOpacity: 0,
			justifyContent: "start",
			fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
			fontTexture: APP_PATH + "res/fonts/custom.png",
		});
		HeriverseGraphDrawer.wristRightPanel.add(titleBlock);
		HeriverseGraphDrawer.rightPanelElements.push(titleBlock);

		const nameText = new ThreeMeshUI.Text({
			content: node.name,
			fontSize: 0.015,
		});
		titleBlock.add(nameText);

		let descBlock;
		let descText;
		if (node.description) {
			descBlock = new ThreeMeshUI.Block({
				width: MAIN_PANEL_WIDTH,
				height: MAIN_PANEL_HEIGHT * 0.5,
				padding: 0.01,
				maring: 0.01,
				alignItems: "center",
				backgroundColor: new THREE.Color(0x222222),
				backgroundOpacity: 0,
				fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
				fontTexture: APP_PATH + "res/fonts/custom.png",
			});
			descText = new ThreeMeshUI.Text({
				content: node.description,
				fontSize: 0.01,
			});
			descBlock.add(descText);
			HeriverseGraphDrawer.wristRightPanel.add(descBlock);
			HeriverseGraphDrawer.rightPanelElements.push(descBlock);
		}
		HeriverseGraphDrawer.wristRightPanel.height = titleBlock.height;
		if (descBlock)
			HeriverseGraphDrawer.wristRightPanel.height += descBlock.height + descBlock.margin * 2;
	}
}

function panelAdjacentByRelation(node, relation) {
	const panel = new ThreeMeshUI.Block({
		width: MAIN_PANEL_WIDTH,
		height: MAIN_PANEL_HEIGHT * 0.65,
		alignItems: "center",
		backgroundColor: new THREE.Color(0x222222),
		backgroundOpacity: 0,
		fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
		fontTexture: APP_PATH + "res/fonts/custom.png",
	});

	let panelFinalHeight = 0;
	let nodesByRelation = node.getNeighborsByRelationP(relation, HeriverseNode.DIRECTIONS.BOTH);
	if (Object.keys(nodesByRelation).length <= 0) return;
	let relationName = new ThreeMeshUI.Block({
		width: MAIN_PANEL_WIDTH,
		height: MAIN_PANEL_HEIGHT * 0.3,
		borderRadius: 0,
		padding: 0.005,
		margin: 0.01,
		backgroundOpacity: 0,
		textAlign: "left",
		fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
		fontTexture: APP_PATH + "res/fonts/custom.png",
	});

	panelFinalHeight = relationName.height + relationName.margin * 2;

	relationName.add(
		new ThreeMeshUI.Text({
			content: HeriverseNode.RELATION_LABELS[relation],
			fontSize: 0.008,
		})
	);
	panel.add(relationName);
	for (let adjacentIndex in nodesByRelation) {
		let row = buildAdjacentEntry(nodesByRelation[adjacentIndex], panel);
		panel.add(row);
		panelFinalHeight += row.height + row.margin * 2;
	}
	panel.height = panelFinalHeight;

	return panel;
}

function deactivatePanelButtons(panelChildren) {
	for (let childIndex in panelChildren) {
		if (childIndex > 1) {
			panelChildren[childIndex].children[3].children[1].hide();
		}
	}
}
function activatePanelButtons(panelChildren) {
	for (let childIndex in panelChildren) {
		if (childIndex > 1) {
			panelChildren[childIndex].children[3].children[1].show();
		}
	}
}

/**
 * Clears the specified side panel of the application.
 *
 * @param {string} side - The side of the panel to clear. It can be either 'right', 'left', or 'both'.
 * @returns {void}
 */
function clearPanel(side) {
	if (side === SIDES.RIGHT) {
		if (HeriverseGraphDrawer.elementsToDetachR.length > 0) {
			HeriverseGraphDrawer.elementsToDetachR.forEach((element) => {
				element.disablePicking();
				HeriverseGraphDrawer.uiElements[element.id] = undefined;
				ATON.getRootUI().remove(element);
			});

			HeriverseGraphDrawer.elementsToDetachR.length = 0;
		}

		HeriverseGraphDrawer.rightPanelElements.forEach((element) => {
			HeriverseGraphDrawer.wristRightPanel.remove(element);
		});
		HeriverseGraphDrawer.rightPanelElements.length = 0;
	} else if (side === SIDES.LEFT) {
		if (HeriverseGraphDrawer.elementsToDetachL.length > 0) {
			HeriverseGraphDrawer.elementsToDetachL.forEach((element) => {
				element.disablePicking();
				ATON.getRootUI().remove(element);
			});

			HeriverseGraphDrawer.elementsToDetachL.length = 0;
		}

		HeriverseGraphDrawer.leftPanelElements.forEach((element) => {
			HeriverseGraphDrawer.wristLeftPanel.remove(element);
		});
		HeriverseGraphDrawer.leftPanelElements.length = 0;
	} else if (side === SIDES.BOTH) {
		if (HeriverseGraphDrawer.elementsToDetachR.length > 0) {
			HeriverseGraphDrawer.elementsToDetachR.forEach((element) => {
				element.disablePicking();
				HeriverseGraphDrawer.uiElements[element.id] = undefined;
				ATON.getRootUI().remove(element);
			});

			HeriverseGraphDrawer.elementsToDetachR.length = 0;
		}
		if (HeriverseGraphDrawer.elementsToDetachL.length > 0) {
			HeriverseGraphDrawer.elementsToDetachL.forEach((element) => {
				element.disablePicking();
				ATON.getRootUI().remove(element);
			});

			HeriverseGraphDrawer.elementsToDetachL.length = 0;
		}

		HeriverseGraphDrawer.rightPanelElements.forEach((element) => {
			HeriverseGraphDrawer.wristRightPanel.remove(element);
		});
		HeriverseGraphDrawer.rightPanelElements.length = 0;

		HeriverseGraphDrawer.leftPanelElements.forEach((element) => {
			HeriverseGraphDrawer.wristLeftPanel.remove(element);
		});
		HeriverseGraphDrawer.leftPanelElements.length = 0;
	}
}

/**
 * Resets the panel for the specified hand side.
 *
 * @param {string} side - The hand side to reset the panel for. It can be either 'left', 'right', or 'both'.
 * @returns {void}
 */
function resetPanel(side) {
	if (side === SIDES.LEFT) {
		HeriverseGraphDrawer.wristLeftPanel.justifyContent = "center";
		HeriverseGraphDrawer.wristLeftPanel.alignItems = "center";
		HeriverseGraphDrawer.wristLeftPanel.padding = 0.02;
		HeriverseGraphDrawer.wristLeftPanel.height = 0.125;
		HeriverseGraphDrawer.wristLeftPanel.position.y = 0;

		while (HeriverseGraphDrawer.wristLeftPanel.children.length > 1) {
			let child = HeriverseGraphDrawer.wristLeftPanel.children[1];
			HeriverseGraphDrawer.wristLeftPanel.remove(child);
		}

		const border_offset = 0.01;
		let final_height = 0;
		let timeline_lenght = Heriverse.currEM.timeline.length;
		for (let i = 0; i < timeline_lenght; i++) {
			let tp = Heriverse.currEM.timeline[i];
			let epochButton = epochButtonBuilder(tp, SIDES.LEFT);
			HeriverseGraphDrawer.leftPanelElements.push(epochButton);
			HeriverseGraphDrawer.wristLeftPanel.add(epochButton);
			if (HeriverseGraphDrawer.wristLeftPanel.width !== epochButton.width + 2 * border_offset) {
				HeriverseGraphDrawer.wristLeftPanel.width = epochButton.width + 2 * border_offset;
			}
			final_height += epochButton.height + epochButton.margin * 2;
		}
		HeriverseGraphDrawer.wristLeftPanel.height = final_height + 2 * border_offset;
		ATON.XR.controller1.add(HeriverseGraphDrawer.wristLeftPanel);
	} else if (side === SIDES.RIGHT) {
		HeriverseGraphDrawer.wristRightPanel.height = 0.125;
		let text = new ThreeMeshUI.Text({
			content: welcome_text,
			fontSize: 0.02,
		});
		HeriverseGraphDrawer.rightPanelElements.push(text);

		HeriverseGraphDrawer.wristRightPanel.add(text);
	}
}

function buildAdjacentEntry(node, subPanel) {
	let uiNode_index = "rE" + node.name;

	let rowEntry = new ThreeMeshUI.Block({
		contentDirection: "row",
		width: MAIN_PANEL_WIDTH,
		height: MAIN_PANEL_HEIGHT * 0.2,
		margin: 0.01,
		borderRadius: 0,
		backgroundOpacity: 0,
		justifyContent: "center",
		alignItems: "center",
		fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
		fontTexture: APP_PATH + "res/fonts/custom.png",
	});

	let entryButton = new Button(uiNode_index, 12);
	entryButton.baseOpacity = 0;
	entryButton.hoverOpacity = 0;
	entryButton.onSelect = () => {
		clearPanel(SIDES.RIGHT);

		addElementToPanel(SIDES.RIGHT, node);
		setTimeout(() => {
			HeriverseGraphDrawer.wristRightPanel.update(true, true, true);
			ThreeMeshUI.update();
		}, 150);
	};
	entryButton.setScale(0.2).setBackgroundOpacity(0);

	HeriverseGraphDrawer.elementsToDetachL.push(entryButton);

	let buttonBlock = new ThreeMeshUI.Block({
		width: rowEntry.width,
		height: rowEntry.height,
		margin: rowEntry.margin,
		backgroundOpacity: 0,
		fontFamily: APP_PATH + "res/fonts/custom-msdf.json",
		fontTexture: APP_PATH + "res/fonts/custom.png",
	});
	buttonBlock.add(entryButton);

	let typeImg;
	if (
		node.type === "epoch" ||
		node.type === "semantic_shape" ||
		node.type === "ActivityNodeGroup" ||
		node.type === "ParadataNodeGroup" ||
		node.type === "author" ||
		node.type === "link"
	) {
		typeImg = new ThreeMeshUI.InlineBlock({
			height: rowEntry.height * 0.75,
			width: rowEntry.height,
			borderRadius: 0,
			backgroundSize: "stretch",
		});
	} else if (node.type === "document") {
		typeImg = new ThreeMeshUI.InlineBlock({
			height: 0.03,
			width: rowEntry.height * 0.75,
			borderRadius: 0,
			backgroundSize: "stretch",
		});
	} else {
		typeImg = new ThreeMeshUI.InlineBlock({
			height: rowEntry.height * 0.75,
			width: 0.03,
			borderRadius: 0,
			backgroundSize: "stretch",
		});
	}

	rowEntry.add(typeImg);

	HeriverseGraphDrawer.textureLoader.load(
		APP_PATH + "res/graphicons/" + node.type + ".png",
		(texture) => {
			typeImg.set({
				backgroundTexture: texture,
				backgroundOpacity: 1,
				backgroundColor: new THREE.Color(0xffffff),
			});
		}
	);

	const name = new ThreeMeshUI.Text({
		content: "\t\t" + node.name,
		fontSize: 0.01,
	});

	rowEntry.add(name);
	rowEntry.add(buttonBlock);

	HeriverseGraphDrawer.uiElements[uiNode_index] = rowEntry;

	return rowEntry;
}

function moveCameraTowardsGraph(graphGenarationPoint) {
	const surfaceNormal = graphGenarationPoint.face_normal;

	const distanceFromPoint = 4;

	const normal_x = Math.round(surfaceNormal.x);
	const normal_y = Math.round(surfaceNormal.y);
	const normal_z = Math.round(surfaceNormal.z);

	if (normal_x === 1) {
		ATON.Nav._camera.position.x = graphGenarationPoint.click_point.x + distanceFromPoint;
		ATON.Nav._camera.position.y = graphGenarationPoint.click_point.y;
		ATON.Nav._camera.position.z = graphGenarationPoint.click_point.z;
	} else if (normal_x === -1) {
		ATON.Nav._camera.position.x = graphGenarationPoint.click_point.x - distanceFromPoint;
		ATON.Nav._camera.position.y = graphGenarationPoint.click_point.y;
		ATON.Nav._camera.position.z = graphGenarationPoint.click_point.z;
	} else if (normal_y === 1) {
		ATON.Nav._camera.position.x = graphGenarationPoint.click_point.x;
		ATON.Nav._camera.position.y = graphGenarationPoint.click_point.y + distanceFromPoint;
		ATON.Nav._camera.position.z = graphGenarationPoint.click_point.z;
	} else if (normal_y === -1) {
		ATON.Nav._camera.position.x = graphGenarationPoint.click_point.x;
		ATON.Nav._camera.position.y = graphGenarationPoint.click_point.y - distanceFromPoint;
		ATON.Nav._camera.position.z = graphGenarationPoint.click_point.z;
	} else if (normal_z === 1) {
		ATON.Nav._camera.position.x = graphGenarationPoint.click_point.x;
		ATON.Nav._camera.position.y = graphGenarationPoint.click_point.y;
		ATON.Nav._camera.position.z = graphGenarationPoint.click_point.z + distanceFromPoint;
	} else if (normal_z === -1) {
		ATON.Nav._camera.position.x = graphGenarationPoint.click_point.x;
		ATON.Nav._camera.position.y = graphGenarationPoint.click_point.y;
		ATON.Nav._camera.position.z = graphGenarationPoint.click_point.z - distanceFromPoint;
	}

	ATON.Nav._controls.target.x = graphGenarationPoint.click_point.x;
	ATON.Nav._controls.target.y = graphGenarationPoint.click_point.y;
	ATON.Nav._controls.target.z = graphGenarationPoint.click_point.z;
}

HeriverseGraphDrawer.setupEventHandlers = () => {
	ATON.on("KeyPress", (k) => {
		if (
			k === "Escape" &&
			(Heriverse.MODE === Heriverse.MODETYPES.SCENE ||
				Heriverse.MODE === Heriverse.MODETYPES.EDITOR)
		) {
			HeriverseGraphDrawer.drawGraph(null, null, null, null, null);
		}
	});

	ATON.on("Tap", (e) => {
		let node = null;
		let position_info = null;
		if (ATON._hoveredSemNode) {
			let proxy = Heriverse.currEM.proxyNodes[ATON._hoveredSemNode];
			let semNode = Heriverse.currEM.EMnodes[ATON._hoveredSemNode];
			if (proxy) {
				node = proxy.node;
				position_info = HeriverseGraphDrawer.getPositionInfo();
			} else if (semNode) {
				Heriverse.HERUI.createSidebar(semNode);
				if (semNode.type === HeriverseNode.NODE_TYPE.DOCUMENT) {
					ATON.fireEvent(HeriverseEvents.Events.SHOW_DOCUMENT_LINK, semNode.id);
				} else if (HeriverseGraph.stratigraphicTypes.includes(semNode.type)) {
				}
				return;
			}
		}
		if (position_info) {
			HeriverseGraphDrawer.drawGraph(
				node,
				position_info.click_point,
				position_info.face_normal,
				position_info.horizontal,
				position_info.sideFace
			);
			moveCameraTowardsGraph(position_info);
		} else {
			HeriverseGraphDrawer.drawGraph(node, null, null, null, null);
		}
	});

	ATON.on("XRcontrollerConnected", (c) => {
		if (c === ATON.XR.HAND_R) ATON.SUI.infoNode.delete();
		HeriverseGraphDrawer.drawController(c);
	});

	ATON.on("XRselectStart", (c) => {
		if (c == ATON.XR.HAND_R) {
			if (ATON._queryDataUI) return;
			if (ATON._queryDataScene) {
				if (!ATON.Nav._bLocValidator) ATON.Nav.toggleLocomotionValidator(true);

				if (ATON.Nav._bLocValidator) {
					ATON.Nav.locomotionValidator();
				}
				if (ATON.XR._bPresenting && ATON.XR._sessionType === "immersive-vr")
					ATON.XR.teleportOnQueriedPoint();
			}
		}
	});

	ATON.on("XRsqueezeStart", (c) => {
		if (c == ATON.XR.HAND_R) {
			let node = null;
			let position_info = null;
			if (ATON._hoveredSemNode) {
				let proxy = Heriverse.currEM.proxyNodes[ATON._hoveredSemNode];
				let semNode = Heriverse.currEM.EMnodes[ATON._hoveredSemNode];
				if (proxy) {
					node = proxy.node;
					position_info = HeriverseGraphDrawer.getPositionInfo();
				} else if (semNode) {
					clearPanel(SIDES.RIGHT);
					addElementToPanel(SIDES.RIGHT, semNode);
					setTimeout(() => {
						HeriverseGraphDrawer.wristRightPanel.update(true, true, true);
						ThreeMeshUI.update();
					}, 150);
					return;
				}
			}
			if (position_info) {
				HeriverseGraphDrawer.drawGraph(
					node,
					position_info.click_point,
					position_info.face_normal,
					position_info.horizontal,
					position_info.sideFace
				);
				HeriverseGraphDrawer.drawDetailsOnWrist(c, node);
			} else {
				HeriverseGraphDrawer.drawGraph(node, null, null, null, null);
				HeriverseGraphDrawer.drawDetailsOnWrist(ATON.XR.HAND_R, node);
				HeriverseGraphDrawer.drawDetailsOnWrist(ATON.XR.HAND_L, node);
			}
		}
	});

	ATON.on("SemanticNodeLeave", (semid) => {
		let S = ATON.getSemanticNode(semid);
		if (S) S.restoreDefaultMaterial();
	});

	ATON.on("SemanticNodeHover", (semid) => {
		let S = ATON.getSemanticNode(semid);
		if (S) S.highlight();
	});

	ATON.on("SemanticNodeSelect", (semid) => {});
};

class Button extends ATON.Node {
	constructor(uiid, widthRatio = 1.0, heightRatio = 1.0, fsize = 1.0) {
		super(uiid, ATON.NTYPES.UI);

		this.baseColor = ATON.MatHub.colors.black;
		this.switchColor = ATON.MatHub.colors.green;

		this.baseOpacity = 0.5;
		this.hoverOpacity = 0.8;

		this._bSwitched = false;

		this.container = new ThreeMeshUI.Block({
			width: 0.1 * widthRatio,
			height: 0.1 * heightRatio,
			padding: 0.01,
			borderRadius: 0.02,
			backgroundColor: this.baseColor,
			backgroundOpacity: this.baseOpacity,
			fontFamily: "../../res/fonts/custom-msdf.json",
			fontTexture: "../../res/fonts/custom.png",
			justifyContent: "center",
			textAlign: "center",
		});
		this.add(this.container);

		this.uiText = new ThreeMeshUI.Text({
			content: "",
			fontSize: 0.02 * fsize,
			fontColor: ATON.MatHub.colors.white,
		});
		this.container.add(this.uiText);

		let trw = ATON.SUI.STD_BTN_SIZE * 0.9 * widthRatio;
		let trh = ATON.SUI.STD_BTN_SIZE * 0.9 * heightRatio;
		this._trigger = new THREE.Mesh(
			new THREE.PlaneGeometry(trw, trh, 2),
			ATON.MatHub.materials.fullyTransparent
		);
		this._trigger.position.set(0, 0, 0.005);

		this.add(this._trigger);

		this.onHover = () => {
			this.container.set({
				backgroundOpacity: this.hoverOpacity,
			});
		};
		this.onLeave = () => {
			this.container.set({
				backgroundOpacity: this.baseOpacity,
			});
		};

		this.enablePicking();

		this.traverse((o) => {
			if (o.material) o.material.depthWrite = false;
		});

		setTimeout(() => {
			ThreeMeshUI.update();
		}, 150);
	}

	/**
  Set base color of the button
  @param {THREE.Color} c - the color
  */
	setBaseColor(c) {
		this.baseColor = c;
		if (!this._bSwitched) this.container.set({ backgroundColor: this.baseColor });

		setTimeout(() => {
			ThreeMeshUI.update();
		}, 150);
		return this;
	}

	/**
  Set button switch color (when activated)
  @param {THREE.Color} c - the color
  */
	setSwitchColor(c) {
		this.switchColor = c;
		if (this._bSwitched) this.container.set({ backgroundColor: this.switchColor });

		setTimeout(() => {
			ThreeMeshUI.update();
		}, 150);
		return this;
	}

	setBackgroundOpacity(f) {
		this.container.set({ backgroundOpacity: f });
		this.baseOpacity = f;

		setTimeout(() => {
			ThreeMeshUI.update();
		}, 150);
		return this;
	}

	/**
  Set button text
  @param {string} text
  */
	setText(text) {
		this.uiText.set({ content: text });

		setTimeout(() => {
			ThreeMeshUI.update();
		}, 150);
		return this;
	}

	/**
  Switch the button (ON/OFF)
  @param {boolean} b
  */
	switch(b) {
		this._bSwitched = b;
		if (b) this.container.set({ backgroundColor: this.switchColor });
		else this.container.set({ backgroundColor: this.baseColor });

		setTimeout(() => {
			ThreeMeshUI.update();
		}, 150);
		return this;
	}

	/**
  Set button icon
  @param {string} url - the url to the icon (tipically a PNG file)
  */
	setIcon(url, bNoBackground) {
		ATON.Utils.textureLoader.load(url, (texture) => {
			this._trigger.material = new THREE.MeshStandardMaterial({
				map: texture,
				transparent: true,
				depthWrite: false,
			});

			if (bNoBackground) {
				this.setBackgroundOpacity(0.0);
				this.hoverOpacity = 0.0;
			}

			this.uiText.position.set(0, -0.035, 0);
		});

		setTimeout(() => {
			ThreeMeshUI.update();
		}, 150);
		return this;
	}
}

export default HeriverseGraphDrawer;
