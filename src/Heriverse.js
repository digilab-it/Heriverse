/*!
    @preserve

 	Heriverse

 	@author 3D Research s.r.l.

==================================================================================*/
"use strict";

/**
@namespace Heriverse
*/
let Heriverse = {};
window.Heriverse = Heriverse;

import EM from "./EM.js";
import Multigraph from "./Multigraph.js";
import ML2JSON from "./ML2JSON.js";
import HERUI from "./ui.js";
import APISimulator from "../APIsimulator.js";
import UI from "./ui.js";
import Proxy from "./Models/proxy.js";
import HeriverseGraph from "./HeriverseGraph/HeriverseGraph.js";
import HeriverseEvents from "./HeriverseEvents.js";
import HeriverseNode from "./HeriverseGraph/HeriverseNode.js";
import ShelfGraph from "./ShelfGraph/ShelfGraph.js";
import Period from "./period.js";
let iconFolder = window.location.href.includes("heriverse-wapp")
	? "/a/heriverse-wapp/res/graphicons/"
	: window.location.href.includes("heriverse")
	? "/a/heriverse/res/graphicons/"
	: "";

Heriverse.EM = EM;
Heriverse.Multigraph = Multigraph;
Heriverse.HeriverseGraph = HeriverseGraph;
Heriverse.ShelfGraph = ShelfGraph;
Heriverse.HERUI = HERUI;
window.UI = HERUI;
Heriverse.ML2JSON = ML2JSON;
Heriverse.Scene = null;
Heriverse.Data = null;
Heriverse.ActualProxy;
Heriverse.ActualSceneNode;
Heriverse.SidebarOpened = false;

Heriverse.firstSetup = true;

Heriverse.YED_dNodeGraphics = "d6";
Heriverse.YED_dEdgeGraphics = "d10";
Heriverse.YED_dAttrDesc = "d5";
Heriverse.YED_dAttrURL = "d4";

Heriverse.YED_sSeriation = "ellipse";
Heriverse.YED_sUS = "rectangle";
Heriverse.YED_sUSVS = "parallelogram";
Heriverse.YED_sUSVN = "hexagon";
Heriverse.YED_sSF = "octagon";

Heriverse.MODE = 0;
Heriverse.currentGraphs = [];

Heriverse.MODETYPES = {
	SCENES: 0,
	DASHBOARD: 1,
	EDITOR: 2,
	SCENE: 3,
	GRAPH: 4,
};

Heriverse.NODETYPES = {
	SERIATION: 0,
	US: 1,
	USVS: 2,
	USVN: 3,
	SF: 4,
	UTR: 5,
	SERUSVN: 6,
	SERUSVS: 7,
	USD: 8,
	SERIALSU: 9,

	COMBINER: 10,
	EXTRACTOR: 11,
	DOCUMENT: 12,
	PROPERTY: 13,
	CONTINUITY: 14,
	NODESCENE: 15,
	REPRESENTATION_MODEL: 16,
	SEMANTIC_SHAPE: 17,
	EPOCH: 18,
	AUTHOR: 19,
	GEO_POSITION: 20,
	ACTIVITYNODEGROUP: 21,
	PARADATANODEGROUP: 22,
};

Heriverse.CONNECTION_RULES_NODETYPES = {
	STRATIGRAPHIC: "StratigraphicNode",
	PROPERTY: "PropertyNode",
	EXTRACTOR: "ExtractorNode",
	COMBINER: "CombinerNode",
	TIME_BRANCH_GROUP: "TimeBranchNodeGroup",
	REPRESENTATION_MODEL: "RepresentationModelNode",
	REPRESENTATION_MODEL_DOC: "RepresentationModelDocNode",
	REPRESENTATION_MODEL_SF: "RepresentationModelSpecialFindNode",
	EPOCH: "EpochNode",
	PARADATA: "ParadataNode",
	PARADATA_GROUP: "ParadataNodeGroup",
	DOCUMENT: "DocumentNode",
	ACTIVITY_GROUP: "ActivityNodeGroup",
	GRAPH: "GraphNode",
	GEO_POSITION: "GeoPositionNode",
	SPECIAL_FIND_UNIT: "SpecialFindUnit",
	NODE: "Node",
	SEMANTIC_SHAPE: "SemanticShapeNode",
	LICENSE: "LicenseNode",
	EMBARGO: "EmbargoNode",
	LINK: "LinkNode",
};

Heriverse.connection_rules = {};
Heriverse.properties_rules = {};

Heriverse.APP = ATON.App.realize();
Heriverse.APP.requireFlares(["Auth"]);

Heriverse.getIconURLbyType = (type) => {
	if (type === Heriverse.NODETYPES.SERIATION) return iconFolder + "SUseries.png";
	if (type === Heriverse.NODETYPES.US) return iconFolder + "US.svg";
	if (type === Heriverse.NODETYPES.USVS) return iconFolder + "USVs.svg";
	if (type === Heriverse.NODETYPES.USVN) return iconFolder + "USVn.svg";
	if (type === Heriverse.NODETYPES.SF) return iconFolder + "SF.svg";
	if (type === Heriverse.NODETYPES.UTR) return iconFolder + "UTR.svg";
	if (type === Heriverse.NODETYPES.SERUSVN) return iconFolder + "serUSVn.svg";
	if (type === Heriverse.NODETYPES.SERUSVS) return iconFolder + "serUSVs.svg";
	if (type === Heriverse.NODETYPES.USD) return iconFolder + "USD.svg";
	if (type === Heriverse.NODETYPES.SERIALSU) return iconFolder + "serSU.svg";

	if (type === Heriverse.NODETYPES.COMBINER) return iconFolder + "combiner.svg";
	if (type === Heriverse.NODETYPES.EXTRACTOR) return iconFolder + "extractor.svg";
	if (type === Heriverse.NODETYPES.DOCUMENT) return iconFolder + "document.svg";
	if (type === Heriverse.NODETYPES.PROPERTY) return iconFolder + "property.svg";
	if (type === Heriverse.NODETYPES.CONTINUITY) return iconFolder + "continuity.svg";
	if (type === Heriverse.NODETYPES.REPRESENTATION_MODEL) return iconFolder + "RM.svg";
	if (type === Heriverse.NODETYPES.SEMANTIC_SHAPE) return iconFolder + "semantic_shape.svg";
	if (type === Heriverse.NODETYPES.EPOCH) return iconFolder + "epoch.svg";
	if (type === Heriverse.NODETYPES.AUTHOR) return iconFolder + "author.svg";
	if (type === Heriverse.NODETYPES.GEO_POSITION) return iconFolder + "geo_position.svg";
	if (type === Heriverse.NODETYPES.ACTIVITYNODEGROUP) return iconFolder + "ActivityNodeGroup.svg";
	if (type === Heriverse.NODETYPES.PARADATANODEGROUP) return iconFolder + "ParadataNodeGroup.svg";

	return "";
};

Heriverse.getDosCoBaseURL = () => {
	return "";
};

Heriverse.getCRNodeTypeByNodeType = (type) => {
	switch (type) {
		case HeriverseNode.TYPE.STRATIGRAPHIC:
		case HeriverseNode.NODE_TYPE.STRATIGRAPHIC:
			return Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC;
		case HeriverseNode.TYPE.PROPERTIES:
		case HeriverseNode.NODE_TYPE.PROPERTY:
			return Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY;
		case HeriverseNode.TYPE.EXTRACTORS:
		case HeriverseNode.NODE_TYPE.EXTRACTOR:
			return Heriverse.CONNECTION_RULES_NODETYPES.EXTRACTOR;
		case HeriverseNode.TYPE.COMBINERS:
		case HeriverseNode.NODE_TYPE.COMBINER:
			return Heriverse.CONNECTION_RULES_NODETYPES.COMBINER;
		case "time_branch_group":
			return Heriverse.CONNECTION_RULES_NODETYPES.TIME_BRANCH_GROUP;
		case HeriverseNode.TYPE.REPRESENTATION_MODELS:
		case HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL:
			return Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL;
		case HeriverseNode.TYPE.REPRESENTATION_MODEL_DOC:
		case HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_DOC:
			return Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_DOC;
		case HeriverseNode.TYPE.REPRESENTATION_MODEL_SF:
		case HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_SF:
			return Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_SF;
		case HeriverseNode.TYPE.EPOCHS:
		case HeriverseNode.NODE_TYPE.EPOCH:
			return Heriverse.CONNECTION_RULES_NODETYPES.EPOCH;
		case "paradata":
			return Heriverse.CONNECTION_RULES_NODETYPES.PARADATA;
		case "parada_group":
			return Heriverse.CONNECTION_RULES_NODETYPES.PARADATA_GROUP;
		case HeriverseNode.TYPE.DOCUMENTS:
		case HeriverseNode.NODE_TYPE.DOCUMENT:
			return Heriverse.CONNECTION_RULES_NODETYPES.DOCUMENT;
		case "activity_group":
			return Heriverse.CONNECTION_RULES_NODETYPES.ACTIVITY_GROUP;
		case "graph":
			return Heriverse.CONNECTION_RULES_NODETYPES.GRAPH;
		case HeriverseNode.TYPE.GEO:
		case HeriverseNode.NODE_TYPE.GEO:
			return Heriverse.CONNECTION_RULES_NODETYPES.GEO_POSITION;
		case HeriverseNode.STRATIGRAPHIC_TYPE.SF:
			return Heriverse.CONNECTION_RULES_NODETYPES.SPECIAL_FIND_UNIT;
		case "node":
			return Heriverse.CONNECTION_RULES_NODETYPES.NODE;
		case HeriverseNode.TYPE.SEMANTIC_SHAPES:
		case HeriverseNode.NODE_TYPE.SEMANTIC_SHAPE:
			return Heriverse.CONNECTION_RULES_NODETYPES.SEMANTIC_SHAPE;
		case "license":
			return Heriverse.CONNECTION_RULES_NODETYPES.LICENSE;
		case "embargo":
			return Heriverse.CONNECTION_RULES_NODETYPES.EMBARGO;
		case HeriverseNode.TYPE.LINKS:
		case HeriverseNode.NODE_TYPE.LINK:
			return Heriverse.CONNECTION_RULES_NODETYPES.LINK;
		default:
			return type;
	}
};

