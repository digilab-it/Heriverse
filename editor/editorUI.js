import HeriverseGraph from "../src/HeriverseGraph/HeriverseGraph.js";
import HeriverseNode from "../src/HeriverseGraph/HeriverseNode.js";
import Editor from "./Editor.js";

/*
    Heriverse CNR WebApp
    EditorUI component
    
    authors: 3DResearch s.r.l.

================================================================*/
let EditorUI = {};
let genericNodeType = [
	HeriverseNode.NODE_TYPE.COMBINER,
	HeriverseNode.NODE_TYPE.DOCUMENT,
	HeriverseNode.NODE_TYPE.GROUP,
	HeriverseNode.NODE_TYPE.EXTRACTOR,
	HeriverseNode.NODE_TYPE.PROPERTY,
];

EditorUI.showEdgeModal = () => {
	let edgetypeselect = document.getElementById("edgetypes");
	edgetypeselect.options.length = 0;

	for (let key in HeriverseNode.RELATIONS) {
		let opt = document.createElement("option");
		opt.value = HeriverseNode.RELATIONS[key];
		opt.textContent = key;
		edgetypeselect.append(opt);
	}
	let from_select = document.getElementById("new-edge-from");
	let to_select = document.getElementById("new-edge-to");
	let nodes = Heriverse.currEM.mdgraph.getNodes();
	for (let key in nodes) {
		let opt = document.createElement("option");
		opt.value = nodes[key].id;
		opt.textContent = nodes[key].name;
		let opt2 = document.createElement("option");
		opt2.value = nodes[key].id;
		opt2.textContent = nodes[key].name;
		from_select.append(opt);
		to_select.append(opt2);
	}
	$(".select2_new_edge").select2({
		dropdownParent: $("#createEdgeModal"),
		width: "100%",
	});

	$("#createEdgeModal").modal("show");
};

EditorUI.showEpochModal = () => {
	let inputGroup = document.getElementById("inputgroup");
	inputGroup.innerHTML = "";
	EditorUI.createInput(
		inputGroup,
		"name_epoch",
		"Nome epoca",
		"Inserisci il nome dell'epoca",
		"text"
	);
	EditorUI.createInput(
		inputGroup,
		"description_epoch",
		"Descrizione epoca",
		"Inserisci la descrizione dell'epoca",
		"text"
	);
	EditorUI.createInput(
		inputGroup,
		"start_time_epoch",
		"Data inizio epoca",
		"Inserisci la data di inizio dell'eopca",
		"text"
	);
	EditorUI.createInput(
		inputGroup,
		"end_time_epoch",
		"Data fine epoca",
		"Inserisci la data di fine dell'epoca",
		"text"
	);
	EditorUI.createInput(
		inputGroup,
		"color_epoch",
		"Colore epoca",
		"Inserisci il colore dell'epoca",
		"color"
	);
	EditorUI.createInput(
		inputGroup,
		"min_y_epoch",
		"Min Y epoca",
		"Inserisci min_y dell'epoca",
		"text"
	);
	EditorUI.createInput(
		inputGroup,
		"max_y_epoch",
		"Max y epoca",
		"Inserisci max_y dell'epoca",
		"text"
	);
	document.getElementById("createNodeModalSaveButton").onclick = Editor.EditorUI.saveEpoch;
	$("#createNodeModal").modal("show");
};

EditorUI.saveEpoch = () => {
	let id = null;
	let name = document.getElementById("name_epoch").value;
	let description = document.getElementById("description_epoch").value;
	let start_time = document.getElementById("start_time_epoch").value;
	let end_time = document.getElementById("end_time_epoch").value;
	let color = document.getElementById("color_epoch").value;
	let min_y = document.getElementById("min_y_epoch").value;
	let max_y = document.getElementById("max_y_epoch").value;

	Editor.addEpoch(id, name, description, start_time, end_time, color, min_y, max_y);
};

