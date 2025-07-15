/*
    ATON 3D Graph playground

================================================================*/

import NodeProcessor from "./NodeProcessor.js";
import HeriverseGraph from "../src/HeriverseGraph/HeriverseGraph.js";

let DrawGraph = ATON.App.realize();
window.DrawGraph = DrawGraph;

DrawGraph.pathAssets = DrawGraph.basePath + "../assets/";
DrawGraph.pathSamples = DrawGraph.pathAssets + "../samples/";

ATON.setPathCollection(DrawGraph.pathAssets);

DrawGraph.mGraph = undefined;
DrawGraph._gdata = undefined;
DrawGraph._mAPPingInfo = undefined;
DrawGraph.nodes = {};
DrawGraph.landingNodes = [];
DrawGraph.edges = [];
DrawGraph.labels = [];
DrawGraph.node4deletion = [];
DrawGraph.stagedNodes = {};
DrawGraph.pov;
DrawGraph.stagedBrothers = [];
DrawGraph.stagedChilds = [];
DrawGraph.stagedSemantic = [];
DrawGraph.active_relations = {};

DrawGraph.rawJson = undefined;

let hierarchicalData = true;

DrawGraph.setup = () => {
	ATON.FE.realize();
	ATON.FE.addBasicLoaderEvents();

	DrawGraph.setupEvents();

	DrawGraph.paramSID = ATON.FE.urlParams.get("scene");
	DrawGraph.jsonUrl = Utils.host + "uploads/" + DrawGraph.paramSID + "/project.json";

	try {
		DrawGraph.loadMAPPingData(DrawGraph.pathAssets + "mAPPing_em.json");
		DrawGraph.mGraph = new HeriverseGraph(DrawGraph.jsonUrl);
		DrawGraph.mGraph.readJson(() => {
			DrawGraph.drawData(DrawGraph.mGraph);
		});
	} catch (error) {
		console.log("Error loading graph Json ");
		console.log(error);
	}

	DrawGraph.drawData = (data, mAPPing) => {
		let primo = null;
		let nodeProcessor = new NodeProcessor(DrawGraph._mAPPingInfo);
		if (hierarchicalData) {
			primo = nodeProcessor.extractLandingNodes(DrawGraph.mGraph.getStratigraphicNodes());
		} else {
			nodeProcessor.draw(data);
		}

		Object.values(DrawGraph.mGraph._jsonGraph.graph.edges).forEach((edge) => {
			if (
				DrawGraph.active_relations[edge.type] === undefined &&
				(edge.type === "is_before" || edge.type === "has_data_provenance")
			) {
				DrawGraph.active_relations[edge.type] = true;
			}
		});

		DrawGraph.landingNodes.forEach((nodeId) => {
			$("#nodi").append(`<option value='${nodeId.id}'>${nodeId.node["name"]}</option>`);
			$("#nodiRedraw").append(`<option value='${nodeId.id}'>${nodeId.node["name"]}</option>`);
		});

		$("#checkRelations").empty();
		for (let relation in DrawGraph.mGraph._jsonGraph.graph.nodes[primo].edges) {
			if (relation === "is_before" || relation === "has_data_provenance") {
				$("#checkRelations").append(
					`<label for="${relation}" style="color: #000000; font-size: larger; margin-left: 20px"> ${relation} </label><input type="checkbox" id="${relation}" checked/>`
				);
			}
		}

		$(document).on("change", "#checkRelations input", function () {
			DrawGraph.active_relations[this.id] = !DrawGraph.active_relations[this.id];
			nodeProcessor.drawGrafo1(data, $("#nodiRedraw").find(":selected").val());
		});

		$("#nodi").on("change", function () {
			nodeProcessor.show(this.value);
		});

		$("#nodiRedraw").on("change", function () {
			$("#figli").prop("checked", true);
			$("#fratelli").prop("checked", true);

			nodeProcessor.drawGrafo1(data, this.value);
			$("#checkRelations").empty();
			for (let relation in DrawGraph.mGraph._jsonGraph.graph.nodes[this.value].edges) {
				if (relation === "is_before" || relation === "has_data_provenance") {
					$("#checkRelations").append(
						`<label for="${relation}" style="color: #000000; font-size: larger; margin-left: 20px"> ${relation} </label><input type="checkbox" id="${relation}" checked/>`
					);
				}
			}
			$("#nodi").empty();
			DrawGraph.landingNodes.forEach((nodeId) => {
				$("#nodi").append(`<option value='${nodeId["name"]}'>${nodeId["name"]}</option>`);
			});
		});

		$("#clearButton").on("click", function () {
			nodeProcessor.clearAll();
		});

		$("#povX").on("click", function () {
			ATON.Nav.requestPOV(new ATON.POV().setPosition(-8, 0, 0).setTarget(0, 1, 0), 0);
		});

		$("#povY").on("click", function () {
			ATON.Nav.requestPOV(new ATON.POV().setPosition(0, 8, 0).setTarget(0, 0, 0), 0);
		});

		$("#povZ").on("click", function () {
			ATON.Nav.requestPOV(new ATON.POV().setPosition(0, 0, 8).setTarget(0, 1, 0), 0);
		});

		$("#pov3D").on("click", function () {
			ATON.Nav.requestPOV(new ATON.POV().setPosition(-8, 4, 4).setTarget(0, 0, 2), 0);
		});

		$("#figli").change(function () {
			nodeProcessor.showFigli(this.checked);
		});

		$("#fratelli").change(function () {
			nodeProcessor.showFratelli(this.checked);
		});

		nodeProcessor.drawGrafo1(data, primo);

		ATON.Nav.requestPOV(new ATON.POV().setPosition(0, 2, 0).setTarget(0, 0, 0), 0);
	};
};

DrawGraph.loadGraphData = (path) => {
	try {
		return $.getJSON(path, (data) => {
			DrawGraph._gdata = data;

			DrawGraph.loadMAPPingData(DrawGraph.pathAssets + "mAPPing_em.json");
		});
	} catch (error) {
		console.log("Error loading json ");
		console.log(error);
	}
};

DrawGraph.recuperaScena = (id) => {
	let path = "http://150.145.56.133/resources/" + id + "?format=arches-json";
	return $.getJSON(path, (data) => {
		let scenePath = null;
		if (data.tiles) {
			data.tiles.forEach((tile) => {
				for (const item in tile.data) {
					if (Array.isArray(tile.data[item])) {
						tile.data[item].forEach((element) => {
							if (element.url) scenePath = "http://150.145.56.133" + element.url;
						});
					}
				}
			});

			if (scenePath != null) DrawGraph.loadGraphData(scenePath);
		} else {
			alert("Attenzione, ID non valido");
		}
	});
};

DrawGraph.loadMAPPingData = (path) => {
	return $.getJSON(path, (data) => {
		DrawGraph._mAPPingInfo = data;

		ATON.fireEvent("APP_GraphDataLoaded");
	});
};

DrawGraph.setupEvents = () => {
	ATON.on("APP_GraphDataLoaded", () => {});

	ATON.on("KeyPress", (k) => {});
};

DrawGraph.update = () => {};

window.addEventListener("load", DrawGraph.run);

export default DrawGraph;