Heriverse.getNodeTypeByCRNodeType = (crNodeType) => {
	switch (crNodeType) {
		case Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC:
			return HeriverseNode.NODE_TYPE.STRATIGRAPHIC;
		case Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY:
			return HeriverseNode.NODE_TYPE.PROPERTY;
		case Heriverse.CONNECTION_RULES_NODETYPES.EXTRACTOR:
			return HeriverseNode.NODE_TYPE.EXTRACTOR;
		case Heriverse.CONNECTION_RULES_NODETYPES.COMBINER:
			return HeriverseNode.NODE_TYPE.COMBINER;
		case Heriverse.CONNECTION_RULES_NODETYPES.TIME_BRANCH_GROUP:
			return "time_branch_group";
		case Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL:
			return HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL;
		case Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_DOC:
			return HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_DOC;
		case Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_SF:
			return HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_SF;
		case Heriverse.CONNECTION_RULES_NODETYPES.EPOCH:
			return HeriverseNode.NODE_TYPE.EPOCH;
		case Heriverse.CONNECTION_RULES_NODETYPES.PARADATA:
			return "paradata";
		case Heriverse.CONNECTION_RULES_NODETYPES.PARADATA_GROUP:
			return "parada_group";
		case Heriverse.CONNECTION_RULES_NODETYPES.DOCUMENT:
			return HeriverseNode.NODE_TYPE.DOCUMENT;
		case Heriverse.CONNECTION_RULES_NODETYPES.ACTIVITY_GROUP:
			return "activity_group";
		case Heriverse.CONNECTION_RULES_NODETYPES.GRAPH:
			return "graph";
		case Heriverse.CONNECTION_RULES_NODETYPES.GEO_POSITION:
			return HeriverseNode.NODE_TYPE.GEO;
		case Heriverse.CONNECTION_RULES_NODETYPES.SPECIAL_FIND_UNIT:
			return HeriverseNode.STRATIGRAPHIC_TYPE.SF;
		case Heriverse.CONNECTION_RULES_NODETYPES.NODE:
			return "node";
		case Heriverse.CONNECTION_RULES_NODETYPES.SEMANTIC_SHAPE:
			return HeriverseNode.NODE_TYPE.SEMANTIC_SHAPE;
		case Heriverse.CONNECTION_RULES_NODETYPES.LICENSE:
			return "license";
		case Heriverse.CONNECTION_RULES_NODETYPES.EMBARGO:
			return "embargo";
		case Heriverse.CONNECTION_RULES_NODETYPES.LINK:
			return HeriverseNode.NODE_TYPE.LINK;
		default:
			return crNodeType;
	}
};

Heriverse.ActualPOV = null;
Heriverse.hiddenPOV = null;
Heriverse.POVid = null;
Heriverse.povBtns = [];

Heriverse.x2js = new X2JS({ attributePrefix: "@" });

Heriverse.buildColorPalette = () => {
	Heriverse.colors = [];

	let gm = 4.0;
	let rm = 2.0;

	let gcol = new THREE.Color(0.031 * gm, 0.191 * gm, 0.026 * gm);
	let rcol = new THREE.Color(0.328 * rm, 0.033 * rm, 0.033 * rm);

	Heriverse.colors.push(gcol);
	Heriverse.colors.push(rcol);
	Heriverse.colors.push(new THREE.Color(0.018, 0.275, 0.799));
	Heriverse.colors.push(gcol);
	Heriverse.colors.push(new THREE.Color(0.799, 0.753, 0.347));

	Heriverse.matProxyOFF = [];
	Heriverse.matProxyON = [];

	for (let i in Heriverse.colors) {
		Heriverse.matProxyOFF.push(
			new THREE.MeshStandardMaterial({
				color: Heriverse.colors[i],
				transparent: true,
				depthWrite: false,
				opacity: 0.0, //0.2,
				//flatShading: true,
				depthTest: true,
				//side: THREE.DoubleSide
				//polygonOffset: true,
				//polygonOffsetFactor: -1,
				//polygonOffsetUnits: 1,
				//renderOrder: 2
			})
		);

		Heriverse.matProxyON.push(
			new THREE.MeshStandardMaterial({
				color: Heriverse.colors[i],
				transparent: true,
				depthWrite: false,
				opacity: 0.4,
			})
		);
	}
};

Heriverse.setProxiesOpacity = (f) => {
	for (let m in Heriverse.matProxyOFF) {
		Heriverse.matProxyOFF[m].opacity = f;
		Heriverse.matProxyON[m].opacity = f + 0.1;
	}
};

Heriverse.setProxiesAlwaysVisible = (b) => {
	Heriverse._bProxiesAlwaysVis = b;

	for (let m in Heriverse.matProxyOFF) {
		Heriverse.matProxyOFF[m].depthTest = !b;
		Heriverse.matProxyON[m].depthTest = !b;
	}
};

let setupLocomotionGraph = () => {
	ATON.Nav.addLocomotionNode(144.54261679038277, 670.822859752855, -500.104429378776, true);
	ATON.Nav.addLocomotionNode(146.54261679038277, 670.822859752855, -500.104429378776, true);
	ATON.Nav.toggleLocomotionValidator(false);
};

Heriverse.init = (page) => {
	if (page == "editor") {
		Heriverse.MODE = Heriverse.MODETYPES.EDITOR;
	} else {
		Heriverse.MODE = Heriverse.MODETYPES.SCENE;
	}

	Heriverse.API = new APISimulator("endpoint/");
	if (page == "scenes") {
		Heriverse.MODE = Heriverse.MODETYPES.SCENES;
		return;
	}
	if (page == "login") return Heriverse.redirectToLoginPage();
	if (page == "dashboard") {
		Heriverse.MODE = Heriverse.MODETYPES.SCENES;
		return;
	}
	Heriverse.APP.setup = () => {
		ATON.FE.realize();
		ATON.AuthOptions = {
			basepath: "heriverse",
			scenesPage: Utils.baseUrl + "/scenes",
			logo_pilot_header: Utils.baseUrl + "/assets/logo/heriverse_logo_horizontal.svg",
			logo_pilot_footer: Utils.baseUrl + "/assets/logo/heriverse_logo_horizontal.svg",
			logo_pilot_label_header: "Heriverse",
			logo_pilot_label_footer: "Heriverse",
			logo_pilot_header_url: Utils.pilotSite,
			logo_pilot_url_footer: Utils.pilotSite,
			header_title: "HERIVERSE",
			header_subtitle: "SELECT_A_SCENE",
			open_card_label: "OPEN_SCENE",
			search_params: ["title"],
		};
		Heriverse.APP.requireFlares(["Auth"]);
		ATON.on("AllFlaresReady", () => {
			if (Heriverse.MODE === Heriverse.MODETYPES.EDITOR) {
				ATON.Flares["Auth"].canEditScene(Heriverse.paramSID).then((isEditor) => {
					if (!isEditor) {
						let locComp = window.location.href.split("/editor");
						window.location.href = Utils.baseUrl + "/?scene=" + Heriverse.paramSID;
					} else {
						Heriverse.MODE = Heriverse.MODETYPES.EDITOR;
					}
				});
			}
		});
	};
	Heriverse.APP.run();

	Heriverse.paramSID = ATON.FE.urlParams.get("scene");
	Heriverse.currPeriodName = undefined;
	Heriverse.currGraphId = "";
	Heriverse.currGraphName = "";
	Heriverse._bShowAllProxies = false;

	Heriverse.buildColorPalette();
	ATON.FE.setupBasicUISounds();
	if (page == "editor") {
		Heriverse.MODE = Heriverse.MODETYPES.EDITOR;
	} else {
		Heriverse.MODE = Heriverse.MODETYPES.SCENE;
	}

	Heriverse.setupUI();
	setupLocomotionGraph();
	Heriverse.setupEventHandlers();

	$("body").prepend(
		"<div class='atonPopupLabelContainer'><div id='idPovLabel' class='atonPopupLabel' style='display:none'></div></div>"
	);

	Heriverse.setupPropertiesRules(Utils.baseUrl + "/src/3dgraphy_config_files/em_qualia_types.json");
	Heriverse.setupConnectionRules(
		Utils.baseUrl + "/src/3dgraphy_config_files/s3Dgraphy_connections_datamodel.json"
	);

	Heriverse.run();
};