EditorUI.showDocumentModal = () => {
	let inputGroup = document.getElementById("inputgroup");
	inputGroup.innerHTML = "";
	EditorUI.createInput(inputGroup, "docName", "Nome", "Inserisci il nome del documento", "text");
	EditorUI.createInput(
		inputGroup,
		"docDescription",
		"Descrizione",
		"Inserisci la descrizione del documento",
		"text"
	);
	EditorUI.createFileInput(inputGroup, "docUrl", "File documento", "Url esterno");
	document.getElementById("createNodeModalSaveButton").onclick = function () {
		Editor.EditorUI.saveImage(shelf);
	};
	$("#createNodeModal").modal("show");
};

EditorUI.saveDocumentModal = () => {
	let id = null;
	let name = document.getElementById("docName").value;
	let description = document.getElementById("docDescription").value;
	let url = document.getElementById("docUrl").value;
	let files = document.getElementById("docUrl_file").files;
	Editor.addDocumentToShelf(id, name, description, url, files);
};

EditorUI.showImageModal = () => {
	let inputGroup = document.getElementById("inputgroup");
	inputGroup.innerHTML = "";
	EditorUI.createInput(inputGroup, "imgName", "Nome", "Inserisci il nome dell'immagine", "text");
	EditorUI.createInput(
		inputGroup,
		"imgDescription",
		"Descrizione",
		"Inserisci la descrizione dell'immagine",
		"text"
	);
	EditorUI.createFileInput(inputGroup, "imgUrl", "File immagine", "Url esterno");
	document.getElementById("createNodeModalSaveButton").onclick = function () {
		Editor.EditorUI.saveImage(shelf);
	};
	$("#createNodeModal").modal("show");
};

EditorUI.saveImage = () => {
	let id = null;
	let name = document.getElementById("imgName").value;
	let description = document.getElementById("imgDescription").value;
	let url = document.getElementById("imgUrl").value;
	let files = document.getElementById("imgUrl_file").files;
	Editor.addImageToShelf(id, name, description, url, files);
};

EditorUI.showRepresentationModelModal = (shelf = false) => {
	let inputGroup = document.getElementById("inputgroup");
	inputGroup.innerHTML = "";
	EditorUI.createInput(inputGroup, "name_node", "Nome", "Inserisci il nome dell'epoca", "text");
	EditorUI.createInput(
		inputGroup,
		"description_node",
		"Descrizione",
		"Inserisci la descrizione",
		"text"
	);
	EditorUI.createFileInput(inputGroup, "url", "File 3D", "Url esterno");
	document.getElementById("createNodeModalSaveButton").onclick = function () {
		Editor.EditorUI.saveRepresentationModel(shelf);
	};
	$("#createNodeModal").modal("show");
};

EditorUI.saveRepresentationModel = (shelf = false) => {
	let id = null;
	let name = document.getElementById("name_node").value;
	let description = document.getElementById("description_node").value;
	let url = document.getElementById("url").value;
	let files = document.getElementById("url_file").files;
	Editor.addRepresentationModel(id, name, description, url, files, shelf);
};

EditorUI.showAuthorModal = () => {
	let inputGroup = document.getElementById("inputgroup");
	inputGroup.innerHTML = "";
	EditorUI.createInput(inputGroup, "name_node", "Nome", "Inserisci il nome del nodo", "text");
	EditorUI.createInput(
		inputGroup,
		"description_node",
		"Descrizione",
		"Inserisci la descrizione",
		"text"
	);
	EditorUI.createInput(inputGroup, "orcid", "ORCID", "Inserisci ORCID", "text");
	EditorUI.createInput(
		inputGroup,
		"author_name",
		"Nome autore",
		"Inserisci il nome dell'autore",
		"text"
	);
	EditorUI.createInput(
		inputGroup,
		"author_surname",
		"Cognome autore",
		"Inserisci il cognome dell'autore",
		"text"
	);

	document.getElementById("createNodeModalSaveButton").onclick = Editor.EditorUI.saveAuthor;
	$("#createNodeModal").modal("show");
};

EditorUI.saveAuthor = () => {
	let id = null;
	let name = document.getElementById("name_node").value;
	let description = document.getElementById("description_node").value;
	let orcid = document.getElementById("orcid").value;
	let author_name = document.getElementById("author_name").value;
	let author_surname = document.getElementById("author_surname").value;

	Editor.addAuthor(id, name, description, orcid, author_name, author_surname);
};

