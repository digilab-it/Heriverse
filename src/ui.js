import HeriverseNode from "./HeriverseGraph/HeriverseNode.js";
import HeriverseEvents from "./HeriverseEvents.js";

/*
    Heriverse CNR WebApp
    UI component
    
    authors: 3DResearch s.r.l.

================================================================*/
let UI = {};
let transition_time = 1000;
UI.mode = null;
UI.SemNode = null;
UI.sideBarNavigation = [];

UI.getSourceGraphHTML = (emn) => {
	if (emn == null) return "";
	var html = "";
	html += "<div class='accordion' id='accordionLine'>";
	var count = 1;
	let linked_resources = emn.getNeighborsByRelationP(
		HeriverseNode.RELATIONS.HAS_LINKED_RESOURCE,
		HeriverseNode.DIRECTIONS.TO
	);
	for (let id in linked_resources) {
		html += UI.getLinkDiv(linked_resources[id]);
	}
	for (const key in HeriverseNode.RELATIONS) {
		let isBefores = emn.getNeighborsByRelationP(
			HeriverseNode.RELATIONS[key],
			HeriverseNode.DIRECTIONS.BOTH
		);
		if (Object.keys(isBefores).length <= 0) continue;
		html += HeriverseNode.RELATION_LABELS[key.toLowerCase()];
		for (let e in isBefores) {
			let E = isBefores[e];
			html += "<div class='accordion-item custom-btn'>";
			html += `<h2 class='accordion-header' id='accordion-header-${count}'>`;
			html +=
				"<button class='accordion-button collapsed' type='button' data-bs-toggle='collapse' data-bs-target='#cc" +
				count +
				"' aria-expanded='true' aria-controls='collapseOne'>" +
				`<img class="accordion-icon-type" onerror=\"this.style.display='none';\" src=' 
        ${Heriverse.getIconURLbyType(Heriverse.NODETYPES[E.type.toUpperCase()])}' >` +
				E.name +
				"</button></h2>";

			html +=
				"<div id='cc" +
				count +
				`' class='accordion-collapse collapse' aria-labelledby='accordion-header-${count}' data-bs-parent='#accordion-header-${count}'>`;
			html +=
				"<div class='accordion-body' onclick='ATON.fireEvent(`" +
				(E.type !== "document"
					? HeriverseEvents.Events.SHOW_SEMANTIC_NODE
					: HeriverseEvents.Events.SHOW_DOCUMENT_LINK) +
				"`," +
				"`" +
				E.id +
				"`)'>";
			html += `<div style='float:rigth;'><img width='50px' onerror=\"this.style.display='none';\" src=' 
        ${Heriverse.getIconURLbyType(Heriverse.NODETYPES[E.type.toUpperCase()])}' > ${
				E.type
			}</div></div>`;

			if (E.description) html += "<b>Description: </b>" + E.description + "<br><br>";
			if (E.period) html += "<b>Chronology: </b>" + E.period + "<br>";
			if (E.data && E.data.url) {
				html += UI.getLinkDiv(E);
			}

			html += "</div></div>";
			count++;
		}
		count++;
	}
	html += "</div>";
	return html;
};

UI.getLinkDiv = (E) => {
	let div = "";
	if (UI.isLinkToImage(E.data.url)) {
		div =
			"<div data-auto='false' class='fotorama' data-width='100%' data-ratio='16/9' data-maxwidth='100%' data-allowfullscreen='true'>" +
			"<img data-caption='" +
			E.description +
			"' onerror=\"UI.hide();\" id='" +
			E.id +
			"_img" +
			"' alt='" +
			E.data.description +
			"' class='emviqSGDocImg' src='" +
			Heriverse.getLinkToResource(E.data.url) +
			"'></div>";
	} else {
		div = `<span>${Heriverse.getLinkToResource(E.data.url)}</span>`;
	}
	return div;
};

UI.isLinkToImage = (link) => {
	const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "svg"];

	try {
		const extension = link.split(".").pop().toLowerCase();
		return imageExtensions.includes(extension);
	} catch (e) {
		return false;
	}
};

UI.createSidebar = (proxy) => {
	if (
		document.getElementById("sidebar").classList.contains("active") ||
		document.getElementById("sidebar-bottom").classList.contains("active")
	) {
		document.getElementById("sidebar").classList.remove("active");
		$("#sidebar").children().remove();
		document.getElementById("sidebar-bottom").classList.remove("active");
		$("#sidebar-bottom").children().remove();
		var period = document.getElementById("idBottomToolbar");
		period.style.display = "block";

		var right_toolbar_button = document.getElementById("toolbar-right");
		right_toolbar_button.style.display = "block";

		const block = document.getElementById("right-sidebar");
		block.style.display = "none";
	}

	if (proxy) {
		UI.SemNode = proxy;
		UI.sideBarNavigation = [];
		const block = document.getElementById("right-sidebar");
		block.style.display = "block";
		document.getElementById("sidebar").classList.toggle("active");
		document.getElementById("sidebar-bottom").classList.toggle("active");
		UI.populateSideBar(proxy);
	}
};

UI.closeSidebar = () => {
	if (
		document.getElementById("sidebar").classList.contains("active") ||
		document.getElementById("sidebar-bottom").classList.contains("active")
	) {
		document.getElementById("sidebar").classList.remove("active");
		$("#sidebar").children().remove();

		document.getElementById("sidebar-bottom").classList.remove("active");
		$("#sidebar-bottom").children().remove();
		var period = document.getElementById("idBottomToolbar");
		period.style.display = "block";

		var right_toolbar_button = document.getElementById("toolbar-right");
		right_toolbar_button.style.display = "block";

		const block = document.getElementById("right-sidebar");
		block.style.display = "none";
	}
	ATON.fireEvent("CloseSidebar");
};

UI.clickSideBar = (index) => {
	if (index >= 0) {
		if (index + 1 == UI.sideBarNavigation.length) return;
		let EMnode = UI.sideBarNavigation[index];
		UI.sideBarNavigation.length = index;
		UI.populateSideBar(EMnode);
		ATON.fireEvent(HeriverseEvents.Events.SHOW_SEMANTIC_NODE, EMnode.id);
	} else {
		UI.sideBarNavigation = [];
		UI.createSidebar(UI.SemNode);
	}
};

