/*!
    @preserve

 	EMviq

 	@author Bruno Fanini
	VHLab, CNR ISPC

==================================================================================*/
"use strict";

/**
@namespace EMVIQ
*/
let EMVIQ = {};
window.EMVIQ = EMVIQ;

import HERUI from "./ui.js";

import EM from "./EM.js";

EMVIQ.EM = EM;
EMVIQ.HERUI = HERUI;

EMVIQ.YED_dNodeGraphics = "d6";
EMVIQ.YED_dEdgeGraphics = "d10";
EMVIQ.YED_dAttrDesc = "d5";
EMVIQ.YED_dAttrURL = "d4";

EMVIQ.YED_sSeriation = "ellipse";
EMVIQ.YED_sUS = "rectangle";
EMVIQ.YED_sUSVS = "parallelogram";
EMVIQ.YED_sUSVN = "hexagon";
EMVIQ.YED_sSF = "octagon";

EMVIQ.NODETYPES = {
	SERIATION: 0,
	US: 1,
	USVS: 2,
	USVN: 3,
	SPECIALFIND: 4,

	COMBINER: 5,
	EXTRACTOR: 6,
	DOCUMENT: 7,
	PROPERTY: 8,
	CONTINUITY: 9,
};

EMVIQ.getIconURLbyType = (type) => {
	if (type === EMVIQ.NODETYPES.SERIATION) return "res/emicons/SUseries.png";
	if (type === EMVIQ.NODETYPES.US) return "res/emicons/US.png";
	if (type === EMVIQ.NODETYPES.USVS) return "res/emicons/USVs.png";
	if (type === EMVIQ.NODETYPES.USVN) return "res/emicons/USVn.png";
	if (type === EMVIQ.NODETYPES.SPECIALFIND) return "res/emicons/SF.png";

	if (type === EMVIQ.NODETYPES.COMBINER) return "res/emicons/combiner.png";
	if (type === EMVIQ.NODETYPES.EXTRACTOR) return "res/emicons/extractor.png";
	if (type === EMVIQ.NODETYPES.DOCUMENT) return "res/emicons/document.png";
	if (type === EMVIQ.NODETYPES.PROPERTY) return "res/emicons/property.png";
	if (type === EMVIQ.NODETYPES.CONTINUITY) return "res/emicons/continuity.png";

	return "";
};

EMVIQ.getDosCoBaseURL = () => {};

EMVIQ.x2js = new X2JS({ attributePrefix: "@" });