EditorUI.showLinkModal = () => {
	let inputGroup = document.getElementById("inputgroup");
	inputGroup.innerHTML = "";
	EditorUI.createInput(inputGroup, "name_node", "Nome", "Inserisci il nome del nodo", "text");
	EditorUI.createInput(
		inputGroup,
		"description_node",
		"Descrizione",
		"Inserisci la descrizione",
		"text"
	);
	EditorUI.createInput(inputGroup, "url", "URL", "Inserisci ORCID", "text");
	let link_options = ["External link"];
	EditorUI.createSelect(inputGroup, "url_type", "Tipo link", link_options);
	EditorUI.createInput(
		inputGroup,
		"description_link",
		"Descrizione link",
		"Inserisci la descrizione del link",
		"text"
	);

	document.getElementById("createNodeModalSaveButton").onclick = Editor.EditorUI.saveLink;
	$("#createNodeModal").modal("show");
};

EditorUI.saveLink = () => {
	let id = null;
	let name = document.getElementById("name_node").value;
	let description = document.getElementById("description_node").value;
	let url = document.getElementById("url").value;
	let url_type = document.getElementById("url_type").value;
	let description_link = document.getElementById("description_link").value;

	Editor.addLink(id, name, description, url, url_type, description_link);
};

EditorUI.showSemanticShapeModal = () => {
	let inputGroup = document.getElementById("inputgroup");
	inputGroup.innerHTML = "";
	EditorUI.createInput(inputGroup, "name_node", "Nome", "Inserisci il nome del nodo", "text");
	EditorUI.createInput(
		inputGroup,
		"description_node",
		"Descrizione",
		"Inserisci la descrizione",
		"text"
	);
	EditorUI.createInput(inputGroup, "url", "URL", "Inserisci ORCID", "text");

	document.getElementById("createNodeModalSaveButton").onclick = Editor.EditorUI.saveSemanticShape;
	$("#createNodeModal").modal("show");
};

EditorUI.saveSemanticShape = () => {
	let id = null;
	let name = document.getElementById("name_node").value;
	let description = document.getElementById("description_node").value;
	let url = document.getElementById("url").value;
	Editor.addSemantiShape(id, name, description, url);
};

EditorUI.showStratigraphicNodeModal = () => {
	let inputGroup = document.getElementById("inputgroup");
	inputGroup.innerHTML = "";
	EditorUI.createInput(inputGroup, "name_node", "Nome", "Inserisci il nome del nodo", "text");
	EditorUI.createInput(
		inputGroup,
		"description_node",
		"Descrizione",
		"Inserisci la descrizione",
		"text"
	);
	EditorUI.createSelect(
		inputGroup,
		"stratigraphic_type",
		"Tipo",
		HeriverseGraph.stratigraphicTypes
	);
	document.getElementById("createNodeModalSaveButton").onclick =
		Editor.EditorUI.saveStratigraphicNode;
	$("#createNodeModal").modal("show");
};

EditorUI.saveStratigraphicNode = () => {
	let id = null;
	let name = document.getElementById("name_node").value;
	let description = document.getElementById("description_node").value;
	let type = document.getElementById("type").value;
	Editor.addStratigraphic(id, type, name, description);
};