UI.populateSideBar = (EMnode) => {
	document.getElementById("sidebar").innerHTML = "";
	document.getElementById("sidebar-bottom").innerHTML = "";
	var block1 = document.createElement("div");
	var block2 = document.createElement("div");
	UI.sideBarNavigation.push(EMnode);

	if (UI.sideBarNavigation.length > 1) {
		let nav = document.createElement("ul");
		nav.classList.add("breadcrumb");
		for (let navLink in UI.sideBarNavigation) {
			let nod = UI.sideBarNavigation[navLink];
			let link =
				"<a class='sideitem' style='cursor:pointer' onclick='UI.clickSideBar(" +
				navLink +
				")'>" +
				nod.name +
				"</a>";
			let semNodeLink = document.createElement("li");
			semNodeLink.innerHTML = link;
			nav.appendChild(semNodeLink);
		}
		block1.appendChild(nav);
	}
	block1.innerHTML +=
		"<h1>" +
		EMnode.name +
		" " +
		"<img onerror=\"this.style.display='none';\" style='width:100px;height:auto' src='" +
		Heriverse.getIconURLbyType(EMnode.type) +
		"'></img><br>" +
		"</h1>" +
		`<p> authors: ${EMnode.authors}  </p>` +
		`<p> embargo: ${EMnode.embargo_until}  </p>` +
		`<p> license: ${EMnode.license}  </p>`;
	if (EMnode.description) block1.innerHTML += EMnode.description + "</br>";
	loadImage(Heriverse.getLinkToResource(EMnode.url))
		.then((isValid) => {
			if (isValid) {
				block1.innerHTML +=
					"<div data-auto='false' id ='id' class='fotorama' data-width='100%' data-ratio='16/9' data-maxwidth='100%' data-allowfullscreen='true'><img data-caption='" +
					EMnode.description +
					"' onerror=\"this.setAttribute('style', 'display: none !important;')\" id='" +
					EMnode.url +
					"' alt='" +
					EMnode.url +
					"' class='emviqSGDocImg' src='" +
					Heriverse.getLinkToResource(EMnode.url) +
					"'></div>";
				var $fotoramaDiv = $(".fotorama").fotorama();
			} else {
				return;
			}
		})
		.catch((error) => {
			return;
		});
	document.getElementById("sidebar").appendChild(block1);
	let htmlGraph = UI.getSourceGraphHTML(EMnode);

	if (htmlGraph.length > 1) {
		block2.innerHTML = "<div class='emviqSG'>" + htmlGraph + "</div>";
	}
	document.getElementById("sidebar-bottom").appendChild(block2);
	var $fotoramaDiv = $(".fotorama").fotorama();
};

UI.drawPovPosition = () => {
	var radius = 100,
		segments = 5,
		material = new THREE.LineBasicMaterial({ color: 0x0000ff }),
		geometry = new THREE.CircleGeometry(radius, segments);

	geometry.vertices.shift();
};

UI.hide = () => {
	var errorElements = document.querySelectorAll(".fotorama__error");
	errorElements.forEach(function (errorElement) {
		var ancestor = errorElement.closest(".fotorama");
		if (ancestor) {
			ancestor.style.display = "none";
		}
	});
};

function loadImage(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			let timer = setTimeout(() => {
				resolve(true);
			}, 500);
			return image;
		};
		image.onerror = () => {
			return;
		};
		image.src = url;
	});
}

UI.buildScenesUI = (scenes) => {
	let scenesGrid = document.getElementById("scenesGrid");
	let idx = 0;
	for (let _scene in scenes) {
		let scene = scenes[_scene];
		let sceneBox =
			'<a onclick="UI.onClickScene(`' +
			scene.id +
			'`)" ' +
			">" +
			'<div id="thumbnail-' +
			scene.id +
			'" class="col "  style="padding: 0px; aspect-ratio: 1; margin:10px;" ><div class="scene-card scene-box">' +
			'<img class="card-img-top" style="width:100%;  object-fit:cover; aspect-ratio:1" src="' +
			scene.image +
			'"/>' +
			'<div id="scene_' +
			idx +
			'" class="card-img-overlay" style="padding:0;top:auto; color:white; text-align:center">' +
			"<h5>" +
			scene["title@it"] +
			"</h5>" +
			"<h6 style='display:none'> Creato il: " +
			scene["created_at"] +
			"</h6>" +
			"<h6 style='display:none'> Progetto: " +
			scene["project"]["title@it"] +
			"</h6>" +
			"<h6 style='display:none'> Autore: " +
			scene["author"]["name"] +
			"</h6>" +
			"</div>" +
			"<button class='btn-lg btn-bloc openSceneBtn' style='display:none' >Apri Scena</button>" +
			"</div></div></a>";

		let sceneboxmobile =
			"" +
			"<div class='col-xl-3 col-lg-4 col-md-6 col-sm-12 mycontainer-scenes d-flex justify-content-center'>" +
			"<div class='scene-card scene-box m-2 row border-0'>";
		sceneboxmobile +=
			"<div id='scene_" +
			scene["id"] +
			"' style='padding: 10px; color: black;'>" +
			'<img class="card-img rounded card-height responsive-img" style="width:100%;  object-fit:cover; aspect-ratio:1" src="' +
			scene.image +
			'"/>';
		sceneboxmobile +=
			"<h3 class='text-center'>" +
			scene["title@it"].toUpperCase() +
			"</h3><h6>Creato il: " +
			scene["created_at"] +
			"</h6><h6>Progetto: " +
			scene["project"]["title@it"] +
			"</h6><h6>Autore: " +
			scene["author"]["name"] +
			"</h6>";
		sceneboxmobile += "<div id='grid_tags' class='row justify-content-center text-center'>";
		let scenetags = [
			{
				id: "1",
				name: "TAG1",
			},
			{
				id: "2",
				name: "TAG2",
			},
			{
				id: "3",
				name: "TAG3",
			},
		];

		for (let index = 0; index < scenetags.length; index++) {
			sceneboxmobile +=
				"<button id='" +
				scenetags[index].id +
				"' type='button' class='btn btn-small w-25 btn-secondary tag-btn m-2 border-0'  ><h5 style='padding-top: 10%;'>" +
				scenetags[index].name.toUpperCase() +
				"</h5></button>";
		}
		sceneboxmobile += "</div>";
		sceneboxmobile +=
			"<div class='col text-center'><button class='btn-lg btn-bloc openSceneBtn'  >Apri Scena</button></div>";
		sceneboxmobile += "</div></div></div>";

		if (
			navigator.userAgent.match(/Android/i) ||
			navigator.userAgent.match(/iPhone/i) ||
			navigator.userAgent.match(/BlackBerry/i) ||
			navigator.userAgent.match(/Windows Phone/i)
		) {
			scenesGrid.innerHTML += sceneboxmobile;
		} else {
			scenesGrid.innerHTML += sceneBox;
		}

		//scenesGrid.innerHTML += sceneBox;

		$(".col > .scene-card").on("mouseenter", UI.onHoverSceneCard);
		$(".col > .scene-card").on("mouseleave", UI.onLeaveSceneCard);
		idx += 1;
	}
};