Heriverse.redirectToLoginPage = () => {
	Heriverse.API = new APISimulator("endpoint/");
};

Heriverse.redirectToDashboardPage = () => {
	HERUI.buildDashboardUI();
};

Heriverse.createGalleryScenes = () => {
	Heriverse.API = new APISimulator("endpoint/");
	Heriverse.API.getScenes(() => {
		let scenes = Heriverse.API._scenes;
		HERUI.buildScenesUI(scenes);
	});
};
Heriverse.refresh = (data, shelf_update = false) => {
	if (data) {
		if (shelf_update) {
			Heriverse.Scene = ATON.SceneHub.currData;
			Heriverse.Scene._rev = data._rev;
			Heriverse.ResourceScene.resource_json.multigraph.graphs.shelf =
				data.resource_json.multigraph.graphs.shelf;
			Heriverse.ResourceScene._rev = data._rev;
			Heriverse.loadEM(null, false, true, data.resource_json.multigraph);
		} else {
			ATON.SceneHub.clear();
			ATON.SceneHub.currData = data.resource_json;
			ATON.SceneHub.currID = Heriverse.paramSID;
			ATON.SceneHub.parseScene(data.resource_json);
			Heriverse.Scene = ATON.SceneHub.currData;
			Heriverse.ResourceScene = data;
			Heriverse.loadEM(null, false, true, data.resource_json.multigraph);
		}
	}
};

Heriverse.run = (firstAttempt = true) => {
	if (Heriverse.paramSID === undefined || Heriverse.paramSID === null) {
		location.href = Utils.baseUrl + "/scenes";
		return;
	}
	$.ajax({
		dataType: "json",
		url: Utils.baseHost + "heriverse/scene/" + Heriverse.paramSID,
		headers: { authServer: "DIGILAB" },
		success: (data) => {
			ATON.SceneHub.currData = data.resource_json;
			ATON.SceneHub.currID = Heriverse.paramSID;
			ATON.SceneHub.parseScene(data.resource_json);
			ATON.SceneHub._bLoading = false;
			Heriverse.Scene = ATON.SceneHub.currData;
			Heriverse.ResourceScene = data;
			Heriverse.loadEM(
				Utils.baseHost + "uploads/" + Heriverse.paramSID,
				false,
				false,
				data.resource_json.multigraph
			);
		},
		error: (error) => {
			if (error.status == 401 && firstAttempt) {
				let errorMessage = "";
				if (error.responseJSON && error.responseJSON.message) {
					errorMessage = error.responseJSON.message;
				} else if (error.responseText) {
					errorMessage = error.responseText;
				} else {
					errorMessage = "An unexpected error occurred";
				}
				if (errorMessage == "Token not found or expired") {
					ATON.Flares["Auth"].refreshToken().then((refreshToken) => {
						if (refreshToken == true) {
							Heriverse.run(false);
						} else {
							location.href = Utils.baseUrl + "/login";
						}
					});
				}
			}
			location.href = Utils.baseUrl + "/login";
		},
	});
};

Heriverse.saveEM2JSON = () => {
	let EM_GraphML = new Heriverse.ML2JSON(ATON.PATH_SCENES + Heriverse.paramSID);
	EM_GraphML.parseGraphML(() => {
		EM_GraphML.realizeProxyGraphFromJSONNode();
		EM_GraphML.buildEMgraph();
		var a = document.createElement("a");
		a.href = URL.createObjectURL(
			new Blob([JSON.stringify(EM_GraphML.JSON)], { type: "application/json" })
		);
		a.download = "myscene.json";
		a.click();
	});
};

Heriverse.addEpoch = (label, min, max, start, end, color) => {
	Heriverse.currEM.addEpoch(label, min, max, start, end, color);
	Heriverse.loadEM("", false, true);
};
Heriverse.addNode = (id, type, name, description, author, url, url_type, time_start, time_end) => {
	Heriverse.currEM.addNode(
		id,
		type,
		name,
		description,
		author,
		url,
		url_type,
		time_start,
		time_end
	);
	Heriverse.loadEM("", false, true);
};
Heriverse.addEdge = (type, from, to) => {
	Heriverse.currEM.addEdge(type, from, to);
	Heriverse.loadEM("", false, true);
};

Heriverse.setScene = () => {
	ATON._rootSem.removeChildren();
	ATON._rootVisible.removeChildren();
	Heriverse.currEM = new Heriverse.Multigraph(Heriverse.currMG);
	if (!Heriverse.currGraphId) {
		Heriverse.currGraphId = Object.keys(Heriverse.ResourceScene.resource_json.multigraph.graphs)[0];
		Heriverse.currentGraphs = [Heriverse.currGraphId];
	}
	Heriverse.createEpochNodes();
	Heriverse.createRepresentationModelNodes();
	Heriverse.createSemanticShapeNodes();
	if (
		Heriverse.currEM &&
		Heriverse.currEM.mdgraph &&
		Heriverse.currEM.mdgraph.json &&
		Heriverse.currEM.mdgraph.json.graphs &&
		Heriverse.currEM.mdgraph.json.graphs.shelf
	)
		Heriverse.shelf = new Heriverse.ShelfGraph("", Heriverse.currEM.mdgraph.json);

	if (Heriverse.currentGraphs.length === 1) HERUI.buildTimelineSelector(Heriverse.timeline);
	else HERUI.buildPeriodFilter("#idTL");

	if (Heriverse.currentGraphs.length === 1)
		HERUI.buildTimelineSelector(Heriverse.timeline, "#periodSectionPanel div", true);
	else HERUI.buildPeriodFilter("#periodSectionPanel div", true);

	const graphsCollection = Object.entries(Heriverse.currEM.mdgraph.json.graphs).map(
		([graphKey, graphElem]) => ({ id: graphKey, name: graphElem.name })
	);
	HERUI.buildGraphSelector("#graphSelector", graphsCollection);

	Heriverse.currPeriodIndex = Heriverse.currPeriodIndex | 0;
	if (Heriverse.currentGraphs.length > 1) Heriverse.goToPeriodById(null);
	else Heriverse.goToPeriodById(Heriverse.currEM.timeline[Heriverse.currPeriodIndex].id);

	if (Heriverse.firstSetup) ATON.fireEvent("EMLoaded", "");

	let povsKeys = Object.keys(Heriverse.Scene.viewpoints);
	let povs = Heriverse.Scene.viewpoints;
	if (povsKeys.length > 0) {
		HERUI.createPOV(povs);
		Heriverse.ActualPOV = povs[povsKeys[0]];
		Heriverse.POVid = 0;
		for (let index = 0; index < povsKeys.length; index++) {
			const pov = povs[povsKeys[index]];
			const povButton = UI.createPovSceneBtn(
				"POV_" + povsKeys[index],
				pov.position[0],
				pov.position[1],
				pov.position[2],
				"red"
			);
			Heriverse.povBtns.push(povButton);
			povButton.attachToRoot();
		}
	}
};