function existingFilterByName(name) {
	const findElement = Object.entries(Heriverse.currMG.json.context.absolute_time_Epochs).find(
		([key, filter]) => name === filter.name
	);
	if (findElement) return findElement[0];
	else return null;
}
EditorUI.savePeriod = () => {
	const savePeriodModal = document.getElementById("savePeriodModal");
	const bsModal = bootstrap.Modal.getOrCreateInstance(savePeriodModal);

	const periodName = savePeriodModal.querySelector("#savePeriodName").value;
	const periodStart = savePeriodModal.querySelector("#savePeriodStart").value;
	const periodEnd = savePeriodModal.querySelector("#savePeriodEnd").value;
	const periodColor = savePeriodModal.querySelector("#savePeriodColor").value;

	const period_id = existingFilterByName(periodName) || "custom_" + periodName.replace(" ", "_");

	if (existingFilterByName(periodName)) {
		Heriverse.currMG.json.context.absolute_time_Epochs[period_id].name = periodName;
		Heriverse.currMG.json.context.absolute_time_Epochs[period_id].start = periodStart;
		Heriverse.currMG.json.context.absolute_time_Epochs[period_id].end = periodEnd;
		Heriverse.currMG.json.context.absolute_time_Epochs[period_id].color = periodColor;
	} else
		Heriverse.currMG.json.context.absolute_time_Epochs[period_id] = {
			name: periodName,
			start: parseInt(periodStart),
			end: parseInt(periodEnd),
			color: periodColor,
		};

	Heriverse.Scene.multigraph.context.absolute_time_Epochs =
		Heriverse.currMG.json.context.absolute_time_Epochs;
	Heriverse.ResourceScene.resource_json.multigraph.context.absolute_time_Epochs =
		Heriverse.currMG.json.context.absolute_time_Epochs;

	UI.buildPeriodFilter("#idTL");
	bsModal.hide();
	[...savePeriodModal.querySelectorAll("input[type='text']")].forEach((elem) => (elem.value = ""));
	[...savePeriodModal.querySelectorAll("input[type='color']")].forEach(
		(elem) => (elem.value = "#000000")
	);
};

EditorUI.showNodeModal = () => {
	let inputGroup = document.getElementById("inputgroup");
	inputGroup.innerHTML = "";
	let select = document.createElement("select");
	select.id = "type_node";
	select.className = "form-control";
	for (let i = 0; i < genericNodeType.length; i++) {
		let opt = document.createElement("option");
		opt.value = genericNodeType[i];
		opt.textContent = genericNodeType[i];
		select.appendChild(opt);
	}
	inputGroup.appendChild(select);
	EditorUI.createInput(inputGroup, "name_node", "Nome", "Inserisci il nome del nodo", "text");
	EditorUI.createInput(
		inputGroup,
		"description_node",
		"Descrizione",
		"Inserisci la descrizione",
		"text"
	);

	document.getElementById("createNodeModalSaveButton").onclick = Editor.EditorUI.saveNode;
	$("#createNodeModal").modal("show");
};

EditorUI.saveNode = () => {
	let id = null;
	let name = document.getElementById("name_node").value;
	let description = document.getElementById("description_node").value;
	let type = document.getElementById("type_node").value;
	let data = {};
	Editor.addNode(id, type, name, description, data);
};

EditorUI.createSelect = (container, id, label, options) => {
	let select = document.createElement("select");
	select.id = id;
	select.className = "form-control";
	const labelElement = document.createElement("label");
	labelElement.setAttribute("for", id);
	labelElement.textContent = label;
	labelElement.classList.add("form-label");

	for (let i = 0; i < options.length; i++) {
		let opt = document.createElement("option");
		opt.value = options[i];
		opt.textContent = options[i];
		select.appendChild(opt);
	}
	container.appendChild(labelElement);
	container.appendChild(select);
};

EditorUI.createInput = (container, id, label, hint, type) => {
	const input = document.createElement("input");
	input.id = id;
	input.name = id;
	input.type = type || "text";
	input.hint = hint;
	input.classList.add("form-control");
	const labelElement = document.createElement("label");
	labelElement.setAttribute("for", id);
	labelElement.textContent = label;
	labelElement.classList.add("form-label");
	container.appendChild(labelElement);
	container.appendChild(input);
};

EditorUI.createFileInput = (container, id, label, hint) => {
	//<label for="new-object-url" class="form-label">URL</label>
	//<input id="new-object-url" class="form-control" name="new-object-url" type="text" hint="URL modello">
	//<input id="new-object-file" class="form-control" name="new-object-file" type="file" multiple>
	const input = document.createElement("input");
	input.id = id;
	input.name = id;
	input.type = "text";
	input.hint = hint;
	input.classList.add("form-control");

	let inputFile = document.createElement("input");
	inputFile.id = id + "_file";
	inputFile.classList.add("form-control");
	inputFile.type = "file";
	inputFile.multiple = true;

	const labelElement = document.createElement("label");
	labelElement.setAttribute("for", id);
	labelElement.textContent = label;
	labelElement.classList.add("form-label");
	container.appendChild(labelElement);
	container.appendChild(input);
	container.appendChild(inputFile);
};
export default EditorUI;