UI.onHoverSceneCard = (e) => {
	$(e.currentTarget).find("div").children("h6").css("display", "inline-block");
	$(e.currentTarget).find("div").children("h5").css("color", "black");
	$(e.currentTarget).children("button").css("display", "inline-block");
};
UI.onLeaveSceneCard = (e) => {
	$(e.currentTarget).find("div").children("h6").css("display", "none");
	$(e.currentTarget).find("div").children("h5").css("color", "white");
	$(e.currentTarget).children("button").css("display", "none");
};

UI.prevPOV = () => {
	ATON.fireEvent("PrevPOV", "");
};

UI.nextPOV = () => {
	ATON.fireEvent("NextPOV", "");
};

UI.createPOV = (povs) => {
	let povsKeys = Object.keys(povs);
	let povDIV = document.getElementsByClassName("pov-topbar-nav")[0];
	if (povDIV) {
		povDIV.remove();
	}
	let htmlcontent = "<div class='pov-topbar-nav'>";
	if (povsKeys.length > 0) {
		let url = "res/home.png";
		htmlcontent +=
			'<div onclick="UI.prevPOV()" id="prev" style="left:0%; border-radius:12px 0px 0px 12px; cursor: pointer;" class="pov"> < </div>';
		htmlcontent +=
			"<div class='pov' id='povNameLabel'" +
			">" +
			povsKeys[0].charAt(0).toUpperCase() +
			povsKeys[0].slice(1) +
			"</div>";
		htmlcontent +=
			'<div onclick="UI.nextPOV()" id="next" style="right:0%; border-radius:0px 12px 12px 0px; cursor: pointer;" class="pov"> > </div>';
		htmlcontent += "</div>";
		$("#top-center").append(htmlcontent);
	}
};

UI.moveToPOV = (povName, pov) => {
	const newpovKey = "POV_" + povName;
	if (Heriverse.hiddenPOV != null) {
		Heriverse.hiddenPOV.attachToRoot();
	}
	Heriverse.hiddenPOV = ATON.getSceneNode(newpovKey);
	for (let i = 0; i < ATON.getRootScene().children.length; i++) {
		if (ATON.getRootScene().children[i].name == Heriverse.hiddenPOV.name) {
			ATON.getRootScene().children.splice(i, 1);
		}
	}
	document.getElementById("povNameLabel").innerHTML =
		povName.charAt(0).toUpperCase() + povName.slice(1);
	$("#idPovLabel").hide();
	$("#idView3D").css("cursor", "grab");
	ATON.Nav.requestPOV(
		new ATON.POV(povName)
			.setPosition(pov.position[0], pov.position[1], pov.position[2])
			.setTarget(pov.target[0], pov.target[1], pov.target[2])
			.setFOV(pov.fov)
	);
};

UI.createTitle = (title) => {
	var htmlcontent = '<h1 class="scene-title" style="text-align:center">' + title + "</h1>";
	$("#title").append(htmlcontent);
	$("#mobile-title").append(htmlcontent);
};

UI.createButtonToolbar = (
	icon,
	iconClass,
	div,
	ariaLabel = "",
	onPress,
	mobile = false,
	popover = false,
	popoverContent = ""
) => {
	var htmlcontent =
		'<div tabindex="0" style="cursor:pointer;" id="' +
		icon +
		'" class="' +
		(mobile ? "atonBTN" : "") +
		'"' +
		(popover
			? " data-toggle='popover' data-trigger='focus' data-popover-content='" + popoverContent + "'"
			: "") +
		' aria-label="' +
		ariaLabel +
		'" title="' +
		ariaLabel +
		'"><i style="align-content: center" class="' +
		iconClass +
		(mobile ? " fa-lg" : "") +
		'"></i>' +
		"</div>";
	if (onPress) $(document).on("click", "#" + icon, onPress);
	$("#" + div + "").append(htmlcontent);
};

UI.createButtonMobile = () => {
	let url = "res/geo.png";
	let left;
	var htmlcontent = '<div id="1" style="right:20px" class="icon-menu"><img src=' + url + "> </div>";
	$("#mobile-toolbar").append(htmlcontent);
};

UI.hamburger = (icon) => {
	let url = "res/imgs/" + icon + ".png";
	var htmlcontent = '<div id="' + icon + '" class="icon-menu"><img src=' + url + "> </div>";
	$("#icon-button-menu").append(htmlcontent);
};

UI.buildTimelineUI = (currEM) => {
	$("#idTL").css("flex-wrap", "wrap");
	let htmlcontent = "";
	let selector = "<select id='period-selector' class='selector-epochs form-select mx-auto'> ";
	let selectorContent = "";
	UI.suiPeriodsBTNs = [];

	for (let i = 0; i < currEM.timeline.length; i++) {
		let tp = currEM.timeline[i];
		let st = undefined;
		if (tp.color)
			st =
				"background-color:rgba(" +
				tp.color.r * 255 +
				", " +
				tp.color.g * 255 +
				", " +
				tp.color.b * 255 +
				", 0.5)";

		selectorContent += "<option value='" + tp.name + "'id='tp" + i + "' >" + tp.name + "</option>";
		if (st)
			htmlcontent +=
				"<div type='button' class='btn mx-1' style='" +
				st +
				"' id='tp" +
				i +
				"'><p class='year''>" +
				tp.name +
				"</p></div>";
		else
			htmlcontent +=
				"<div type='button' class='btn mx-1' id='tp" +
				i +
				"'><p class='year''>" +
				tp.name +
				"</p></div>";
	}
	selector += selectorContent + "</select>";
	$("#idTL").html(selector);

	$("#period-selector").on("change", (id) => {
		let selected = $(id.target).find("option:selected").attr("id");
		Heriverse.goToPeriod(selected.match(/\d+/)[0]);
	});
};