Heriverse.createEpochNodes = () => {
	let epochs = Heriverse.currEM.timeline;
	Heriverse.timeline = [];
	Heriverse.temporalFilters = [];
	for (let i in epochs) {
		if (!Heriverse.currentGraphs.includes(epochs[i].graph)) continue;
		Heriverse.timeline.push(epochs[i]);
		ATON.createSceneNode(epochs[i].id).attachToRoot();
		let pGroup = ATON.createSemanticNode(epochs[i].id);
		pGroup.attachToRoot();
	}

	if (
		Heriverse.currEM.mdgraph.json.context &&
		Heriverse.currEM.mdgraph.json.context.absolute_time_Epochs
	) {
		const timelineFilters = Heriverse.currEM.mdgraph.json.context.absolute_time_Epochs;
		Object.entries(timelineFilters).forEach(([filterId, filterObj]) => {
			Heriverse.temporalFilters.push(
				new Period(filterId, filterObj.name, filterObj.start, filterObj.end, "")
			);
		});
	}

	Heriverse.timeline.sort((a, b) => a.min - b.min);

	const firstYear = Heriverse.currEM.EMnodes[Heriverse.timeline[0].id].data.start_time;
	Heriverse.timeline.forEach((epoch) => {
		const currEpoch = Heriverse.currEM.EMnodes[epoch.id];
		if (
			!Heriverse.temporalFilters.find(
				(elem) => elem.min === firstYear && elem.max === currEpoch.data.end_time
			)
		) {
			Heriverse.temporalFilters.push(
				new Period(
					"custom_" + firstYear + "_to_" + currEpoch.data.end_time,
					firstYear + " to " + currEpoch.data.end_time,
					firstYear,
					currEpoch.data.end_time,
					""
				)
			);
		}
		if (
			!Heriverse.temporalFilters.find(
				(elem) => elem.min === currEpoch.data.start_time && elem.max === currEpoch.data.end_time
			)
		) {
			Heriverse.temporalFilters.push(
				new Period(
					"custom_" + currEpoch.name,
					currEpoch.name,
					currEpoch.data.start_time,
					currEpoch.data.end_time,
					""
				)
			);
		}
	});
};

Heriverse.createRepresentationModelNodes = () => {
	let rnodes = Heriverse.currEM.representationNodes;
	for (let id in rnodes) {
		let rn = rnodes[id];
		if (!Heriverse.currentGraphs.includes(rn.graph)) continue;
		let generics = rn.getNeighborsByRelation("has_representation_model", "from");
		for (let gen in generics) {
			for (let i = 0; i < Heriverse.currEM.timeline.length; i++) {
				let e = Heriverse.currEM.getNode(gen);
				if (Heriverse.currEM.timeline[i].id == e.id) {
					let name = rn.name;
					let url = Heriverse.getLinkFromRepresentationModel(rn);
					let res_url = Heriverse.getLinkToResource(url);
					let sn = ATON.createSceneNode(name).load(res_url).attachTo(e.id);
					if (rn.data.transform) {
						let rot = rn.data.transform.rotation;
						let pos = rn.data.transform.position;
						if (rot) {
							sn.setRotation(rot[0], rot[1], rot[2]);
						}
						if (pos) {
							sn.setPosition(pos[0], pos[1], pos[2]);
						}
					}
				}
			}
		}
	}
};
Heriverse.getLinkFromRepresentationModel = (node) => {
	let links = node.getNeighborsByRelation(HeriverseNode.RELATIONS.HAS_LINKED_RESOURCE, "to");
	for (let link_id in links) {
		let link = links[link_id];
		if (link.data && link.data.url_type === "3d_model") {
			return link.data.url;
		}
	}
	return "";
};

Heriverse.createSemanticShapeNodes = () => {
	let stratigraphicNodes = Heriverse.currEM.stratigraphicNodes;
	for (let id in stratigraphicNodes) {
		let rn = stratigraphicNodes[id];
		if (!Heriverse.currentGraphs.includes(rn.graph)) continue;
		let first_epochs = rn.getNeighborsByType("epoch");
		let semantic_shapes = rn.getNeighborsByType("semantic_shape");
		for (let epoch in first_epochs) {
			for (let i = 0; i < Heriverse.currEM.timeline.length; i++) {
				let e = Heriverse.currEM.getNode(epoch);
				if (Heriverse.currEM.timeline[i].id == e.id) {
					for (let sem_id in semantic_shapes) {
						let shape = semantic_shapes[sem_id];
						if (!Heriverse.currEM.proxyNodes[rn.name]) {
							let name = rn.name;
							let url = shape.data.url;
							let semNode = ATON.createSemanticNode(name).load(Heriverse.getLinkToResource(url));
							semNode.setDefaultAndHighlightMaterials(
								Heriverse.matProxyOFF[0],
								Heriverse.matProxyON[0]
							);
							semNode.setMaterial(Heriverse.matProxyOFF[0]);
							semNode.attachToRoot();
							Heriverse.currEM.proxyNodes[name] = new Proxy(shape, rn);
						}
						Heriverse.currEM.proxyNodes[rn.name].addEpoch(epoch);
					}
				}
			}
		}
	}
};

Heriverse.loadEM = (url, bReload, refresh = false, data = null) => {
	ATON._rootSem.removeChildren();
	if (!refresh) {
		Heriverse.currMG = new Heriverse.HeriverseGraph(url + "/projedct.json", data);
	}
	Heriverse.currMG.readJson(Heriverse.setScene);
	if (!refresh) {
		Heriverse.addTopToolbarBtns(Heriverse.MODE);
		HERUI.createTitle(Heriverse.Scene.title);
	}

	if (
		Heriverse.currGraphId === undefined &&
		data &&
		data.resource_json &&
		data.resource_json.multigraph &&
		data.resource_json.multigraph.graphs
	) {
		Heriverse.currGraphId = Object.keys(data.resource_json.multigraph.graphs)[0];
		Heriverse.currGraphName = data.resource_json.multigraph.graphs[Heriverse.currGraphId].name;
	}
	HERUI.hamburger("hamb");
	var homeButton = document.getElementById("hamb");
	homeButton.addEventListener("click", function () {
		$(".menu").animate({ left: "0px" }, 1000);
	});

	if (bReload) {
		Heriverse.currEM.buildContinuity();
		Heriverse.currEM.buildRec();
		Heriverse.goToPeriod(Heriverse.currPeriodIndex);
	}

	if (Heriverse.MODE === Heriverse.MODETYPES.EDITOR) ATON.fireEvent("EM loaded");
	else if (Heriverse.MODE === Heriverse.MODETYPES.SCENE) {
		Heriverse.HERUI.buildRelationsManagement("#relationsCheckboxSection");
	}

	Heriverse.firstSetup = false;
};

Heriverse.addPovsBtns = () => {
	for (let i = 0; i < Heriverse.povBtns.length; i++) {
		Heriverse.povBtns[i].attachToRoot();
	}
};

Heriverse.removePovsBtns = () => {
	for (let i = 0; i < Heriverse.povBtns.length; i++) {
		const element = Heriverse.povBtns[i];
		for (let j = 0; j < ATON.getRootScene().children.length; j++) {
			if (ATON.getRootScene().children[j].name == element.name) {
				ATON.getRootScene().remove(ATON.getRootScene().children[j]);
			}
		}
	}
};
Heriverse.goToLoginPage = () => {
	window.location.assign(Utils.baseUrl + "/login");
};

Heriverse.goToScenesPage = () => {
	window.location.assign(Utils.baseUrl + "/scenes");
};