EMVIQ.buildColorPalette = () => {
	EMVIQ.colors = [];

	let gm = 4.0;
	let rm = 2.0;

	let gcol = new THREE.Color(0.031 * gm, 0.191 * gm, 0.026 * gm);
	let rcol = new THREE.Color(0.328 * rm, 0.033 * rm, 0.033 * rm);

	EMVIQ.colors.push(gcol);
	EMVIQ.colors.push(rcol);
	EMVIQ.colors.push(new THREE.Color(0.018, 0.275, 0.799));
	EMVIQ.colors.push(gcol);
	EMVIQ.colors.push(new THREE.Color(0.799, 0.753, 0.347));

	EMVIQ.matProxyOFF = [];
	EMVIQ.matProxyON = [];

	for (let i in EMVIQ.colors) {
		EMVIQ.matProxyOFF.push(
			new THREE.MeshStandardMaterial({
				color: EMVIQ.colors[i],
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

		EMVIQ.matProxyON.push(
			new THREE.MeshStandardMaterial({
				color: EMVIQ.colors[i],
				transparent: true,
				depthWrite: false,
				opacity: 0.4,
				//flatShading: true,
				depthTest: true,
				//side: THREE.DoubleSide
				//polygonOffset: true,
				//polygonOffsetFactor: -1,
				//polygonOffsetUnits: 1,
				//renderOrder: 2
			})
		);
	}
};

EMVIQ.setProxiesOpacity = (f) => {
	for (let m in EMVIQ.matProxyOFF) {
		EMVIQ.matProxyOFF[m].opacity = f;
		EMVIQ.matProxyON[m].opacity = f + 0.1;
	}
};

EMVIQ.setProxiesAlwaysVisible = (b) => {
	EMVIQ._bProxiesAlwaysVis = b;

	for (let m in EMVIQ.matProxyOFF) {
		EMVIQ.matProxyOFF[m].depthTest = !b;
		EMVIQ.matProxyON[m].depthTest = !b;
	}
};

EMVIQ.init = () => {
	ATON.FE.realize();

	EMVIQ.paramSID = ATON.FE.urlParams.get("s");

	EMVIQ.currPeriodName = undefined;
	EMVIQ._bShowAllProxies = false;

	EMVIQ.buildColorPalette();

	ATON.FE.setupBasicUISounds();
	EMVIQ.setupUI();
	EMVIQ.setupSUI();
	EMVIQ.setupEventHandlers();

	EMVIQ.run();
};

EMVIQ.run = () => {
	if (EMVIQ.paramSID === undefined || EMVIQ.paramSID === null) return;

	ATON.FE.loadSceneID(EMVIQ.paramSID);

	EMVIQ.loadEM(ATON.PATH_SCENES + EMVIQ.paramSID);
};

EMVIQ.loadEM = (url, bReload) => {
	ATON._rootSem.removeChildren();

	EMVIQ.currEM = new EMVIQ.EM(url);
	EMVIQ.currEM.parseGraphML(() => {
		EMVIQ.currEM.realizeProxyGraphFromJSONNode();
		EMVIQ.currEM.buildEMgraph("home");

		HERUI.buildTimelineUI(EMVIQ.currEM);
		HERUI.createButtonToolbar("home", 1);
		HERUI.createButtonToolbar("Union", 2);
		HERUI.createButtonToolbarCentral("position", -1);
		HERUI.createButtonToolbarCentral("geo", 1);
		HERUI.createTitleScena("TEMPIO DI PLUTONE", "Scena Privata");
		HERUI.createPOV();
		HERUI.createButtonMobile();
		HERUI.hamburger("home", 1);
		var homeButton = document.getElementById("home1");
		homeButton.addEventListener("click", function () {
			$(".menu").animate({ left: "0px" }, 1000);
		});

		if (bReload) {
			EMVIQ.currEM.buildContinuity();
			EMVIQ.currEM.buildRec();

			EMVIQ.goToPeriod(EMVIQ.currPeriodIndex);
		}
	});
};

EMVIQ.setupUI = () => {
	const toolbar = document.getElementById("idTopToolbar");

	EMVIQ.setupSearchUI();
};

EMVIQ.uiSetPeriodIndex = (i) => {
	var elemento = document.getElementById("tp" + i);
	for (let t = 0; t < EMVIQ.currEM.timeline.length; t++) {
		var elemento1 = document.getElementById("tp" + t);
		elemento1.style.boxShadow = "0px 0px 0px 0px";
	}
	$("#tp" + i)
		.siblings()
		.removeClass("emviqPeriodSelected");
	let tp = EMVIQ.currEM.timeline[i];
	elemento.style.boxShadow =
		" 0px 0px 3px 3px rgba(" +
		tp.color.r * 255 +
		", " +
		tp.color.g * 255 +
		", " +
		tp.color.b * 255 +
		", 0.4)";
	$("#tp" + i).addClass("emviqPeriodSelected");
};

EMVIQ.buildTimelineUI = () => {
	let htmlcontent = "";

	EMVIQ.suiPeriodsBTNs = [];

	for (let i = 0; i < EMVIQ.currEM.timeline.length; i++) {
		let tp = EMVIQ.currEM.timeline[i];

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
			EMVIQ.goToPeriod(i);
		};

		suiBTN.setPosition(0, i * 0.35, 0);
		suiBTN.setScale(3.0);

		suiBTN.setText(tp.name);

		if (tp.color) suiBTN.setBaseColor(tp.color);
		suiBTN.setBackgroundOpacity(0.3);

		EMVIQ.suiPeriodsBTNs.push(suiBTN);
	}

	let numPeriods = EMVIQ.suiPeriodsBTNs.length;

	if (numPeriods > 0) {
		const pi2 = Math.PI * 0.5;

		EMVIQ.suiTimeline.removeChildren();

		EMVIQ.suiTimeline.setPosition(-0.1, 0, 0.1).setRotation(-pi2, -pi2, pi2).setScale(0.1);

		for (let i = 0; i < numPeriods; i++) EMVIQ.suiPeriodsBTNs[i].attachTo(EMVIQ.suiTimeline);

		EMVIQ.suiTimeline.attachToRoot();
		EMVIQ.suiTimeline.hide();
	}

	$("#idTL").html(htmlcontent);

	for (let i = 0; i < EMVIQ.currEM.timeline.length; i++) {
		let tp = EMVIQ.currEM.timeline[i];
		$("#tp" + i).click(() => {
			//EMVIQ.filterByPeriodIndex(i);
			//EMVIQ.uiSetPeriodIndex(i);
			EMVIQ.goToPeriod(i);
		});
	}
};

EMVIQ.setupSearchUI = function () {
	let elSearch = document.getElementById("idSearch");
	//elSearch.addEventListener( 'keydown', (e)=>{ e.stopPropagation(); }, false );

	$("#idSearch").on("keyup", () => {
		let string = $("#idSearch").val();
		//ATON.SUI.infoNode.visible = false;
		EMVIQ.search(string);
	});

	$("#idSearch").focus(() => {
		ATON._bListenKeyboardEvents = false;
		ATON._bPauseQuery = true;
		ATON.SUI.infoNode.visible = false;
		//ATON.FE.popupClose();
	});
	$("#idSearch").blur(() => {
		ATON._bListenKeyboardEvents = true;
		if (ATON.FE._bPopup) ATON._bPauseQuery = false;
	});

	$("#idSearchMatches").hide();
};

EMVIQ.setupSUI = () => {
	let I = ATON.SUI.getInfoNode();

	EMVIQ.suiDescBlock = new ThreeMeshUI.Block({
		width: 0.2,
		height: 0.05,
		padding: 0.01,
		borderRadius: 0.01,
		backgroundColor: ATON.MatHub.colors.white,

		fontFamily: ATON.PATH_RES + "fonts/custom-msdf.json",
		fontTexture: ATON.PATH_RES + "fonts/custom.png",

		alignContent: "left",
		justifyContent: "center",

		interLine: 0.003,
	});

	EMVIQ.suiDescBlock.position.set(0, -0.05, 0);

	EMVIQ.suiDescText = new ThreeMeshUI.Text({
		content: "...",
		fontSize: 0.01,
		fontColor: ATON.MatHub.colors.black,
	});
	EMVIQ.suiDescBlock.add(EMVIQ.suiDescText);

	ATON.SUI.infoNode.add(EMVIQ.suiDescBlock);
	EMVIQ.suiDescBlock.visible = false;

	EMVIQ.suiTimeline = ATON.createUINode();
	EMVIQ.suiPeriodsBTNs = [];
};

EMVIQ.setupEventHandlers = () => {
	ATON.FE.addBasicLoaderEvents();
	ATON.on("Tap", (e) => {
		HERUI.createSidebar();
	});
	ATON.on("SemanticNodeHover", (semid) => {
		EMVIQ.updateQueriedProxyInfo(semid);

		if (EMVIQ._bShowAllProxies) return;

		let S = ATON.getSemanticNode(semid);
		if (S) S.highlight();
	});
	ATON.on("SemanticNodeLeave", (semid) => {
		$("#idProxyID").html("");

		if (EMVIQ._bShowAllProxies) return;

		let S = ATON.getSemanticNode(semid);
		if (S) S.restoreDefaultMaterial();
	});

	ATON.on("AllNodeRequestsCompleted", () => {
		EMVIQ.highlightFirstValidPeriod();

		EMVIQ.currEM.buildContinuity();
		EMVIQ.currEM.buildRec();

		ATON.SUI.setSelectorRadius(0.1);
	});

	ATON.on("XRmode", (b) => {
		EMVIQ.suiDescBlock.visible = b;
		if (b) ATON.FE.popupClose();
	});

	ATON.on("XRcontrollerConnected", (c) => {
		if (c === ATON.XR.HAND_L) {
			ATON.XR.controller1.add(EMVIQ.suiTimeline);
			EMVIQ.suiTimeline.show();
		}

		ThreeMeshUI.update();
	});

	ATON.on("KeyPress", (k) => {
		if (k === "m") EMVIQ.measure();

		if (k === "x") ATON._bPauseQuery = !ATON._bPauseQuery;
	});
};

EMVIQ.measure = () => {
	let P = ATON.getSceneQueriedPoint();
	let M = ATON.SUI.addMeasurementPoint(P);
};

EMVIQ.highlightFirstValidPeriod = () => {
	for (let i = 0; i < EMVIQ.currEM.timeline.length; i++) {
		let period = EMVIQ.currEM.timeline[i];

		let gPeriod = ATON.getSceneNode(period.name);
		if (gPeriod) {
			EMVIQ.goToPeriod(i);
			return;
		}
	}

	EMVIQ.showAllProxies(true);

	EMVIQ.goToPeriod(0);
};

EMVIQ.showAllProxies = (b) => {
	EMVIQ._bShowAllProxies = b;

	for (let d in EMVIQ.currEM.proxyNodes) {
		let proxy = EMVIQ.currEM.proxyNodes[d];
		if (b) {
			proxy.show();
			proxy.highlight();
		} else proxy.restoreDefaultMaterial();
	}
};

EMVIQ.highlightProxies = function (idlist) {
	let numHL = idlist.length;

	for (let d in EMVIQ.currEM.proxyNodes) {
		let proxy = EMVIQ.currEM.proxyNodes[d];
		let did = proxy.nid;

		if (!EMVIQ._bShowAllProxies) proxy.restoreDefaultMaterial();

		for (let i = 0; i < numHL; i++) {
			if (did === idlist[i]) {
				proxy.highlight();
			}
		}
	}
};

EMVIQ.filterByPeriodName = function (periodname) {
	$("#idPeriodName").html(periodname);

	EMVIQ.currPeriodName = periodname;

	EMVIQ.currEM.timeline.forEach((p) => {
		let rmGroup = ATON.getSceneNode(p.name);

		if (p.name === periodname) {
			if (rmGroup) rmGroup.show();
		} else {
			if (rmGroup) rmGroup.hide();
		}
	});

	if (!EMVIQ._bShowAllProxies) {
		for (let p in EMVIQ.currEM.proxyNodes) {
			let P = EMVIQ.currEM.proxyNodes[p];
			let EMdata = P.userData.EM;

			if (EMdata.periods[periodname] !== undefined) {
				P.show();
			} else P.hide();
		}
	}

	EMVIQ.highlightProxies([]);
};

EMVIQ.filterByPeriodIndex = function (i) {
	let period = EMVIQ.currEM.timeline[i];
	if (!period) return;

	EMVIQ.currPeriodIndex = i;
	EMVIQ.filterByPeriodName(period.name);
};

EMVIQ.goToPeriod = (i) => {
	EMVIQ.filterByPeriodIndex(i);
	EMVIQ.uiSetPeriodIndex(i);

	if (EMVIQ.suiTimeline) {
		for (let k = 0; k < EMVIQ.suiPeriodsBTNs.length; k++) {
			let B = EMVIQ.suiPeriodsBTNs[k];

			if (k === i) B.setBackgroundOpacity(0.9);
			else B.setBackgroundOpacity(0.3);
		}
	}
};

EMVIQ.blurProxiesCurrPeriod = function () {
	for (let p in EMVIQ.currEM.proxyNodes) {
		let proxy = EMVIQ.currEM.proxyNodes[p];
		let EMdata = proxy.userData.EM;

		if (EMdata.periods[EMVIQ.currPeriodName] !== undefined) proxy.restoreDefaultMaterial();
	}

	/*
    let proxiesGroup = ATON.getSemanticNode(EMVIQ.currPeriodName);
    if (!proxiesGroup) return;

    let numProxies = proxiesGroup.children.length;
    for (let d = 0; d < numProxies; d++){
        let D = proxiesGroup.children[d];

        if (!EMVIQ._bShowAllProxies) D.restoreDefaultMaterial();
    }
*/
};

EMVIQ.getSourceGraphHTML = (emn) => {
	if (emn.children.lenght < 1) return "";

	let html = "";

	for (let e in emn.children) {
		let E = emn.children[e];

		html +=
			"<details class='emviqSGEntry'><summary class='emviqSNTitle'><img src='" +
			EMVIQ.getIconURLbyType(E.type) +
			"'>" +
			E.label +
			"</summary>";

		if (E.description) html += "<b>Description: </b>" + E.description + "<br><br>";
		if (E.period) html += "<b>Chronology: </b>" + E.period + "<br>";
		if (E.url)
			html += "<img class='emviqSGDocImg' src='" + ATON.PATH_SCENES + EMVIQ.paramSID + E.url + "'>";

		html += EMVIQ.getSourceGraphHTML(E);
		html += "</details>";
	}

	return html;
};

EMVIQ.updateQueriedProxyInfo = function (did) {
	let proxy = EMVIQ.currEM.proxyNodes[did];
	if (!proxy) return;

	let EMdata = proxy.userData.EM;
	let content = "<span style='font-size:32px;'>" + did + "</span><br>";

	if (EMdata.description) content += EMdata.description + "</br>";
	content +=
		"<img style='width:100px;height:auto' src='" +
		EMVIQ.getIconURLbyType(EMdata.type) +
		"'></img><br>";

	const emn = EMVIQ.currEM.getSourceGraphByProxyID(did);

	content +=
		"<div class='emviqSG' style='height:500px'>" + EMVIQ.getSourceGraphHTML(emn) + "</div>";

	$("#idProxyID").html(content);

	EMVIQ.suiDescText.set({ content: EMdata.description });
};

EMVIQ.search = function (string) {
	if (string.length < 2) {
		EMVIQ.blurProxiesCurrPeriod();
		$("#idSearchMatches").hide();
		return;
	}

	string = string.toLowerCase();

	EMVIQ.sematches = [];
	let aabbProxies = new THREE.Box3();

	for (let did in EMVIQ.currEM.proxyNodes) {
		let bAdd = false;

		let didstr = did.toLowerCase();
		let D = ATON.getSemanticNode(did);
		let proxy = EMVIQ.currEM.proxyNodes[did];
		let EMdata = proxy.userData.EM;

		if (EMdata.periods[EMVIQ.currPeriodName] !== undefined) {
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
			EMVIQ.sematches.push(did);
			aabbProxies.expandByObject(D);
		}
	}

	let len = EMVIQ.sematches.length;
	if (len > 0) {
		$("#idProxyID").html("");

		EMVIQ.highlightProxies(EMVIQ.sematches);

		let bsProxies = new THREE.Sphere();
		aabbProxies.getBoundingSphere(bsProxies);
		ATON.Nav.requestPOVbyBound(bsProxies, 0.5);

		$("#idSearchMatches").html(len);
		$("#idSearchMatches").show();
	} else {
		EMVIQ.blurProxiesCurrPeriod();
		$("#idSearchMatches").hide();
	}
};

EMVIQ.searchClear = function () {
	$("#idSearch").val("");
	$("#idSearchMatches").hide();

	ATON._bPauseQuery = false;
	EMVIQ.blurProxiesCurrPeriod();
};

EMVIQ.popupSettings = () => {
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
	$("#idConfigShowAllProxies").prop("checked", EMVIQ._bShowAllProxies);
	$("#idConfigProxiesAlwaysVis").prop("checked", EMVIQ._bProxiesAlwaysVis);

	$("#idConfigOcclusion").on("change", () => {
		ATON._bQuerySemOcclusion = $("#idConfigOcclusion").is(":checked");
	});
	$("#idConfigShowAllProxies").on("change", () => {
		let b = $("#idConfigShowAllProxies").is(":checked");
		EMVIQ.showAllProxies(b);
	});
	$("#idConfigProxiesAlwaysVis").on("change", () => {
		let b = $("#idConfigProxiesAlwaysVis").is(":checked");
		EMVIQ.setProxiesAlwaysVisible(b);
	});

	$("#idProxiesOpacity").on("change", () => {
		let f = parseFloat($("#idProxiesOpacity").val());
		EMVIQ.setProxiesOpacity(f);
	});
};

EMVIQ.popupMatches = () => {
	let num = EMVIQ.sematches.length;
	if (num <= 0) return;

	let htmlcontent = "<div style='height: 50% !important;'>";
	htmlcontent += "<div class='atonPopupTitle'>" + num + " Matches</div>";

	htmlcontent += "<table>";

	htmlcontent +=
		"<thead><tr><th>Proxy ID</th><th>Time</th><th>Description</th><th>URL</th></tr></thead>";

	htmlcontent += "<tbody>";
	for (let d = 0; d < num; d++) {
		let did = EMVIQ.sematches[d];
		let proxy = EMVIQ.currEM.proxyNodes[did];
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

window.addEventListener("load", () => {
	EMVIQ.init();
});