UI.rgbToHex = (r, g, b) => {
	return "#" + UI.componentToHex(r) + UI.componentToHex(g) + UI.componentToHex(b);
};

UI.componentToHex = (c) => {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
};

UI.buildPropertyTypeSelector = (propertySchema) => {
	let htmlContent = `<div id=${
		Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY + "Info"
	} aria-labelledBy=${
		Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY + "Info" + "Label"
	} class="d-flex align-items-center"><div class="dropdown-center dropdown" style="float: left"><button style="--selected-bg= #aaaaaa" class="btn selector-properties-type dropdown-toggle" type="button" id="propType-dropdownMenu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> Select property type </button>`;

	let ul = `<ul class="dropdown-menu" style="overflow-y: scroll; height:150px">`;
	let ulContent = "";

	propertySchema["qualia_categories"].forEach((macroProperty) => {
		ulContent += `<p class="w-100" style="border-top: 2px solid black; border-bottom: 2px solid black">${macroProperty.name}</p>`;
		Object.entries(macroProperty.subcategories).forEach(([subCategoryId, subCategory]) => {
			subCategory.qualia.forEach((qualium) => {
				ulContent += `<li onclick="UI.selectPropertyType(this)" id="${qualium.id}"> <p class="dropdown-item"> ${qualium.name}</p></li>`;
			});
		});
	});

	ulContent += "</ul>";
	ul += ulContent + "</div> <div id='propInput-section' style='float: left'></div></div>";
	htmlContent += ul;

	return htmlContent;
};
UI.selectPropertyType = (listElement) => {
	const propertyTypeSelector = document.getElementById("propType-dropdownMenu");
	if (propertyTypeSelector) {
		propertyTypeSelector.innerHTML = $("#" + listElement.id).text();
	}

	const propertyInputSection = document.getElementById("propInput-section");
	let listObject;
	let elementComposition = "";
	Heriverse.properties_rules.qualia_categories.forEach((category) => {
		if (listObject) return;
		Object.values(category.subcategories).forEach((subcategory) => {
			if (listObject) return;
			listObject = subcategory.qualia.find((qualium) => qualium.id === listElement.id);
		});
	});

	switch (listObject.data_type) {
		case "float":
			elementComposition +=
				"<input type='number' id='" +
				Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
				"MeasureValue" +
				"'/>" +
				"<select id='" +
				Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
				"MeasureUnit" +
				"'>";
			listObject.units.forEach((unit) => {
				elementComposition += "<option value='" + unit + "'>" + unit + "</option>";
			});
			elementComposition += "</select>";
			break;
		case "string":
		case "controlled_vocabulary_multiple":
		case "controlled_vocabulary":
			if (listObject.values && listObject.values.length > 0) {
				elementComposition +=
					"<select id='" + Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY + "ControlledValue'>";
				listObject.values.forEach((value) => {
					elementComposition += "<option value='" + value + "'>" + value + "</option>";
				});
				elementComposition += "</select>";
			} else {
				elementComposition +=
					"<input type='text' id='" + Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY + "Value' />";
			}
			break;
		case "percentage":
			elementComposition +=
				"<input type='number' id='" +
				Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
				"Percentage' min='" +
				(listObject.range && listObject.range.length === 2 ? listObject.range[0] : 0) +
				"' max='" +
				(listObject.range && listObject.range.length === 2 ? listObject.range[1] : 100) +
				"'>";
			break;
		case "coordinates":
			if (
				listObject.coordinate_system &&
				listObject.coordinate_system.components &&
				listObject.coordinate_system.components.length > 0
			) {
				listObject.coordinate_system.components.forEach((component) => {
					elementComposition +=
						"<label id='" +
						Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
						component.toUpperCase() +
						"Label' for='" +
						Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
						component.toUpperCase() +
						"'>" +
						component +
						": </label>" +
						"<input type='number' id='" +
						Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
						component.toUpperCase() +
						"'>";
				});
			}
			if (
				listObject.coordinate_system &&
				listObject.coordinate_system.units &&
				listObject.coordinate_system.units.length > 0
			) {
				elementComposition +=
					"<select id='" + Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY + "CoordinatesUnit" + "'>";
				listObject.coordinate_system.units.forEach((unit) => {
					elementComposition += "<option value='" + unit + "'>" + unit + "</option>";
				});
				elementComposition += "</select>";
			}
			break;
		case "angles":
			if (listObject.components && listObject.components.length > 0) {
				listObject.components.forEach((component) => {
					elementComposition +=
						"<label id='" +
						Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
						component.toUpperCase() +
						"Label' for='" +
						Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
						component.toUpperCase() +
						"'>" +
						component +
						": </label>" +
						"<input type='number' id='" +
						Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
						component.toUpperCase() +
						"'>";
				});
			}
			if (listObject.units && listObject.units.length > 0) {
				elementComposition +=
					"<select id='" + Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY + "AngleUnit" + "'>";
				listObject.units.forEach((unit) => {
					elementComposition += "<option value='" + unit + "'>" + unit + "</option>";
				});
				elementComposition += "</select>";
			}
			break;
		case "date":
			elementComposition =
				"<input type='date' id='" +
				Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
				"DateValue" +
				"'/>";
			break;
	}

	if (propertyInputSection) propertyInputSection.innerHTML = elementComposition;
};