Heriverse.addTopToolbarBtns = () => {
	const classListComplement = " fs-3 p-1";
	HERUI.createButtonToolbar(
		"home",
		"fa-solid fa-house" + classListComplement,
		"toolbar-left",
		"Torna alla home",
		() => {
			Heriverse.goToScenesPage();
		}
	);
	HERUI.createButtonToolbar(
		"home",
		"fa-solid fa-house",
		"mobile-toolbar",
		"Torna alla home",
		() => {
			Heriverse.goToScenesPage();
		},
		true
	);

	HERUI.createButtonToolbar(
		"periodSection",
		"fa-solid fa-clock",
		"mobile-toolbar",
		"Apri pannello filtro temporale",
		() => {
			$("#periodSectionPanel").toggleClass("hidden contents");
			UI.clickToolbarBtn("periodSection");
		},
		true,
		true,
		"#periodSectionPanel"
	);

	if (ATON.Utils.isVRsupported()) {
		HERUI.createButtonToolbar(
			"vr-icon",
			"fa-solid fa-vr-cardboard" + classListComplement,
			"toolbar-left",
			"Attiva modalità VR",
			() => {
				ATON.XR.toggle("immersive-vr");
			},
			false
		);
		HERUI.createButtonToolbar(
			"vr-icon",
			"fa-solid fa-vr-cardboard",
			"mobile-toolbar",
			"Attiva modalità VR",
			() => {
				ATON.XR.toggle("immersive-vr");
			},
			true
		);
	}
	if (Heriverse.MODE == Heriverse.MODETYPES.EDITOR) {
		HERUI.createButtonToolbar(
			"workspace-icon-mobile",
			"fa-solid fa-hexagon-nodes",
			"mobile-toolbar",
			"Mostra pannello workspace",
			() => {
				$("#workspace-panel").toggleClass("d-none d-block");
				UI.clickToolbarBtn("workspace-icon");
			},
			true
		);
		HERUI.createButtonToolbar(
			"workspace-icon",
			"fa-solid fa-hexagon-nodes" + classListComplement,
			"toolbar-left",
			"Mostra pannello workspace",
			() => {
				$("#workspace-panel").toggleClass("d-none d-block");
				UI.clickToolbarBtn("workspace-icon");
			},
			false
		);

		HERUI.createButtonToolbar(
			"shelf-icon-mobile",
			"fa-solid fa-toolbox",
			"mobile-toolbar",
			"Mostra pannello shelf",
			() => {
				$("#shelf-panel").toggleClass("d-none d-block");
				UI.clickToolbarBtn("shelf-icon");
			},
			true
		);
		HERUI.createButtonToolbar(
			"shelf-icon",
			"fa-solid fa-toolbox" + classListComplement,
			"toolbar-left",
			"Mostra pannello shelf",
			() => {
				$("#shelf-panel").toggleClass("d-none d-block");
				UI.clickToolbarBtn("shelf-icon");
			},
			false
		);

		HERUI.createButtonToolbar(
			"tools-icon-mobile",
			"fa-solid fa-screwdriver-wrench",
			"mobile-toolbar",
			"Mostra pannello tool",
			() => {
				$("#right-panel").toggleClass("d-none d-block");
				UI.clickToolbarBtn("tools-icon");
			},
			true
		);
		HERUI.createButtonToolbar(
			"tools-icon",
			"fa-solid fa-screwdriver-wrench" + classListComplement,
			"toolbar-left",
			"Mostra pannello tool",
			() => {
				$("#right-panel").toggleClass("d-none d-block");
				UI.clickToolbarBtn("tools-icon");
			},
			false
		);

		HERUI.createButtonToolbar(
			"viewer-mode",
			"fa-solid fa-eye",
			"mobile-toolbar",
			"Passa al visualizzatore",
			() => {
				window.location.href = Utils.baseUrl + "/?scene=" + Heriverse.paramSID;
			},
			true
		);
		HERUI.createButtonToolbar(
			"viewer-mode",
			"fa-solid fa-eye" + classListComplement,
			"toolbar-right",
			"Passa al visualizzatore",
			() => {
				window.location.href = Utils.baseUrl + "/?scene=" + Heriverse.paramSID;
			},
			false
		);
	} else {
		HERUI.createButtonToolbar(
			"editor-mode",
			"fa-solid fa-pen-to-square",
			"mobile-toolbar",
			"Passa all'editor",
			() => {
				if (AUTH.canEditScene(Heriverse.paramSID))
					window.location.href = Utils.baseUrl + "/editor/?scene=" + Heriverse.paramSID;
				else window.location.href = Utils.baseUrl + "/login";
			},
			true
		);
		HERUI.createButtonToolbar(
			"viewer-mode",
			"fa-solid fa-pen-to-square" + classListComplement,
			"toolbar-right",
			"Passa all'editor",
			() => {
				if (AUTH.canEditScene(Heriverse.paramSID))
					window.location.href = Utils.baseUrl + "/editor/?scene=" + Heriverse.paramSID;
				else window.location.href = Utils.baseUrl + "/login";
			},
			false
		);
	}
};

Heriverse.setupUI = () => {
	Heriverse.setupSearchUI();
};

Heriverse.uiSetPeriodIndex = (i) => {
	var elemento = document.getElementById("tp" + i);
	for (let t = 0; t < Heriverse.currEM.timeline.length; t++) {
		var elemento1 = document.getElementById("tp" + t);
		elemento1.style.boxShadow = "0px 0px 0px 0px";
	}
	$("#tp" + i)
		.siblings()
		.removeClass("emviqPeriodSelected active");
	let tp = Heriverse.currEM.timeline[i];
	elemento.style.boxShadow =
		" 0px 0px 3px 3px rgba(" +
		tp.color.r * 255 +
		", " +
		tp.color.g * 255 +
		", " +
		tp.color.b * 255 +
		", 0.4)";
	$("#tp" + i).addClass("emviqPeriodSelected active");
};

Heriverse.buildTimelineUI = () => {
	let htmlcontent = "";
	Heriverse.suiPeriodsBTNs = [];
	for (let i = 0; i < Heriverse.currEM.timeline.length; i++) {
		let tp = Heriverse.currEM.timeline[i];
		let st = undefined;
		if (tp.color)
			st =
				"background-color:rgba(" +
				tp.color.r * 255 +
				", " +
				tp.color.g * 255 +
				", " +
				tp.color.b * 255 +
				", 0.4)";
		if (st)
			htmlcontent +=
				"<div class='emviqPeriodSelector' style='" +
				st +
				"' id='tp" +
				i +
				"'>" +
				tp.name +
				"</div>";
		else htmlcontent += "<div class='emviqPeriodSelector' id='tp" + i + "'>" + tp.name + "</div>";

		let suiBTN = new ATON.SUI.Button("sui_" + tp.name, 3.0, 1.5);
		suiBTN.onSelect = () => {
			//Heriverse.filterByPeriodIndex(i);
			//Heriverse.uiSetPeriodIndex(i);
			Heriverse.goToPeriod(i);
		};

		suiBTN.setPosition(0, i * 0.35, 0);
		suiBTN.setScale(3.0);
		suiBTN.setText(tp.name);

		if (tp.color) suiBTN.setBaseColor(tp.color);
		suiBTN.setBackgroundOpacity(0.3);

		Heriverse.suiPeriodsBTNs.push(suiBTN);
	}

	let numPeriods = Heriverse.suiPeriodsBTNs.length;

	if (numPeriods > 0) {
		const pi2 = Math.PI * 0.5;
		Heriverse.suiTimeline.removeChildren();
		Heriverse.suiTimeline.setPosition(-0.1, 0, 0.1).setRotation(-pi2, -pi2, pi2).setScale(0.1);
		for (let i = 0; i < numPeriods; i++)
			Heriverse.suiPeriodsBTNs[i].attachTo(Heriverse.suiTimeline);

		Heriverse.suiTimeline.attachToRoot();
		Heriverse.suiTimeline.hide();
	}
	$("#idTL").html(htmlcontent);
	for (let i = 0; i < Heriverse.currEM.timeline.length; i++) {
		let tp = Heriverse.currEM.timeline[i];
		$("#tp" + i).click(() => {
			Heriverse.goToPeriod(i);
		});
	}
};

Heriverse.setupSearchUI = function () {
	let elSearch = document.getElementById("idSearch");

	$("#idSearch").on("keyup", () => {
		let string = $("#idSearch").val();
		Heriverse.search(string);
	});

	$("#idSearch").focus(() => {
		ATON._bListenKeyboardEvents = false;
		ATON._bPauseQuery = true;
		ATON.SUI.infoNode.visible = false;
	});

	$("#idSearch").blur(() => {
		ATON._bListenKeyboardEvents = true;
		if (ATON.FE._bPopup) ATON._bPauseQuery = false;
	});

	$("#idSearchMatches").hide();
};

Heriverse.setupSUI = () => {
	let suiButtons = [];
	suiButtons.push(new ATON.SUI.Button("SUI_Home"));
	ATON.getUINode("SUI_Home").setIcon("res/imgs/pov2.png").setBackgroundOpacity(1).onSelect = () => {
		ATON.Nav.requestHome();
	};

	for (let b in suiButtons) {
		suiButtons[b].onHover = () => {
			suiButtons[b].setBackgroundOpacity(0.9);
			let x = ATON._screenPointerCoords.x * 0.5 * window.innerWidth; //FE._canvas.width;
			let y = (1.0 - ATON._screenPointerCoords.y) * 0.5 * window.innerHeight; //FE._canvas.height;
			$("#idPovLabel").html("POV: " + suiButtons[b].name);
			$("#idPovLabel").css("transform", "translate(" + x + "px, " + y + "px)");
			$("#idView3D").css("cursor", "crosshair");
			$("#idPovLabel").show();
		};

		suiButtons[b].onLeave = () => {
			suiButtons[b].setBackgroundOpacity(0.5);
			$("#idView3D").css("cursor", "grab");
			$("#idPovLabel").hide();
		};
	}
	ATON.getUINode("SUI_Home").setPosition(114.02114483604332, 700.5898967525909, -432.0970830665211);
	let suiToolbar = ATON.SUI.createToolbar(suiButtons, ATON.MatHub.colors.black, 0);
	suiToolbar
		.setPosition(114.02114483604332, 700.5898967525909, -432.0970830665211)
		.setRotation(-1.2, 0, -0.1)
		.setScale(5.0)
		.attachToRoot();
};

Heriverse.matchPovRegex = (pov_name) => {
	const regex = /^POV_(.*)/;
	if (pov_name.match(regex)) {
		return pov_name.match(regex)[1];
	}
	return "";
};