UI.buildTimelineSelector = (epochs, conteinerSelector = "#idTL", mobile = false) => {
	let htmlcontent =
		"<div class='dropup-center dropup'><button style='--selected-bg:rgba(255, 255, 255, 0.5); background-color: " +
		(mobile ? "rgba(100, 100, 100, 0.5)" : "rgba(255, 255, 255, 0.5)") +
		"' class='btn selector-epochs dropdown-toggle' type='button' id='dropdownMenu2' data-bs-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>Select A Period</button>";
	let ul = "<ul class='dropdown-menu'>";
	let li = "";
	for (let i = 0; i < epochs.length; i++) {
		let tp = epochs[i];
		li +=
			"<li onclick='UI.clickOnSelectPeriod(this.id," +
			mobile +
			")' id='tp" +
			tp.id +
			"'><p class='dropdown-item' style='--p-item-bg:" +
			"rgba(" +
			tp.color.r * 255 +
			", " +
			tp.color.g * 255 +
			", " +
			tp.color.b * 255 +
			", 0.5)" +
			"'>" +
			tp.name +
			" </p> </li>";
	}
	ul += li + "</ul>";

	htmlcontent += ul;
	if (Heriverse.MODE == Heriverse.MODETYPES.EDITOR) {
		htmlcontent +=
			'<button type="button" class="btn btn-primary btn-new-epoch" data-bs-toggle="modal" data-bs-target="#newEpochModal">' +
			"+" +
			"</button>";
	}
	htmlcontent += "</div></div>";

	$(conteinerSelector).html(htmlcontent);
};

UI.clickOnSelectPeriod = (id, mobile = false) => {
	let period_id = id.substring(2);
	let liElement = mobile
		? document.querySelector("#periodSectionPanel #" + id)
		: document.querySelector("#idTL #" + id);
	const pElement = liElement.querySelector("p");
	const color = getComputedStyle(pElement).getPropertyValue("--p-item-bg");
	//let period = Heriverse.currEM.getPeriod(period_id);
	if (mobile) {
		document.querySelector("#periodSectionPanel #dropdownMenu2").innerHTML = $("#" + id).text();
		document
			.querySelector("#periodSectionPanel #dropdownMenu2")
			.style.setProperty("--selected-bg", color);
	} else {
		document.querySelector("#idTL #dropdownMenu2").innerHTML = $("#" + id).text();
		document.querySelector("#idTL #dropdownMenu2").style.setProperty("--selected-bg", color);
	}
	/*let selectedPeriodColor = period.color;
  let newColor =
    "rgba(" +
    selectedPeriodColor.r * 255 +
    ", " +
    selectedPeriodColor.g * 255 +
    ", " +
    selectedPeriodColor.b * 255 +
    ", 0.5)";*/
	Heriverse.goToPeriodById(period_id);
};

UI.clickToolbarBtn = (id) => {
	if ($("#" + id).hasClass("clicked-toolbar-btn")) {
		$("#" + id).removeClass("clicked-toolbar-btn");
	} else $("#" + id).addClass("clicked-toolbar-btn");
};

UI.disablePinchToZoom = () => {
	var userAgent = navigator.userAgent.toLowerCase();
	var isIOS = /iphone|ipad|ipod/.test(userAgent);
	if (isIOS) {
		document.addEventListener(
			"touchmove",
			function (event) {
				if (event.scale !== 1) {
					event.preventDefault();
				}
			},
			{ passive: false }
		);
	}
};

UI.createPovSceneBtn = (id, x, y, z, color) => {
	const geometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);

	const povSpriteMaterial = new THREE.SpriteMaterial({
		map: new THREE.TextureLoader().load("res/imgs/pov2.png"),
		transparent: true,
		opacity: 1.0,
		depthWrite: false,
		//depthTest: false
		//depthFunc: THREE.GreaterDepth
	});

	const povSprite = new THREE.Sprite(povSpriteMaterial);
	povSprite.position.x = x;
	povSprite.position.y = y;
	povSprite.position.z = z;
	povSprite.scale.set(10, 10, 1);

	let N = ATON.createSceneNode(id);
	N.add(povSprite);
	return N;
};

UI.createDashboarSceneCard = (scene) => {
	let htmlcontent =
		"<div class='col-xl-3 col-lg-4 col-md-6 col-sm-12 mycontainer-scenes d-flex justify-content-center'>" +
		"<div class='scene-card scene-box m-2 row'>";
	let sceneID = "scene_" + scene["id"];
	htmlcontent +=
		"<div id='scene_" +
		scene["id"] +
		"' style='padding: 10px; color: black; text-align: center'><h5>" +
		scene["type"].toUpperCase() +
		"</h5>  ";

	let dropdownMenu =
		"<div id='asd' class='btn-group dropend'><button class='edit-scene-btn dropdown' type='button' data-bs-toggle='dropdown' aria-expanded='false'>" +
		"<i class='fa fa-pen-to-square' aria-hidden='true'></i></button><ul class='dropdown-menu dropdown-menu-dark'><li><a class='dropdown-item' href='#'>Modifica</a></li>" +
		"<li><a class='dropdown-item' href='#'>Duplica</a></li>" +
		" <li><a class='dropdown-item' href='#'>Pubblica</a></li>" +
		"<li><a class='dropdown-item' href='#' style='color:red'>Elimina</a></li>" +
		"</ul></div>";
	htmlcontent +=
		"<div class=' d-flex align-items-center'><h5 style='position: absolute; bottom: 0 !important'>" +
		dropdownMenu +
		scene["name"].toUpperCase() +
		"</h5>";
	htmlcontent += "</div>";
	htmlcontent += "</div></div></div>";

	$("#dashboard-scenes").append(htmlcontent);
};

UI.changedLightIntensity = () => {
	let intensity = document.getElementById("light_intensity").value;
	ATON.fireEvent(HeriverseEvents.Events.CHANGE_LIGHT_INTENSITY, intensity);
};