Heriverse.rm_in_scene = {};

Heriverse.setupEventHandlers = () => {
	ATON.FE.addBasicLoaderEvents();

	window.addEventListener("pointermove", (e) => {
		let mousePosition = new THREE.Vector2();
		mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
		mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
		ATON._rcScene.setFromCamera(mousePosition, ATON.Nav._camera);
		const intersects = ATON._rcScene.intersectObjects(ATON.getRootScene().children, true);

		let povIndex;
		if (intersects.length > 0) {
			const povKey = Heriverse.matchPovRegex(intersects[0].object.parent.name);
			let povsKeys = Object.keys(Heriverse.Scene.viewpoints);
			const clickedPOV = Heriverse.Scene.viewpoints[povKey];
			for (let index = 0; index < povsKeys.length; index++) {
				if (povsKeys[index] == povKey) {
					povIndex = index;
				}
			}
			if (povIndex != null) {
				let x = ATON._screenPointerCoords.x * 0.5 * window.innerWidth; //FE._canvas.width;
				let y = (1.0 - ATON._screenPointerCoords.y) * 0.5 * window.innerHeight; //FE._canvas.height;
				y -= 55;
				$("#idPovLabel").html("POV: " + povsKeys[povIndex]);
				$("#idPovLabel").css("transform", "translate(" + x + "px, " + y + "px)");
				$("#idView3D").css("cursor", "crosshair");
				$("#idPovLabel").show();
			} else {
				$("#idPovLabel").hide();
			}
		} else {
			$("#idPovLabel").hide();
			$("#idView3D").css("cursor", "grab");
		}
	});

	ATON.on("DoubleTap", (e) => {
		let mousePosition = new THREE.Vector2();
		mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
		mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
		ATON._rcScene.setFromCamera(mousePosition, ATON.Nav._camera);
		const intersects = ATON._rcScene.intersectObjects(ATON.getRootScene().children, true);
		if (intersects.length > 0) {
			const povKey = Heriverse.matchPovRegex(intersects[0].object.parent.name);
			let povsKeys = Object.keys(Heriverse.Scene.viewpoints);
			const clickedPOV = Heriverse.Scene.viewpoints[povKey];
			let povIndex;
			for (let index = 0; index < povsKeys.length; index++) {
				if (povsKeys[index] == povKey) {
					povIndex = index;
				}
			}
			Heriverse.POVid = povIndex;
			const newpovKey = "POV_" + povKey;

			UI.moveToPOV(povKey, clickedPOV);
		}
	});

	ATON.on("Tap", (e) => {
		let node = null;

		if (ATON._hoveredSemNode) {
			let proxy = Heriverse.currEM.proxyNodes[ATON._hoveredSemNode];
			if (Heriverse.ActualProxy && ATON.getSemanticNode(Heriverse.ActualProxy)) {
				ATON.getSemanticNode(Heriverse.ActualProxy).restoreDefaultMaterial();
			}
			if (proxy) {
				Heriverse.ActualProxy = ATON._hoveredSemNode;
				ATON.getSemanticNode(proxy.node.name).highlight();
				node = proxy.node;
			}
		}
		HERUI.createSidebar(node);
	});

	ATON.on("KeyPress", (k) => {
		if (k === "m") Heriverse.measure();
		if (k === "x") ATON._bPauseQuery = !ATON._bPauseQuery;
	});

	ATON.on("AllNodeRequestsCompleted", () => {
		ATON.setNeutralAmbientLight();
	});

	ATON.on("SemanticNodeHover", (semid) => {
		Heriverse.updateQueriedProxyInfo(semid);
		if (Heriverse._bShowAllProxies) return;
		let S = ATON.getSemanticNode(semid);
		if (S) S.highlight();
	});

	ATON.on("SemanticNodeLeave", (semid) => {
		$("#idProxyID").html("");
		if (Heriverse._bShowAllProxies) return;
		let S = ATON.getSemanticNode(semid);
		if (Heriverse.ActualProxy === semid) {
			S.highlight();
		}
		if (String(Heriverse.ActualProxy) !== String(semid)) {
			S.restoreDefaultMaterial();
		}
	});

	ATON.on("AllNodeRequestsCompleted", () => {
		Heriverse.highlightFirstValidPeriod();
		Heriverse.currEM.buildContinuity();
		Heriverse.currEM.buildRec();
		ATON.SUI.setSelectorRadius(0.1);
	});

	ATON.on("CloseSidebar", () => {
		let S = ATON.getSemanticNode(Heriverse.ActualProxy);

		if (S) {
			Heriverse.ActualProxy = null;
			S.restoreDefaultMaterial();
		}
	});

	ATON.on(HeriverseEvents.Events.SHOW_SEMANTIC_NODE, (semid) => {
		let node = Heriverse.currEM.getNode(semid);
		Heriverse.ActualProxy = node.name;
		Heriverse.highlightProxies([node.name]);
		HERUI.populateSideBar(node);
		HeriverseGraphDrawer.clearAll();
		HeriverseGraphDrawer.drawGraph(Heriverse.currEM.proxyNodes[node.name]);
	});

	ATON.on(HeriverseEvents.Events.SHOW_DOCUMENT_LINK, (docId) => {
		let docNode = Heriverse.currEM.getNode(docId);
		let docsRM =
			Object.values(docNode.neighbors.link).length &&
			Object.values(docNode.neighbors.representation_model_doc).length
				? Object.values(docNode.neighbors.link).concat(
						Object.values(docNode.neighbors.representation_model_doc)
				  )
				: Object.values(docNode.neighbors.link).length
				? Object.values(docNode.neighbors.link)
				: Object.values(docNode.neighbors.representation_model_doc).length
				? Object.values(docNode.neighbors.representation_model_doc)
				: [];

		if (!docsRM.length) return;

		docsRM.forEach((docRM) => {
			let docRMNode = ATON.createSceneNode().load(docRM.data.url, (gltf) => {
				let model = gltf.scene;
				if (docRM.transform) {
					if (docRM.transform.position) {
						let positionJson = docRM.transform.position;
						model.position.set(positionJson[0], positionJson[1], positionJson[2]);
					}
					if (docRM.transform.rotation) {
						let rotationJson = docRM.transform.rotation;
						model.rotation.set(rotationJson[0], rotationJson[1], rotationJson[2]);
					}
					if (docRM.transform.scale) {
						let scaleJson = docRM.transform.scale;
						model.scale.set(scaleJson[0], scaleJson[1], scaleJson[2]);
					}
				}
			});

			docRMNode.attachToRoot();
			Heriverse.rm_in_scene(docRMNode);
		});
	});

	ATON.on(HeriverseEvents.Events.CHANGE_LIGHT_INTENSITY, (intensity) => {
		ATON.ambLight.intensity = intensity;
	});

	ATON.on(HeriverseEvents.Events.OBJECT_POSITION_CHANGE, (objectData) => {
		if (!objectData.objectName && !objectData.objectType)
			throw new Error("Nome e/o tipo di nodo mancanti/e");
		let objectInstance;
		switch (objectData.objectType) {
			case ATON.NTYPES.SCENE:
				objectInstance = ATON._mainRoot.getObjectByName(objectData.objectName);
				break;
			case ATON.NTYPES.SEM:
				objectInstance = ATON._rootSem.getObjectByName(objectData.objectName);
				break;
			case ATON.NTYPES.UI:
				objectInstance = ATON._rootUI.getObjectByName(objectData.objectName);
				break;
		}

		if (objectInstance !== undefined) {
			objectInstance.position.set(
				objectData.position.x,
				objectData.position.y,
				objectData.position.z
			);
			objectInstance.rotation.set(
				objectData.rotation.x,
				objectData.rotation.y,
				objectData.rotation.z
			);
			objectInstance.scale.set(objectData.scale.x, objectData.scale.y, objectData.scale.z);
		}
	});

	ATON.on(HeriverseEvents.Events.NEW_OBJECT_IN_SCENE, (objectData) => {
		let newNode;
		switch (objectData.objectType) {
			case ATON.NTYPES.SCENE:
				newNode = ATON.createSceneNode();
				break;
			case ATON.NTYPES.SEM:
				newNode = ATON.createSemanticNode();
				break;
			case ATON.NTYPES.UI:
				newNode = ATON.createUINode();
				break;
		}

		newNode.attachToRoot();

		newNode.name = objectData.objectName;
		newNode.userData = objectData.objectUserData;
		newNode.position.copy(objectData.position);
		newNode.rotation.copy(objectData.rotation);
		newNode.scale.copy(objectData.scale);
	});

	ATON.on(HeriverseEvents.Events.REMOVE_OBJECT_FROM_SCENE, (object) => {
		let objectInScene;
		switch (object.type) {
			case ATON.NTYPES.SCENE:
				objectInScene = ATON._mainRoot.getObjectByName(object.name);
				break;
			case ATON.NTYPES.SEM:
				objectInScene = ATON._rootSem.getObjectByName(object.name);
				break;
			case ATON.NTYPES.UI:
				objectInScene = ATON._rootUI.getObjectByName(object.name);
				break;
		}

		if (objectInScene) {
			let elemIndex = Editor.shelf_objects_in_scene.indexOf(objectInScene);
			Editor.shelf_objects_in_scene.splice(elemIndex, 1);
			objectInScene.parent.removeChild(objectInScene);
		}
	});

	ATON.on("XRmode", (b) => {
		if (b) {
			ATON.FE.popupClose();
		}
	});

	ATON.on("XRcontrollerConnected", (c) => {
		if (c === ATON.XR.HAND_L) {
			ATON.XR.controller1.add(Heriverse.suiTimeline);
			//Heriverse.suiTimeline.show();
		}
		ThreeMeshUI.update();
	});

	ATON.on("PrevPOV", () => {
		let povsKeys = Object.keys(Heriverse.Scene.viewpoints);
		let prevPOVid = (Heriverse.POVid - 1 + povsKeys.length) % povsKeys.length;
		let prevPOV = Heriverse.Scene.viewpoints[povsKeys[prevPOVid]];
		UI.moveToPOV(povsKeys[prevPOVid], prevPOV);
		Heriverse.POVid = prevPOVid;
	});

	ATON.on("NextPOV", () => {
		let povsKeys = Object.keys(Heriverse.Scene.viewpoints);
		let nextPOVid = (Heriverse.POVid + 1 + povsKeys.length) % povsKeys.length;
		let nextPov = Heriverse.Scene.viewpoints[povsKeys[nextPOVid]];
		UI.moveToPOV(povsKeys[nextPOVid], nextPov);
		Heriverse.POVid = nextPOVid;
	});

	ATON.on("EM loaded", () => {
		if (Heriverse.MODE === Heriverse.MODETYPES.EDITOR) {
			Editor.init();
			Heriverse.HERUI.buildRelationsManagement("#relationsCheckboxSection");
		}
	});
};

Heriverse.measure = () => {
	let P = ATON.getSceneQueriedPoint();
	let M = ATON.SUI.addMeasurementPoint(P);
};

Heriverse.highlightFirstValidPeriod = () => {
	for (let i = 0; i < Heriverse.currEM.timeline.length; i++) {
		let period = Heriverse.currEM.timeline[i];

		let gPeriod = ATON.getSceneNode(period.name);
		if (gPeriod) {
			//Heriverse.filterByPeriodIndex(i);
			//Heriverse.uiSetPeriodIndex(i);
			Heriverse.goToPeriod(i);
			return;
		}
	}
	Heriverse.goToPeriodById(Heriverse.currEM.timeline[0].id);
};

Heriverse.showAllProxies = (b) => {
	Heriverse._bShowAllProxies = b;
	for (let d in Heriverse.currEM.proxyNodes) {
		let proxy = Heriverse.currEM.proxyNodes[d];
		let sem_node = ATON.getSemanticNode(proxy.node.name);
		if (b) {
			sem_node.show();
			sem_node.highlight();
		} else sem_node.restoreDefaultMaterial();
	}
};

Heriverse.highlightProxies = function (idlist) {
	let numHL = idlist.length;

	for (let d in Heriverse.currEM.proxyNodes) {
		let proxy = Heriverse.currEM.proxyNodes[d];
		let sem_node = ATON.getSemanticNode(d);
		if (!Heriverse._bShowAllProxies) sem_node.restoreDefaultMaterial();
		//D.hide();

		for (let i = 0; i < numHL; i++) {
			if (d === idlist[i]) {
				sem_node.highlight();
				//D.show();
			}
		}
	}
};

let rmNodeShowed = [];
let rmNodeHidden = [];
Heriverse.filterByPeriod = function (period) {
	let rmcounter = 0;
	rmNodeShowed = [];
	rmNodeHidden = [];
	if (!period.name) {
		Object.values(Heriverse.currEM.representationNodes).forEach((rmNode) => {
			if (
				Heriverse.currentGraphs.includes(rmNode.graph) &&
				rmNode.existsInTime(period.min, period.max)
			) {
				rmNodeShowed.push(rmNode.name);
			} else {
				if (!rmNodeShowed.includes(rmNode.name)) {
					rmNodeHidden.push(rmNode.name);
				}
			}
		});

		ATON.getRootScene().children.forEach((child) => {
			child.show();
		});

		rmNodeShowed.forEach((rmName) => {
			const sceneNode = ATON.getSceneNode(rmName);
			if (sceneNode) sceneNode.show();
		});
		rmNodeHidden.forEach((rmName) => {
			const sceneNode = ATON.getSceneNode(rmName);
			if (sceneNode) {
				sceneNode.hide();
			}
		});
	} else {
		Heriverse.currPeriodName = period.name;
		ATON.setMainPanorama(
			Heriverse.getLinkToResource(Heriverse.currEM.getPanoramaUrlFromPeriod(period.id))
		);
		Heriverse.currEM.timeline.forEach((p) => {
			let rmGroup = ATON.getSceneNode(p.id);
			if (p.id === period.id) {
				if (rmGroup) rmGroup.show();
			} else {
				if (rmGroup) rmGroup.hide();
			}
		});
		if (!Heriverse._bShowAllProxies) {
			for (let p in Heriverse.currEM.proxyNodes) {
				let P = Heriverse.currEM.proxyNodes[p];
				if (P.isVisibleInEpoch(period.id)) {
					ATON.getSemanticNode(P.node.name).show();
				} else ATON.getSemanticNode(P.node.name).hide();
			}
		}
	}
	Heriverse.highlightProxies([]);
};

Heriverse.filterByPeriodName = function (periodname) {
	$("#idPeriodName").html(periodname);
	Heriverse.currPeriodName = periodname;

	Heriverse.currEM.timeline.forEach((p) => {
		let rmGroup = ATON.getSceneNode(p.name);
		if (p.name === periodname) {
			if (rmGroup) rmGroup.show();
		} else {
			if (rmGroup) rmGroup.hide();
		}
	});
	if (!Heriverse._bShowAllProxies) {
		for (let p in Heriverse.currEM.proxyNodes) {
			let P = Heriverse.currEM.proxyNodes[p];
			if (P.isVisibleInEpoch(periodname)) {
				ATON.getSemanticNode(P.node.name).show();
			} else ATON.getSemanticNode(P.node.name).hide();
		}
	}
	Heriverse.highlightProxies([]);
};

Heriverse.filterByPeriodIndex = function (i) {
	let period = Heriverse.currEM.timeline[i];
	if (!period) return;
	Heriverse.currPeriodIndex = i;
	Heriverse.filterByPeriodName(period.name);
};

Heriverse.goToPeriodById = (id_epoch, mobile = false) => {
	let period;
	if (id_epoch === null) {
		const start =
			!mobile && document.querySelector("#idTL #startPeriodFilterForm").value
				? parseInt(document.querySelector("#idTL #startPeriodFilterForm").value)
				: !mobile
				? 0
				: parseInt(document.querySelector("#periodSectionPanel #startPeriodFilterForm").value);
		const end =
			!mobile && document.querySelector("#idTL #endPeriodFilterForm").value
				? parseInt(document.querySelector("#idTL #endPeriodFilterForm").value)
				: !mobile
				? 1000
				: parseInt(document.querySelector("#periodSectionPanel #endPeriodFilterForm").value);
		period = new Period(null, "", start, end);
	} else period = Heriverse.currEM.getEpoch(id_epoch);
	Heriverse.filterByPeriod(period);
	ATON.fireEvent("goToPeriodPerformed", period.id);
};

Heriverse.goToPeriod = (i) => {
	if (Heriverse.suiTimeline) {
		for (let k = 0; k < Heriverse.suiPeriodsBTNs.length; k++) {
			let B = Heriverse.suiPeriodsBTNs[k];
			if (k === i) B.setBackgroundOpacity(0.9);
			else B.setBackgroundOpacity(0.3);
		}
	}
};

Heriverse.blurProxiesCurrPeriod = function () {
	for (let p in Heriverse.currEM.proxyNodes) {
		let proxy = Heriverse.currEM.proxyNodes[p];
		let EMdata = proxy.userData.EM;
		if (EMdata.periods[Heriverse.currPeriodName] !== undefined) proxy.restoreDefaultMaterial();
	}
};

Heriverse.getGraphAccordion = (emn) => {
	return;
};

Heriverse.openDetailSidebarChild = function (e) {
	ATON.fireEvent("ShowSemanticNode", e);
	HERUI.populateSideBar(Heriverse.currEM.getNode(e));
};