function toggleRelation() {
	const relationValue = this.dataset.relname;
	if (HeriverseGraphDrawer.activeRelations.includes(relationValue)) {
		const relationIndex = HeriverseGraphDrawer.activeRelations.indexOf(relationValue);
		HeriverseGraphDrawer.activeRelations.splice(relationIndex, 1);
	} else {
		HeriverseGraphDrawer.activeRelations.push(relationValue);
	}
}
UI.buildRelationsManagement = (containerSelector) => {
	const container = document.querySelector(containerSelector);
	let html =
		"<h5 class='mt-2 mb-1 p-1 text-center scene-controls-panel-subtitle' data-i18n='RELATIONS_CHECK_SECTION_TITLE' id='relationCheckSectionTitle'>Relazioni da disegnare</h5>";
	html += "<div id='scene-controls-relations' class='d-flex flex-column align-items-start'>";
	Object.values(HeriverseNode.RELATIONS).forEach((relationName, index) => {
		const relationLabel = HeriverseNode.RELATION_LABELS[relationName];
		html += `<label id="relationCheckbox-${index}-label" for="relationCheckbox-${index}" class="fs-6 text-wrap">`;
		html += `<input class='my-1 relationCheckbox' id='relationCheckbox-${index}' aria-labelledby='relationCheckbox-${index}-label' type='checkbox' data-relname='${relationName}'${
			HeriverseGraphDrawer.activeRelations.includes(relationName) ? " checked" : ""
		}>`;
		html += "</input>";
		html += `${relationLabel}</label>`;
	});
	html += "</div>";

	container.innerHTML = html;

	$(document)
		.off("change", ".relationCheckbox", toggleRelation)
		.on("change", ".relationCheckbox", toggleRelation);
};

let counter,
	currGraphIndex = -1,
	lastElem,
	firstNaming = true,
	selectionBtnText;

function graphOptionCheckActions(e) {
	const targetInput = e.target;
	if (!Heriverse.currentGraphs.includes(targetInput.dataset.id))
		Heriverse.currentGraphs.push(targetInput.dataset.id);
	else if (Heriverse.currentGraphs.includes(targetInput.dataset.id)) {
		const removeIndex = Heriverse.currentGraphs.indexOf(targetInput.dataset.id);
		Heriverse.currentGraphs.splice(removeIndex, 1);
	}

	if (Heriverse.currentGraphs.length > 1) {
		selectionBtnText = Heriverse.currentGraphs.length + " grafi attivi";
	} else if (Heriverse.currentGraphs.length === 1) {
		const inputChecked = document
			.getElementById("graphCollectionSelector")
			.querySelector("input:checked");
		selectionBtnText =
			inputChecked.closest(".checkbox-container").nextSibling.nextSibling.textContent;
	}

	Heriverse.setScene();
	Editor.populateWorkspace();
}
UI.buildGraphSelector = (containerSelector, graphsCollection) => {
	const container = document.querySelector(containerSelector);
	if (!container) return;

	let selectedGraphs = Heriverse.currentGraphs || [];
	let currName = Heriverse.currGraphName || "";
	let currId = Heriverse.currGraphId || "";
	let selectionText = selectionBtnText || "";
	let first = typeof firstNaming !== "undefined" ? firstNaming : true;

	let buttonText = first
		? currName
			? currName
			: "GRAPH " + (graphsCollection.findIndex((elem) => elem.id === currId) + 1)
		: selectionText;

	let html = `
		<div id="graphCollectionSelector" class="graph-selector-container">
			<button type="button" id="graphDropdown" class="graph-selector-btn">
				<span class="button-text">${buttonText}</span>
				<svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
					<path d="M6 8L2 4h8L6 8z" fill="currentColor"/>
				</svg>
			</button>
			<div class="graph-selector-menu" id="graphSelectorMenu">
				<div class="graph-selector-header">
					<h6 class="graph-selector-title">Select Graphs</h6>
				</div>
				<div class="graph-selector-list">
					${graphsCollection
						.filter((graph) => graph.id !== "shelf")
						.map((graph, idx) => {
							let isChecked = selectedGraphs.includes(graph.id);
							let isDisabled = isChecked && selectedGraphs.length === 1;
							return `
								<div class="graph-selector-item ${isDisabled ? "disabled" : ""}" data-index="${idx}" data-id="${
								graph.id
							}">
									<div class="checkbox-container">
										<input class="graph-selector-checkbox" 
											id="graphCollectionName-${idx}"
											data-index="${idx}"
											data-id="${graph.id}"
											type="checkbox"
											${isChecked ? "checked" : ""}
											${isDisabled ? "disabled" : ""}
											autocomplete="off" aria-labelledby="graphCollectionName-${idx}-label"/>
										<div class="checkbox-custom"></div>
									</div>
									<label class="graph-selector-label" for="graphCollectionName-${idx}" id="graphCollectionName-${idx}-label">
										${graph.name ? graph.name : "GRAPH " + (idx + 1)}
									</label>
								</div>
							`;
						})
						.join("")}
				</div>
			</div>
		</div>
	`;

	container.innerHTML = html;

	const dropdown = document.getElementById("graphDropdown");
	const menu = document.getElementById("graphSelectorMenu");
	const arrow = dropdown.querySelector(".dropdown-arrow");
	let isOpen = false;

	dropdown.addEventListener("click", (e) => {
		e.stopPropagation();
		toggleDropdown();
	});

	document.addEventListener("click", (e) => {
		if (!container.contains(e.target)) {
			closeDropdown();
		}
	});

	menu.addEventListener("click", (e) => {
		e.stopPropagation();
	});

	function toggleDropdown() {
		isOpen = !isOpen;
		menu.classList.toggle("open", isOpen);
		arrow.classList.toggle("rotated", isOpen);
		dropdown.classList.toggle("active", isOpen);
	}

	function closeDropdown() {
		isOpen = false;
		menu.classList.remove("open");
		arrow.classList.remove("rotated");
		dropdown.classList.remove("active");
	}

	$(document)
		.off("change", "input[id^=graphCollectionName]", graphOptionCheckActions)
		.on("change", "input[id^=graphCollectionName]", graphOptionCheckActions);

	if (typeof firstNaming !== "undefined") firstNaming = false;
};