Heriverse.updateQueriedProxyInfo = function (did) {
	return;
};

Heriverse.search = function (string) {
	if (string.length < 2) {
		Heriverse.blurProxiesCurrPeriod();
		$("#idSearchMatches").hide();
		return;
	}

	string = string.toLowerCase();
	Heriverse.sematches = [];
	let aabbProxies = new THREE.Box3();

	for (let did in Heriverse.currEM.proxyNodes) {
		let bAdd = false;
		let didstr = did.toLowerCase();
		let D = ATON.getSemanticNode(did);
		let proxy = Heriverse.currEM.proxyNodes[did];
		let EMdata = proxy.userData.EM;

		if (EMdata.periods[Heriverse.currPeriodName] !== undefined) {
			if (didstr.startsWith(string)) bAdd = true;

			if (proxy && EMdata.description) {
				let descrKeys = EMdata.description.split(" ");
				for (let k = 0; k < descrKeys.length; k++) {
					let descrK = descrKeys[k].toLowerCase();
					if (descrK.startsWith(string)) bAdd = true;
				}
			}
		}

		if (bAdd) {
			Heriverse.sematches.push(did);
			aabbProxies.expandByObject(D);
			//TODO: switch on multiple periods? proxy.periodName
		}
	}

	let len = Heriverse.sematches.length;
	if (len > 0) {
		$("#idProxyID").html("");
		Heriverse.highlightProxies(Heriverse.sematches);
		let bsProxies = new THREE.Sphere();
		aabbProxies.getBoundingSphere(bsProxies);
		ATON.Nav.requestPOVbyBound(bsProxies, 0.5);

		$("#idSearchMatches").html(len);
		$("#idSearchMatches").show();
	} else {
		Heriverse.blurProxiesCurrPeriod();
		$("#idSearchMatches").hide();
		//Heriverse.switchInfoNode(false);
	}
};

Heriverse.searchClear = function () {
	$("#idSearch").val("");
	$("#idSearchMatches").hide();
	ATON._bPauseQuery = false;
	Heriverse.blurProxiesCurrPeriod();
};

Heriverse.popupSettings = () => {
	let htmlcontent = "<div class='atonPopupTitle'>Settings</div>";
	let blblock =
		"<div style='max-width:300px; display:inline-block; margin:5px; vertical-align:top;'>";

	htmlcontent += "<div id='idNavModes'></div><br>";

	htmlcontent += "<div class='atonBlockGroup' style='text-align:left;'><h3>Proxies</h3>";
	htmlcontent += blblock + "<input id='idConfigOcclusion' type='checkbox'><b>Occlusion</b>";
	htmlcontent += "<br>Uses visible 3D representations to occlude queries on proxies</div>";

	htmlcontent +=
		blblock + "<input id='idConfigProxiesAlwaysVis' type='checkbox'><b>Always visible</b>";
	htmlcontent += "<br>Proxies are always visible on top of visible 3D representation models</div>";

	htmlcontent += blblock + "<input id='idConfigShowAllProxies' type='checkbox'><b>Show All</b>";
	htmlcontent += "<br>Show all proxies</div><br>";

	htmlcontent += "</div>";

	if (!ATON.FE.popupShow(htmlcontent)) return;

	ATON.FE.uiAddButtonFirstPerson("idNavModes");
	ATON.FE.uiAddButtonDeviceOrientation("idNavModes");
	ATON.FE.uiAddButtonVR("idNavModes");

	$("#idConfigOcclusion").prop("checked", ATON._bQuerySemOcclusion);
	$("#idConfigShowAllProxies").prop("checked", Heriverse._bShowAllProxies);
	$("#idConfigProxiesAlwaysVis").prop("checked", Heriverse._bProxiesAlwaysVis);

	$("#idConfigOcclusion").on("change", () => {
		ATON._bQuerySemOcclusion = $("#idConfigOcclusion").is(":checked");
	});
	$("#idConfigShowAllProxies").on("change", () => {
		let b = $("#idConfigShowAllProxies").is(":checked");
		Heriverse.showAllProxies(b);
	});
	$("#idConfigProxiesAlwaysVis").on("change", () => {
		let b = $("#idConfigProxiesAlwaysVis").is(":checked");
		Heriverse.setProxiesAlwaysVisible(b);
	});

	$("#idProxiesOpacity").on("change", () => {
		let f = parseFloat($("#idProxiesOpacity").val());
		Heriverse.setProxiesOpacity(f);
	});
};

Heriverse.popupMatches = () => {
	let num = Heriverse.sematches.length;
	if (num <= 0) return;
	let htmlcontent = "<div style='height: 50% !important;'>";
	htmlcontent += "<div class='atonPopupTitle'>" + num + " Matches</div>";
	htmlcontent += "<table>";

	htmlcontent +=
		"<thead><tr><th>Proxy ID</th><th>Time</th><th>Description</th><th>URL</th></tr></thead>";
	htmlcontent += "<tbody>";
	for (let d = 0; d < num; d++) {
		let did = Heriverse.sematches[d];
		let proxy = Heriverse.currEM.proxyNodes[did];
		let EMdata = proxy.userData.EM;

		if (proxy) {
			htmlcontent += "<tr>";
			htmlcontent += "<td>" + did + "</td>";
			htmlcontent += "<td>" + EMdata.time.toFixed(2) + "</td>";
			htmlcontent += "<td>" + EMdata.description + "</td>";
			if (EMdata.url) htmlcontent += "<td>" + EMdata.url + "</td>";
			else htmlcontent += "<td>/</td>";
			htmlcontent += "</tr>";
		}
	}
	htmlcontent += "</tbody>";
	htmlcontent += "</table>";
	htmlcontent += "</div>";

	if (!ATON.FE.popupShow(htmlcontent)) return;
};

Heriverse.editScene = (sceneID) => {};

Heriverse.getLinkToResource = (link) => {
	const externalPattern = /^(https?:\/\/|\/\/)/i;
	if (externalPattern.test(link)) {
		return link;
	} else {
		return Heriverse.ResourceScene.resource_path + "/" + link;
	}
};

Heriverse.setupPropertiesRules = (pr_file) => {
	try {
		fetch(pr_file)
			.then((response) => response.json())
			.then((data) => {
				Heriverse.properties_rules["qualia_categories"] = data.qualia_categories;
			});
	} catch (error) {
		console.error("Failed fetching JSON: ", error);
	}
};
Heriverse.setupConnectionRules = (cr_file) => {
	HeriverseNode.RELATIONS = {};
	HeriverseNode.RELATION_LABELS = {};
	try {
		fetch(cr_file)
			.then((response) => response.json())
			.then((data) => {
				const cr_from_data = data.edge_types;
				for (let rule_name in cr_from_data) {
					const rule = cr_from_data[rule_name];
					HeriverseNode.RELATIONS[rule_name.toUpperCase()] = rule_name;
					HeriverseNode.RELATION_LABELS[rule_name] = rule.label;
					const allowed_connections = rule.allowed_connections;
					const sources = allowed_connections.source;
					const targets = allowed_connections.target;

					for (let source in sources) {
						if (!Heriverse.connection_rules[sources[source]])
							Heriverse.connection_rules[sources[source]] = {};
						for (let target in targets) {
							if (!Heriverse.connection_rules[sources[source]][targets[target]])
								Heriverse.connection_rules[sources[source]][targets[target]] = [];
							Heriverse.connection_rules[sources[source]][targets[target]].push({
								type: rule_name,
								label: rule.label,
							});
						}
					}
				}
			})
			.then(() => {});
	} catch (error) {
		console.error("Failed fetching JSON: ", error);
	}
};

Heriverse.findShortestValidPath = (sourceNodeType, targetNodeType) => {
	if (!Heriverse.connection_rules[sourceNodeType]) {
		return null;
	}

	const queue = [
		{
			node: sourceNodeType,
			path: [],
			connections: [],
		},
	];

	const visited = new Set([sourceNodeType]);
	while (queue.length > 0) {
		const current = queue.shift();
		const currentNode = current.node;

		if (currentNode === targetNodeType) {
			return {
				path: [sourceNodeType, ...current.path],
				connections: current.connections,
			};
		}

		if (Heriverse.connection_rules[currentNode]) {
			Object.entries(Heriverse.connection_rules[currentNode]).forEach(([nextNode, connections]) => {
				if (!visited.has(nextNode)) {
					visited.add(nextNode);

					connections.forEach((connection) => {
						queue.push({
							node: nextNode,
							path: [...current.path, nextNode],
							connections: [
								...current.connections,
								{
									from: currentNode,
									to: nextNode,
									type: connection.type,
									label: connection.label,
								},
							],
						});
					});
				}
			});
		}
	}

	return null;
};