let filterSelected;
function activeAutoTemporalFiltersMode(e) {
	const autoTemporalFiltersSelector = document.querySelector(
		"#" + e.target.id + " ~ .auto-temporal-filters-dropdown"
	);
	const periodFiltersSection = e.target.id.includes("mobile")
		? document.querySelector("#" + e.target.id + " ~ .temporal-filters-section-mobile")
		: document.querySelector("#" + e.target.id + " ~ .temporal-filters-section");

	autoTemporalFiltersSelector.classList.toggle("hidden");
	periodFiltersSection.style.display =
		periodFiltersSection.style.display === "contents" ? "none" : "contents";
}
function selectExistingPeriod(e) {
	filterSelected = e.target;
	const periodSelectButton = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #periodSelectorFilter")
		: document.querySelector("#idTL #periodSelectorFilter");
	const startPeriodForm = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #startPeriodFilterForm")
		: document.querySelector("#idTL #startPeriodFilterForm");
	const endPeriodForm = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #endPeriodFilterForm")
		: document.querySelector("#idTL #endPeriodFilterForm");
	const editFilterButton = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #periodEditButton")
		: document.querySelector("#idTL #periodEditButton");

	if (filterSelected.dataset.index !== "0") {
		periodSelectButton.textContent = filterSelected.textContent;
		periodSelectButton.style.setProperty(
			"--p-item-bg",
			filterSelected.style.getPropertyValue("--p-item-bg")
		);
		startPeriodForm.value = filterSelected.dataset.start;
		endPeriodForm.value = filterSelected.dataset.end;

		editFilterButton.disabled = false;
	} else {
		periodSelectButton.textContent = filterSelected.textContent;
		periodSelectButton.style.setProperty(
			"--p-item-bg",
			filterSelected.style.getPropertyValue("--p-item-bg")
		);
		startPeriodForm.value = "";
		endPeriodForm.value = "";

		editFilterButton.disabled = false;
	}
}
function changePeriodFormFilter(e) {
	const periodSelectButton = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #periodSelectorFilter")
		: document.querySelector("#idTL #periodSelectorFilter");
	const resetOption = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #periodSelectorFilter + ul p[data-index='0']")
		: document.querySelector("#idTL #periodSelectorFilter + ul p[data-index='0']");
	const editFilterButton = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #periodEditButton")
		: document.querySelector("#idTL #periodEditButton");

	periodSelectButton.textContent = resetOption.textContent;
	periodSelectButton.style.background = resetOption.style.borderLeftColor;

	const selectedOption = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #periodSelectorFilter + ul p.selected")
		: document.querySelector("#idTL #periodSelectorFilter + ul p.selected");
	if (selectedOption) selectedOption.classList.remove("selected");

	editFilterButton.disabled = true;
}
function useFilterButton(e) {
	const startPeriodForm = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #startPeriodFilterForm")
		: document.querySelector("#idTL #startPeriodFilterForm");
	const endPeriodForm = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #endPeriodFilterForm")
		: document.querySelector("#idTL #endPeriodFilterForm");

	if (!startPeriodForm.value || !endPeriodForm.value) alert("Manca il valore in uno dei due campi");
	else {
		if (e.handleObj.selector.includes("#periodSectionPanel")) Heriverse.goToPeriodById(null, true);
		else Heriverse.goToPeriodById(null);
	}
}
function saveTemporalFilter(e) {
	const startPeriodForm = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #startPeriodFilterForm")
		: document.querySelector("#idTL #startPeriodFilterForm");
	const endPeriodForm = e.handleObj.selector.includes("#periodSectionPanel")
		? document.querySelector("#periodSectionPanel #endPeriodFilterForm")
		: document.querySelector("#idTL #endPeriodFilterForm");

	const savePeriodModal = document.getElementById("savePeriodModal");

	if (startPeriodForm.value)
		savePeriodModal.querySelector("#savePeriodStart").value = startPeriodForm.value;
	if (endPeriodForm.value)
		savePeriodModal.querySelector("#savePeriodEnd").value = endPeriodForm.value;

	const bsModal = bootstrap.Modal.getOrCreateInstance(savePeriodModal);
	bsModal.show();
}
function editTemporalFilter(e) {
	if (filterSelected.dataset.index !== 0) {
		const filterModal = document.getElementById("savePeriodModal");
		const bsModal = bootstrap.Modal.getOrCreateInstance(filterModal);

		const periodSelectButton = e.handleObj.selector.includes("#periodSectionPanel")
			? document.querySelector("#periodSectionPanel #periodSelectorFilter")
			: document.querySelector("#idTL #periodSelectorFilter");
		const startPeriodForm = e.handleObj.selector.includes("#periodSectionPanel")
			? document.querySelector("#periodSectionPanel #startPeriodFilterForm")
			: document.querySelector("#idTL #startPeriodFilterForm");
		const endPeriodForm = e.handleObj.selector.includes("#periodSectionPanel")
			? document.querySelector("#periodSectionPanel #endPeriodFilterForm")
			: document.querySelector("#idTL #endPeriodFilterForm");

		const filterName = filterModal.querySelector("#savePeriodName");
		const filterStart = filterModal.querySelector("#savePeriodStart");
		const filterEnd = filterModal.querySelector("#savePeriodEnd");
		const filterColor = filterModal.querySelector("#savePeriodColor");

		filterName.value = periodSelectButton.textContent;
		filterStart.value = parseInt(startPeriodForm.value);
		filterEnd.value = parseInt(endPeriodForm.value);
		filterColor.value = periodSelectButton.style.getPropertyValue("--p-item-bg");

		bsModal.show();
	}
}
UI.buildPeriodFilter = (containerSelector, mobile = false) => {
	const container = document.querySelector(containerSelector);
	const epochs = Object.entries(Heriverse.currMG.json.context.absolute_time_Epochs).sort(
		(a, b) => a[1].start - b[1].start
	);

	const labelClass = mobile ? "fs-5 my-2 text-dark" : "fs-6 mx-3";

	let html = `<input id="autoTemporalFiltersSwitch${
		mobile ? "-mobile" : ""
	}" type="checkbox"></input>
	<div class="auto-temporal-filters-dropdown hidden">
	<button type="button" id="autoTemporalFilters" class="auto-temporal-filters-dropdown-toggle">Seleziona un filtro</button><ul class="auto-temporal-filters-dropdown-menu-scroll p-3" aria-labelledby="autoTemporalFilters">
		${Heriverse.temporalFilters
			.map(
				(e, i) => `
					<li>
						<p class='autoTemporalFilterOption'
							data-id='${e.id}' data-index='${i + 1}' data-start='${e.start}' data-end='${e.end}'
							style='border-left-color:${e.color};color: black;'>${e.name}</p>
					</li>
				`
			)
			.join("")}
	</ul></div>`;
	html += `<div class="temporal-filters-section${
		mobile ? "-mobile" : ""
	}" style="display: contents"><div class="period-dropdown">
			<button type='button' id='periodSelectorFilter' class='period-dropdown-toggle'>
				Seleziona un periodo
			</button>
			<ul class='period-dropdown-menu-scroll p-3' aria-labelledby='periodSelectorFilter'>
				<li>
					<p class='periodSelectorFilterOption selected' data-index='0'>
						Seleziona un periodo
					</p>
				</li>
				${epochs
					.map(
						([id, e], i) => `
					<li>
						<p class='periodSelectorFilterOption'
							data-id='${id}' data-index='${i + 1}' data-start='${e.start}' data-end='${e.end}'
							style='border-left-color:${e.color};color: black;'>${e.name}</p>
					</li>
				`
					)
					.join("")}
			</ul>
		</div>
		<label class='${labelClass}' data-i18n='START_PERIOD_FILTER'>
			Start <input id='startPeriodFilterForm' type='text'>
		</label>
		<label class='${labelClass.replace("mx-3", "")}' data-i18n='END_PERIOD_FILTER'>
			End <input id='endPeriodFilterForm' type='text'>
		</label>
		<button type='button' id='periodFilterButton' class='filter-button mx-3'
			data-i18n='PERIOD_FILTER_BUTTON'>Filter
		</button>
	`;

	if (Heriverse.MODE === Heriverse.MODETYPES.EDITOR) {
		html += `
			<button type='button' id='periodEditButton' class='btn btn-secondary edit-filter-button' data-i18n='PERIOD_EDIT_BUTTON'
				disabled>Edit period</button>
			<button type='button' id='periodSaveButton' class='btn btn-secondary save-filter-button' data-i18n='PERIOD_SAVE_BUTTON'>Save period</button>
		`;
	}
	html += "</div>";

	container.innerHTML = html;

	const toggle = container.querySelector("#periodSelectorFilter");
	const menu = container.querySelector(".period-dropdown-menu-scroll");
	const options = container.querySelectorAll(".periodSelectorFilterOption");

	toggle.addEventListener("click", (e) => {
		e.stopPropagation();
		const isOpen = menu.classList.contains("show");
		if (isOpen) {
			toggle.classList.remove("open");
			menu.classList.remove("show");
		} else {
			toggle.classList.add("open");
			menu.classList.add("show");
		}
	});

	document.addEventListener("click", (e) => {
		if (!container.contains(e.target)) {
			toggle.classList.remove("open");
			menu.classList.remove("show");
		}
	});

	options.forEach((option) => {
		option.addEventListener("click", (e) => {
			e.stopPropagation();

			options.forEach((opt) => opt.classList.remove("selected"));
			option.classList.add("selected");

			toggle.textContent = option.textContent;

			const computedColor = window.getComputedStyle(option).borderLeftColor;
			toggle.style.background = computedColor;

			const startInput = container.querySelector("#startPeriodFilterForm");
			const endInput = container.querySelector("#endPeriodFilterForm");
			if (option.dataset.start && option.dataset.end) {
				startInput.value = option.dataset.start;
				endInput.value = option.dataset.end;
			} else {
				startInput.value = "";
				endInput.value = "";
			}

			const editBtn = container.querySelector("#periodEditButton");
			if (editBtn) editBtn.disabled = !(option.dataset.start && option.dataset.end);

			toggle.classList.remove("open");
			menu.classList.remove("show");
		});
	});

	$(document)
		.off(
			"change",
			"#autoTemporalFiltersSwitch, #autoTemporalFiltersSwitch-mobile",
			activeAutoTemporalFiltersMode
		)
		.on(
			"change",
			"#autoTemporalFiltersSwitch, #autoTemporalFiltersSwitch-mobile",
			activeAutoTemporalFiltersMode
		);

	$(document)
		.off("click", "#idTL #periodSelectorFilter + ul li", selectExistingPeriod)
		.on("click", "#idTL #periodSelectorFilter + ul li", selectExistingPeriod);
	$(document)
		.off("click", "#periodSectionPanel #periodSelectorFilter + ul li", selectExistingPeriod)
		.on("click", "#periodSectionPanel #periodSelectorFilter + ul li", selectExistingPeriod);

	$(document)
		.off(
			"input",
			"#idTL #startPeriodFilterForm, #idTL #endPeriodFilterForm",
			changePeriodFormFilter
		)
		.on(
			"input",
			"#idTL #startPeriodFilterForm, #idTL #endPeriodFilterForm",
			changePeriodFormFilter
		);
	$(document)
		.off(
			"input",
			"#periodSectionPanel #startPeriodFilterForm, #periodSectionPanel #endPeriodFilterForm",
			changePeriodFormFilter
		)
		.on(
			"input",
			"#periodSectionPanel #startPeriodFilterForm, #periodSectionPanel #endPeriodFilterForm",
			changePeriodFormFilter
		);

	$(document)
		.off("click", "#idTL #periodFilterButton", useFilterButton)
		.on("click", "#idTL #periodFilterButton", useFilterButton);
	$(document)
		.off("click", "#periodSectionPanel #periodFilterButton", useFilterButton)
		.on("click", "#periodSectionPanel #periodFilterButton", useFilterButton);

	if (Heriverse.MODE === Heriverse.MODETYPES.EDITOR) {
		$(document)
			.off("click", "#idTL #periodEditButton", editTemporalFilter)
			.on("click", "#idTL #periodEditButton", editTemporalFilter);
		$(document)
			.off("click", "#periodSectionPanel #periodEditButton", editTemporalFilter)
			.on("click", "#periodSectionPanel #periodEditButton", editTemporalFilter);

		$(document)
			.off("click", "#idTL #periodSaveButton", saveTemporalFilter)
			.on("click", "#idTL #periodSaveButton", saveTemporalFilter);
		$(document)
			.off("click", "#periodSectionPanel #periodSaveButton", saveTemporalFilter)
			.on("click", "#periodSectionPanel #periodSaveButton", saveTemporalFilter);
	}
};

export default UI;
