"use strict";
import HeriverseNode from "../src/HeriverseGraph/HeriverseNode.js";
import HeriverseEvents from "../src/HeriverseEvents.js";
import ShelfNode from "../src/ShelfGraph/ShelfNode.js";

/**
@namespace Editor
*/
import EditorUI from "./editorUI.js";
import UI from "../src/ui.js";
import HeriverseGraph from "../src/HeriverseGraph/HeriverseGraph.js";

let Editor = {};
let epoch = null;
let lastWorkspaceX, lastWorkspaceY;
let currShelfElement, currWorkspaceElement, currSelectedNode;

Editor.semanticShapeDrawingActive = false;

let addFromScene = false;

let setupModals = false,
	setupPanels = false,
	setupShelfResMB = false;

let closedSRModal, completedSingleRMModal;

Editor.modal_steps = [
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC,
		title: "Nodo Stratigrafico",
		i18n_label: "STRATIGRAPHIC_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC + "Select",
				label: "Seleziona nodo stratigrafico",
				i18n_label: "STRATIGRAPHIC_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.STRATIGRAPHIC,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.STRATIGRAPHIC,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.STRATIGRAPHIC,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC + "TypeSelect",
				label: "Tipo",
				i18n_label: "TYPE_SELECTION_LABEL",
				type: "typeSelector",
				required: true,
				element_type: HeriverseNode.TYPE.STRATIGRAPHIC,
				values: Object.values(HeriverseNode.STRATIGRAPHIC_TYPE),
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC + "Checklist",
				label: "Epoche",
				i18n_label: "EPOCHS_SELECTION_LABEL",
				type: "checklist",
				required: true,
				element_type: HeriverseNode.TYPE.STRATIGRAPHIC,
				checklist_type: HeriverseNode.TYPE.EPOCHS,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY,
		title: "Nodo Proprietà",
		i18n_label: "PROPERTY_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY + "Select",
				label: "Seleziona nodo Proprietà",
				i18n_label: "PROPERTY_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.PROPERTIES,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY + "Info",
				label: "Informazioni",
				i18n_label: "INFORMATION_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.PROPERTIES,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.EXTRACTOR,
		title: "Nodo Estrattore",
		i18n_label: "EXTRACTOR_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EXTRACTOR + "Select",
				label: "Seleziona nodo Estrattore",
				i18n_label: "EXTRACTOR_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.EXTRACTORS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EXTRACTOR + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.EXTRACTORS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EXTRACTOR + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.EXTRACTORS,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.COMBINER,
		title: "Nodo Combiner",
		i18n_label: "COMBINER_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.COMBINER + "Select",
				label: "Seleziona nodo Combiner",
				i18n_label: "COMBINER_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.COMBINERS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.COMBINER + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.COMBINERS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.COMBINER + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.COMBINERS,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.TIME_BRANCH_GROUP,
		title: "Nodo TimeBranchGroup",
		i18n_label: "TIMEBRANCHGROUP_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.TIME_BRANCH_GROUP + "Select",
				label: "Seleziona nodo TimeBranchGroup",
				i18n_label: "TIMEBRANCHGROUP_NODE_SELECT",
				type: "select",
				element_type: "time_branch_group",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.TIME_BRANCH_GROUP + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: "time_branch_group",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.TIME_BRANCH_GROUP + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: "time_branch_group",
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL,
		title: "Nodo RM",
		i18n_label: "RM_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL + "Select",
				label: "Seleziona nodo RM",
				i18n_label: "RM_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.REPRESENTATION_MODELS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.REPRESENTATION_MODELS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.REPRESENTATION_MODELS,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_DOC,
		title: "Nodo RM doc",
		i18n_label: "RM_DOC_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_DOC + "Select",
				label: "Seleziona nodo RM Doc",
				i18n_label: "RM_DOC_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.REPRESENTATION_MODEL_DOC,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_DOC + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.REPRESENTATION_MODEL_DOC,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_DOC + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.REPRESENTATION_MODEL_DOC,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_SF,
		title: "Nodo RM SF",
		i18n_label: "RM_SF_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_SF + "Select",
				label: "Seleziona nodo RM SF",
				i18n_label: "RM_SF_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.REPRESENTATION_MODEL_SF,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_SF + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.REPRESENTATION_MODEL_SF,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_SF + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.REPRESENTATION_MODEL_SF,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.EPOCH,
		title: "Nodo Epoca",
		i18n_label: "EPOCH_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EPOCH + "Select",
				label: "Seleziona nodo Epoca",
				i18n_label: "EPOCH_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.EPOCHS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EPOCH + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.EPOCHS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EPOCH + "StartTime",
				label: "Inizio Epoca",
				i18n_label: "START_EPOCH_LABEL",
				type: "number",
				required: true,
				element_type: HeriverseNode.TYPE.EPOCHS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EPOCH + "EndTime",
				label: "Fine Epoca",
				i18n_label: "END_EPOCH_LABEL",
				type: "number",
				required: true,
				element_type: HeriverseNode.TYPE.EPOCHS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EPOCH + "Color",
				label: "Colore associato",
				i18n_label: "COLOR_LABEL",
				type: "color",
				required: true,
				element_type: HeriverseNode.TYPE.EPOCHS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EPOCH + "MinY",
				label: "Y Minima",
				i18n_label: "MIN_Y_LABEL",
				type: "number",
				required: true,
				element_type: HeriverseNode.TYPE.EPOCHS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EPOCH + "MaxY",
				label: "Y Massima",
				i18n_label: "MAX_Y_LABEL",
				type: "number",
				required: true,
				element_type: HeriverseNode.TYPE.EPOCHS,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.PARADATA,
		title: "Nodo Paradata",
		i18n_label: "PARADATA_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.PARADATA + "Select",
				label: "Seleziona nodo Paradata",
				i18n_label: "PARADATA_NODE_SELECT",
				type: "select",
				element_type: "paradata",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.PARADATA + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: "paradata",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.PARADATA + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: "paradata",
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.PARADATA_GROUP,
		title: "Nodo ParadataGroup",
		i18n_label: "PARADATAGROUP_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.PARADATA_GROUP + "Select",
				label: "Seleziona nodo ParadataGroup",
				i18n_label: "PARADATAGROUP_NODE_SELECT",
				type: "select",
				element_type: "parada_group",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.PARADATA_GROUP + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: "parada_group",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.PARADATA_GROUP + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: "parada_group",
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.DOCUMENT,
		title: "Nodo Documento",
		i18n_label: "DOCUMENT_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.DOCUMENT + "Select",
				label: "Seleziona nodo Documento",
				i18n_label: "DOCUMENT_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.DOCUMENTS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.DOCUMENT + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.DOCUMENTS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.DOCUMENT + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.DOCUMENTS,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.ACTIVITY_GROUP,
		title: "Nodo ActivityGroup",
		i18n_label: "ACTIVITYGROUP_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.ACTIVITY_GROUP + "Select",
				label: "Seleziona nodo ActivityGroup",
				i18n_label: "ACTIVITYGROUP_NODE_SELECT",
				type: "select",
				element_type: "activity_group",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.ACTIVITY_GROUP + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: "activity_group",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.ACTIVITY_GROUP + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: "activity_group",
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.GRAPH,
		title: "Nodo Graph",
		i18n_label: "GRAPH_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.GRAPH + "Select",
				label: "Seleziona nodo Graph",
				i18n_label: "GRAPH_NODE_SELECT",
				type: "select",
				element_type: "graph",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.GRAPH + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: "graph",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.GRAPH + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: "graph",
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.GEO_POSITION,
		title: "Nodo GeoPosition",
		i18n_label: "GEO_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.GEO_POSITION + "Select",
				label: "Seleziona nodo GeoPosition",
				i18n_label: "GEO_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.GEO,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.GEO_POSITION + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.GEO,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.GEO_POSITION + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.GEO,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.SPECIAL_FIND_UNIT,
		title: "Nodo SF",
		i18n_label: "SF_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.SPECIAL_FIND_UNIT + "Select",
				label: "Seleziona nodo SF",
				i18n_label: "SF_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.STRATIGRAPHIC_TYPE.SF,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.SPECIAL_FIND_UNIT + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.STRATIGRAPHIC_TYPE.SF,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.SPECIAL_FIND_UNIT + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.STRATIGRAPHIC_TYPE.SF,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.NODE,
		title: "Nodo",
		i18n_label: "NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.NODE + "Select",
				label: "Seleziona nodo",
				i18n_label: "NODE_SELECT",
				type: "select",
				element_type: "node",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.NODE + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: "node",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.NODE + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: "node",
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.SEMANTIC_SHAPE,
		title: "Nodo Semantic Shape",
		i18n_label: "SEMANTIC_SHAPE_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.SEMANTIC_SHAPE + "Select",
				label: "Seleziona nodo Semantic Shape",
				i18n_label: "SEMANTIC_SHAPE_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.SEMANTIC_SHAPES,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.SEMANTIC_SHAPE + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.SEMANTIC_SHAPES,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.SEMANTIC_SHAPE + "Relate",
				label: "Seleziona nodo stratigrafico",
				i18n_label: "STRATIGRAPHIC_NODE_SELECT",
				type: "nodeSelector",
				required: true,
				element_type: HeriverseNode.TYPE.SEMANTIC_SHAPES,
				valuesType: HeriverseNode.NODE_TYPE.STRATIGRAPHIC,
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.LICENSE,
		title: "Nodo Licenza",
		i18n_label: "LICENSE_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.LICENSE + "Select",
				label: "Seleziona nodo Licenza",
				i18n_label: "LICENSE_NODE_SELECT",
				type: "select",
				element_type: "license",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.LICENSE + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: "license",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.LICENSE + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: "license",
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.EMBARGO,
		title: "Nodo Embargo",
		i18n_label: "EMBARGO_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EMBARGO + "Select",
				label: "Seleziona nodo Embargo",
				i18n_label: "EMBARGO_NODE_SELECT",
				type: "select",
				element_type: "embargo",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EMBARGO + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: "embargo",
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.EMBARGO + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: "embargo",
			},
		],
	},
	{
		node_type: Heriverse.CONNECTION_RULES_NODETYPES.LINK,
		title: "Nodo Link",
		i18n_label: "LINK_NODE_TITLE",
		fields: [
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.LINK + "Select",
				label: "Seleziona nodo Link",
				i18n_label: "LINK_NODE_SELECT",
				type: "select",
				element_type: HeriverseNode.TYPE.LINKS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.LINK + "Name",
				label: "Nome",
				i18n_label: "NAME_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.LINKS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.LINK + "Description",
				label: "Descrizione",
				i18n_label: "DESCRIPTION_LABEL",
				type: "textarea",
				required: true,
				element_type: HeriverseNode.TYPE.LINKS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.LINK + "TypeSelect",
				label: "Tipo",
				i18n_label: "TYPE_SELECTION_LABEL",
				type: "typeSelector",
				required: true,
				element_type: HeriverseNode.TYPE.LINKS,
				values: ["External Link", "3d_model", "image", "document"],
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.LINK + "Files",
				label: "File Locali",
				i18n_label: "LOCAL_FILE_LABEL",
				type: "file",
				multiple: true,
				required: true,
				accept: "",
				element_type: HeriverseNode.TYPE.LINKS,
			},
			{
				id: Heriverse.CONNECTION_RULES_NODETYPES.LINK + "FileText",
				label: "File Remoto",
				i18n_label: "REMOTE_FILE_LABEL",
				type: "text",
				required: true,
				element_type: HeriverseNode.TYPE.LINKS,
			},
		],
	},
];

window.Editor = Editor;
Editor.currentOperation;
Editor.currObj;
Editor.EditorUI = EditorUI;

Editor.semSHAPE;
Editor.semSHAPEShape;

Editor.init = () => {
	if (!setupPanels) {
		Editor.setupEventHandlers();
		Editor.setupWorkspace();
		Editor.setupShelf();
		setupPanels = true;
	}
	Editor.populateShelfPanel();
	Editor.populateWorkspace();
	if (!setupModals) {
		setupModals = true;
	}
	if (!setupShelfResMB) {
		Editor.setupShelfResManageButtons();
		setupShelfResMB = true;
	}

	Heriverse.gizmoControls = new THREE.TransformControls(
		ATON.Nav._camera,
		ATON._renderer.domElement
	);

	ATON.SceneHub._bEdit = true;
};

Editor.getNameFileByUrl = (url) => {
	let lastSlashIndex = url.lastIndexOf("/");
	let fileName = url.substring(lastSlashIndex + 1);
	return fileName;
};

Editor.populateLayersDiv = (epoch) => {
	let s = Heriverse.Scene;
	let objectsList = document.getElementById("left-panel-body");
	objectsList.innerHTML = "";

	if (s.scenegraph && s.scenegraph.nodes && s.scenegraph.nodes[epoch]) {
		for (let url in s.scenegraph.nodes[epoch].urls) {
			objectsList.innerHTML +=
				"<div id='" +
				url +
				"'>" +
				Editor.getNameFileByUrl(s.scenegraph.nodes[epoch].urls[url]) +
				'<button type="button" onclick="Editor.delete3DObject(' +
				url +
				' )">-</button></div>';
		}
	}
	objectsList.innerHTML +=
		'<button type="button" class="btn btn-primary btn-new-epoch" data-bs-toggle="modal" data-bs-target="#import3DObjectModal">' +
		"Aggiungi o importa modello 3D" +
		"</button>";
};

Editor.shelf_objects_in_scene = [];
Editor.shelf_objects_in_graph = {};

function filterShelfResource() {
	const textInputValue = document.getElementById("shelf-panel-searchbar-text").value;
	const activePanel = document.querySelector("#shelf-panel-body > .d-block");
	const activePanelItems = activePanel.querySelectorAll(".shelf-panel-element");

	const linkAsInput = /^(http|https):\/\/([\w-]+(\.[\w-]+)+)(\/[\w-./?%&amp;=]*)?$/.test(
		textInputValue
	);

	const entriesFiltered = [...activePanelItems].filter((htmlElement) =>
		linkAsInput
			? htmlElement.dataset.urlContent === textInputValue
			: htmlElement.dataset.nameContent.toLowerCase().includes(textInputValue.toLowerCase())
	);

	activePanelItems.forEach((elem) => {
		elem.classList.toggle("d-none", !entriesFiltered.includes(elem));
	});
}
Editor.setupShelf = () => {
	const searchBarInput = document.getElementById("shelf-panel-searchbar-text");

	searchBarInput.addEventListener("input", filterShelfResource);
};

function createShelfPanelElement(elementName, elementDescription, elementUrl, urlType) {
	let panelEntry =
		"<li class='list-group-item bg-dark text-white d-flex flex-row align-items-center shelf-panel-element' data-url-content='" +
		elementUrl +
		"' data-content-type='" +
		urlType +
		"' data-name-content='" +
		elementName +
		"' data-description-content='" +
		elementDescription +
		"'>";
	panelEntry += "<div class='me-3'>";
	switch (urlType) {
		case "3d_model":
			panelEntry += "<img src='../res/imgs/model_label.svg' alt='3D logo' class='shelf_entry_img'>";
			break;
		case "image":
			panelEntry +=
				"<img src='../res/imgs/img_label.svg' alt='Image logo' class='shelf_entry_img'>";
			break;
		case "document":
			panelEntry +=
				"<img src='../res/imgs/doc_label.svg' alt='Document logo' class='shelf_entry_img'>";
			break;
	}
	panelEntry += "</div>";
	panelEntry += "<div class='flex-grow-1 me-3'>";
	panelEntry += "<div class='fw-bold'>" + elementName + "</div>";
	panelEntry += "</div>";
	panelEntry += "<div>" + "<i class='fas fa-chevron-right text-light'>" + "</i>" + "</div>";
	panelEntry += "</li>";

	return panelEntry;
}
Editor.populateShelfPanel = () => {
	if (
		!Heriverse ||
		!Heriverse.ShelfGraph ||
		Object.values(Heriverse.ShelfGraph.linksByUrlType).length <= 0
	)
		return;
	if (Heriverse.ShelfGraph && Heriverse.ShelfGraph.linksByUrlType) {
		let elemsByUrlType = Heriverse.ShelfGraph.linksByUrlType;
		let all_links_panel = document.querySelector("#shelf-panel-all-links-list ul");
		let model_links_panel = document.querySelector("#shelf-panel-3D-links-list ul");
		let img_links_panel = document.querySelector("#shelf-panel-img-links-list ul");
		let doc_links_panel = document.querySelector("#shelf-panel-doc-links-list ul");

		all_links_panel.innerHTML = "";
		model_links_panel.innerHTML = "";
		img_links_panel.innerHTML = "";
		doc_links_panel.innerHTML = "";

		Object.keys(elemsByUrlType).forEach((urlType) => {
			let elements = elemsByUrlType[urlType];
			Object.keys(elements).forEach((elemId) => {
				let element = elements[elemId];
				let panelElement = createShelfPanelElement(
					element.name,
					element.description,
					element.data.url,
					urlType
				);
				all_links_panel.innerHTML += panelElement;
				switch (urlType) {
					case "3d_model":
						model_links_panel.innerHTML += panelElement;
						break;
					case "image":
						img_links_panel.innerHTML += panelElement;
						break;
					case "document":
						doc_links_panel.innerHTML += panelElement;
						break;
				}
			});
		});
	}
	$(document).ready(() => {
		function makeListItemsDraggable(panelSelector, listElementSelector) {
			const tempVector = new THREE.Vector3();

			closedSRModal = false;

			const items = document.querySelectorAll(listElementSelector);
			const panel = document.querySelector(panelSelector);
			const typeSelector = document.querySelector("#insertShelfResourceModalElementType");

			const modal = document.getElementById("insertShelfResourceModal");
			const bsModal = bootstrap.Modal.getOrCreateInstance(modal);

			const btnSuccess = document.getElementById("insertShelfResourceModalInsertButton");
			const btnCancel = document.getElementById("insertShelfResourceModalCancel");

			let pendingUrl, pendingType, pendingPosition;

			function showModal(url, type, position) {
				pendingUrl = url;
				pendingType = type;
				pendingPosition = position;
				bsModal.show();
			}

			function hideModal() {
				bsModal.hide();
				pendingUrl = pendingType = pendingPosition = null;
			}

			modal.addEventListener("shown.bs.modal", () => {
				typeSelector.options[1].disabled =
					currShelfElement.dataset.contentType !== ShelfNode.CONTENT_TYPE.MODEL_3D;
				typeSelector.options[3].disabled =
					currShelfElement.dataset.contentType !== ShelfNode.CONTENT_TYPE.MODEL_3D ||
					currWorkspaceElement.dataset.bsType !== HeriverseNode.STRATIGRAPHIC_TYPE.SF;
			});

			modal.addEventListener("hidden.bs.modal", () => {
				if (!closedSRModal) {
					const typeSelected = typeSelector.value;
					const dynamicModal = document.getElementById("dynamicModalPathCreation");
					const bsDynModal = bootstrap.Modal.getOrCreateInstance(dynamicModal);
					if (typeSelected === "representation") {
						Editor.setupModalSteps(
							Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC,
							Heriverse.CONNECTION_RULES_NODETYPES.LINK,
							"representation"
						);

						if (!pathToCreate) return;

						bsDynModal.show();
					} else if (typeSelected === "document") {
						Editor.setupModalSteps(
							Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC,
							Heriverse.CONNECTION_RULES_NODETYPES.LINK,
							"document"
						);

						if (!pathToCreate) return;

						bsDynModal.show();
					} else if (typeSelected === "special_find") {
						Editor.setupModalSteps(
							Heriverse.CONNECTION_RULES_NODETYPES.SEMANTIC_SHAPE,
							Heriverse.CONNECTION_RULES_NODETYPES.LINK,
							"special_find"
						);

						if (!pathToCreate) return;

						bsDynModal.show();
					}
				}
				modal.querySelector("select").selectedIndex = 0;
			});

			btnSuccess.addEventListener("click", () => {
				closedSRModal = false;
				hideModal();
			});
			btnCancel.addEventListener("click", () => {
				closedSRModal = true;
				hideModal();
			});

			function addContentToScene(
				content_name,
				content_description,
				url_content,
				type_content,
				position_drop
			) {
				let scene_node = ATON.createSceneNode();
				Editor.shelf_objects_in_scene.push(scene_node);
				currSelectedNode = scene_node;
				if (type_content === ShelfNode.CONTENT_TYPE.MODEL_3D) {
					scene_node.load(url_content, () => {
						const box = new THREE.Box3().setFromObject(scene_node.children[0]);
						const center = new THREE.Vector3();
						box.getCenter(center);
						const size = new THREE.Vector3();
						box.getSize(size);

						scene_node.position.copy(position_drop);
						scene_node.position.y += (center.y || size.y) + 0.05;

						scene_node.attachToRoot();

						scene_node.name = content_name;

						scene_node.userData.addedToScene = true;
						scene_node.userData.addedToGraph = false;
						scene_node.userData.urlContent = url_content;
						scene_node.userData.contType = type_content;
						scene_node.userData.contName = content_name;
						scene_node.userData.contDescription = content_description;

						const objectDataNOIS = {
							objectName: scene_node.name,
							objectType: scene_node.type,
							objectUserData: scene_node.userData,
							position: scene_node.position.clone(),
							rotation: scene_node.rotation.clone(),
							scale: scene_node.scale.clone(),
						};

						const dataNOIS = {
							event: HeriverseEvents.Events.NEW_OBJECT_IN_SCENE,
							object: objectDataNOIS,
						};

						ATON.fireEvent(HeriverseEvents.Events.PHOTON_EVENT, dataNOIS);

						Heriverse.gizmoControls.attach(scene_node);
						ATON._mainRoot.add(Heriverse.gizmoControls.getHelper());

						toggleShelfResManageButtons(scene_node.userData.addedToScene);
						toggleAddRemoveNodeFromGraph(scene_node.userData.addedToGraph);

						const modes = ["translate", "rotate", "scale", null];
						let modeIndex = 0;

						function updateGizmoMode(currNode) {
							ATON._mainRoot.remove(Heriverse.gizmoControls.getHelper());

							const mode = modes[modeIndex];
							if (mode) {
								Heriverse.gizmoControls.enabled = true;
								Heriverse.gizmoControls.setMode(mode);
								Heriverse.gizmoControls.attach(currNode);
								ATON._mainRoot.add(Heriverse.gizmoControls.getHelper());
							} else {
								Heriverse.gizmoControls.enabled = false;
							}
						}

						const pointer = new THREE.Vector2();

						ATON.on("Tap", (e) => {
							pointer.x = (e.clientX / ATON._renderer.domElement.clientWidth) * 2 - 1;
							pointer.y = -(e.clientY / ATON._renderer.domElement.clientHeight) * 2 + 1;

							ATON._rcScene.setFromCamera(pointer, ATON.Nav._camera);

							const hits = ATON._rcScene.intersectObjects(Editor.shelf_objects_in_scene, true);

							if (hits.length > 0) {
								if (!currSelectedNode) {
									modeIndex = 0;
									currSelectedNode = hits[0].object;
									updateGizmoMode(currSelectedNode);
									return;
								} else if (currSelectedNode !== hits[0].object) {
									Heriverse.gizmoControls.detach(currSelectedNode);
									currSelectedNode = hits[0].object;
									modeIndex = 0;
									updateGizmoMode(currSelectedNode);
									return;
								}
								modeIndex = (modeIndex + 1) % modes.length;
								updateGizmoMode(currSelectedNode);
							} else {
								ATON._mainRoot.remove(Heriverse.gizmoControls.getHelper());
								modeIndex = 0;
								currSelectedNode = null;
							}
						});

						function onControllerEvent(e) {
							const controller = e.target;

							if (controller.userData.active === false) return;

							Heriverse.gizmoControls.getRaycaster().setFromXRController(controller);

							if (e.type === "selectstart") {
								Heriverse.gizmoControls.pointerDown(null);
							} else if (e.type === "selectend") {
								Heriverse.gizmoControls.pointerUp(null);
							} else if (e.type === "move") {
								Heriverse.gizmoControls.pointerHover(null);
								Heriverse.gizmoControls.pointerMove(null);
							} else if (e.type === "squeezestart") {
								const hits = ATON._rcScene.intersectObjects(Editor.shelf_objects_in_scene, true);
								if (hits.length > 0) {
									modeIndex = (modeIndex + 1) % modes.length;
									updateGizmoMode();
								}
							}
						}

						Heriverse.gizmoControls.addEventListener("dragging-changed", (e) => {
							if (ATON.Nav._controls) {
								ATON.Nav._controls.enabled = !e.value;
							}
							const objectDataOPC = {
								objectName: scene_node.name,
								objectType: scene_node.type,
								position: scene_node.position.clone(),
								rotation: scene_node.rotation.clone(),
								scale: scene_node.scale.clone(),
							};

							const dataOPC = {
								event: HeriverseEvents.Events.OBJECT_POSITION_CHANGE,
								object: objectDataOPC,
							};
							ATON.fireEvent(HeriverseEvents.Events.PHOTON_EVENT, dataOPC);
						});
						Heriverse.gizmoControls.addEventListener("change", () => {
							ATON._renderer.render(ATON._mainRoot, ATON.Nav._camera);
						});

						ATON._renderer.xr.getController(0).addEventListener("squeezestart", onControllerEvent);
						ATON._renderer.xr.getController(1).addEventListener("move", onControllerEvent);
						ATON._renderer.xr.getController(0).addEventListener("selectstart", onControllerEvent);
						ATON._renderer.xr.getController(0).addEventListener("selectend", onControllerEvent);
					});
				}
			}

			items.forEach((item) => {
				item.style.cursor = "grab";

				let previewBox, previewModel, previewRenderer, previewScene, previewCamera, previewAnimId;

				item.addEventListener("pointerdown", function (e) {
					e.preventDefault();
					currShelfElement = item;

					item.style.cursor = "grabbing";

					const rect = item.getBoundingClientRect();
					const offsetX = e.clientX - rect.left;
					const offsetY = e.clientY - rect.top;

					const clone = item.cloneNode(true);

					clone.style.opacity = "0.8";

					clone.style.position = "absolute";
					clone.style.left = rect.left + "px";
					clone.style.top = rect.top + "px";
					clone.style.zIndex = 1000;
					document.body.appendChild(clone);

					function onPointerMove(e) {
						clone.style.left = e.clientX - offsetX + "px";
						clone.style.top = e.clientY - offsetY + "px";
					}

					function onPointerUp(e) {
						document.removeEventListener("pointermove", onPointerMove);
						document.removeEventListener("pointerup", onPointerUp);

						item.style.cursor = "grab";

						const dropX = e.clientX;
						const dropY = e.clientY;

						const panelRect = panel.getBoundingClientRect();
						const workspaceRect = document
							.querySelector("#workspace-panel")
							.getBoundingClientRect();
						const isOverPanel =
							dropX >= panelRect.left &&
							dropX <= panelRect.right &&
							dropY >= panelRect.top &&
							dropY <= panelRect.bottom;
						const isOverWorkspace =
							dropX >= workspaceRect.left &&
							dropX <= workspaceRect.right &&
							dropY >= workspaceRect.top &&
							dropY <= workspaceRect.bottom;

						const contentUrl = clone.getAttribute("data-url-content");
						const contentType = clone.getAttribute("data-content-type");
						const contentName = clone.getAttribute("data-name-content");
						const contentDescription = clone.getAttribute("data-description-content");

						const mouse = new THREE.Vector2();

						mouse.x = (dropX / window.innerWidth) * 2 - 1;
						mouse.y = -(dropY / window.innerHeight) * 2 + 1;

						ATON._rcScene.setFromCamera(mouse, ATON.Nav._camera);
						const intersectsScene = ATON._rcScene.intersectObjects(ATON.getRootScene().children);
						ATON._rcScene.setFromCamera(mouse, ATON.Nav._camera);
						const intersectsSemantics = ATON._rcSemantics.intersectObjects(
							ATON.getRootSemantics().children
						);

						if (
							(intersectsScene.length > 0 || intersectsSemantics.length > 0) &&
							!isOverPanel &&
							!isOverWorkspace
						) {
							const dropPoint =
								intersectsScene.length > 0
									? intersectsScene[0].point
									: intersectsSemantics[0].point;
							addContentToScene(
								contentName,
								contentDescription,
								contentUrl,
								contentType,
								dropPoint
							);
						}

						if (isOverWorkspace) {
							currWorkspaceElement = document
								.elementsFromPoint(e.clientX, e.clientY)
								.find((node) => document.getElementById("workspace-panel-body").contains(node))
								.closest("li");

							const wsElementType = currWorkspaceElement.getAttribute("data-bs-type");
							if (Heriverse.HeriverseGraph.stratigraphicTypes.includes(wsElementType)) {
								lastWorkspaceX = e.clientX;
								lastWorkspaceY = e.clientY;
								closedSRModal = false;
								addFromScene = false;
								$("#insertShelfResourceModal").modal("show");
							}
						}

						if (clone && clone.parentElement) {
							clone.parentElement.removeChild(clone);
						}
					}

					document.addEventListener("pointermove", onPointerMove);
					document.addEventListener("pointerup", onPointerUp);
				});

				item.addEventListener("mouseenter", function (e) {
					const contentType = item.getAttribute("data-content-type");
					const contentUrl = item.getAttribute("data-url-content");

					if (!contentUrl) return;

					previewBox = document.createElement("div");
					previewBox.classList.add("previewBox");

					switch (contentType) {
						case ShelfNode.CONTENT_TYPE.MODEL_3D:
							let previewCanvas = document.createElement("canvas");
							previewCanvas.classList.add("previewCanvas");

							previewBox.appendChild(previewCanvas);
							document.body.appendChild(previewBox);

							previewRenderer = new THREE.WebGLRenderer({
								canvas: previewCanvas,
								alpha: false,
								antialias: true,
							});
							previewRenderer.setSize(200, 150);
							previewRenderer.setClearColor(0xdddddd);

							previewScene = new THREE.Scene();

							const previewWidth = 200;
							const previewHeight = 150;
							const aspect = previewWidth / previewHeight;

							const frustumSize = 1.5;
							previewCamera = new THREE.OrthographicCamera(
								(-frustumSize * aspect) / 2,
								(frustumSize * aspect) / 2,
								frustumSize / 2,
								-frustumSize / 2,
								0.1,
								10
							);
							previewCamera.position.set(1, 1, 1);
							previewCamera.lookAt(0, 0, 0);
							previewCamera.updateProjectionMatrix();

							const previewLight = new THREE.DirectionalLight(0xffffff, 1);
							previewLight.position.set(1, 1, 1);
							previewScene.add(previewLight);
							previewScene.add(new THREE.AmbientLight(0x404040));

							ATON._aLoader.load(contentUrl, (gltf) => {
								previewModel = gltf.scene;
								const box = new THREE.Box3().setFromObject(previewModel);
								const size = box.getSize(new THREE.Vector3());
								const maxDim = Math.max(size.x, size.y, size.z);
								previewModel.scale.multiplyScalar(1 / maxDim);
								box.setFromObject(previewModel);
								box.getCenter(previewModel.position).multiplyScalar(-1);
								if (previewScene) previewScene.add(previewModel);

								const previewAnimate = () => {
									previewAnimId = requestAnimationFrame(previewAnimate);
									if (previewRenderer) previewRenderer.render(previewScene, previewCamera);
								};
								previewAnimate();
							});
							break;
						case ShelfNode.CONTENT_TYPE.IMAGE:
							let previewImg = document.createElement("img");
							previewImg.classList.add("previewImg");
							previewImg.src = contentUrl;

							previewBox.appendChild(previewImg);
							document.body.appendChild(previewBox);
							break;
					}

					positionPreview(e, previewBox);

					function onPointerMove(e) {
						if (previewBox) positionPreview(e, previewBox);
					}

					function onPointerLeave(e) {
						if (contentType === ShelfNode.CONTENT_TYPE.MODEL_3D)
							cancelAnimationFrame(previewAnimId);

						if (previewScene && previewModel) previewScene.remove(previewModel);
						if (previewRenderer) {
							previewRenderer.dispose();
							previewRenderer.forceContextLoss();
							previewRenderer.domElement = null;
							previewRenderer.context = null;
						}

						item.removeEventListener("mouseleave", Editor.onPointerLeave);
						item.removeEventListener("mousemove", onPointerMove);

						if (previewBox && previewBox.parentElement) {
							previewBox.parentElement.removeChild(previewBox);
						}

						previewBox = undefined;
						if (contentType === ShelfNode.CONTENT_TYPE.MODEL_3D)
							previewRenderer = previewScene = previewCamera = previewModel = undefined;
					}

					item.addEventListener("mousemove", onPointerMove);
					item.addEventListener("mouseleave", onPointerLeave);

					function positionPreview(e, box) {
						const offsetX = 12,
							offsetY = 12;
						let x = e.clientX + offsetX,
							y = e.clientY + offsetY;

						const rect = box.getBoundingClientRect();
						if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 5;
						if (y + rect.height > window.innerHeight) x = window.innerHeight - rect.height - 5;

						box.style.left = x + "px";
						box.style.top = y + "px";
					}
				});
			});
		}

		makeListItemsDraggable("#shelf-panel", ".shelf-panel-element");
	});
};

function selectWorkspacePanel(e) {
	document
		.querySelectorAll("#workspace-panel-body .d-block[id^='workspace-panel-'] li")
		.forEach((elem) => elem.classList.toggle("d-none", false));
	document.querySelector("#workspace-panel-searchbar-text").value = "";

	const panels = document.querySelectorAll("#workspace-panel-body [id^='workspace-panel-']");

	panels.forEach((panel) => {
		panel.classList.remove("d-block");
		panel.classList.add("d-none");
	});

	const targetId = "#workspace-panel-" + this.value;
	const target = document.querySelector(targetId);

	if (target) {
		target.classList.remove("d-none");
		target.classList.add("d-block");
	}
}
function filterWorkspaceResource() {
	const textInputValue = document.getElementById("workspace-panel-searchbar-text").value;
	const activePanel = document.querySelector("#workspace-panel-body > .d-block");
	const activePanelItems = activePanel.querySelectorAll("li");

	const entriesFiltered = [...activePanelItems].filter((htmlElement) =>
		htmlElement
			.querySelector(".workspace-element-text")
			.textContent.toLowerCase()
			.includes(textInputValue.toLowerCase())
	);

	activePanelItems.forEach((elem) => {
		elem.classList.toggle("d-none", !entriesFiltered.includes(elem));
	});
}
Editor.setupWorkspace = () => {
	if (!Heriverse) return;

	const workTypeSelectorSection = document.getElementById("workspace-panel-type-selector");
	const workTypeBodySection = document.getElementById("workspace-panel-body");

	if (Heriverse.currEM && Heriverse.currEM.EMnodes) {
		let nodeTypes = [];
		Object.keys(Heriverse.currEM.EMnodes).forEach((nodeId) => {
			let element = Heriverse.currEM.EMnodes[nodeId];
			if (element.graph !== "shelf" && !nodeTypes.includes(element.type)) {
				nodeTypes.push(element.type);
			}
		});

		let bodyPanels =
			"<div id='workspace-panel-all' class='d-block' role='tabpanel' aria-labelledby='workspace-panel-option-all'>" +
			"<ul class='list-group'></ul>" +
			"</div>" +
			"<div id='workspace-panel-stratigraphic' class='d-none' role='tabpanel' aria-labelledby='workspace-panel-option-stratigraphic'>" +
			"<ul class='list-group'></ul>" +
			"</div>";
		let typeSelector =
			"<select id='workspace-panel-selector' class='form-select' aria-label='Tipo di nodo'>";

		typeSelector +=
			"<option id='workspace-panel-option-all' value='all' selected>Tutti i tipi</option>" +
			"<option id='workspace-panel-option-stratigraphic' value='stratigraphic'>Stratigraphic</option>";

		nodeTypes.forEach((nodeType) => {
			typeSelector +=
				"<option id='workspace-panel-option-" + nodeType + "' value='" + nodeType + "'>";
			typeSelector += nodeType
				.split("_")
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(" ");
			typeSelector += "</option>";

			bodyPanels +=
				"<div id='workspace-panel-" +
				nodeType +
				"' class='d-none' role='tabpanel' aria-labelledby='workspace-panel-option-" +
				nodeType +
				"'>" +
				"<ul class='list-group'></ul>" +
				"</div>";
		});

		typeSelector += "</select>";

		workTypeSelectorSection.innerHTML = typeSelector;
		workTypeBodySection.innerHTML = bodyPanels;

		$(document).on("change", "#workspace-panel-selector", selectWorkspacePanel);
		$(document).on("input", "#workspace-panel-searchbar-text", filterWorkspaceResource);
	}
};

function highlightSemNode() {
	let nodeName = this.closest("li.workspace-scene-node").dataset.bsName;
	if (Heriverse.ActualProxy && ATON.getSemanticNode(Heriverse.ActualProxy))
		ATON.getSemanticNode(Heriverse.ActualProxy).restoreDefaultMaterial();
	const semanticNode = ATON.getRootSemantics().children.find((elem) => elem.name === nodeName);
	if (semanticNode) {
		Heriverse.ActualProxy = nodeName;
		semanticNode.highlight();
	}
}
function highlightSceneNode() {
	let nodeName = this.closest("li.workspace-scene-node").dataset.bsName;
	if (Heriverse.ActualSceneNode && ATON.getSceneNode(Heriverse.ActualSceneNode))
		ATON.getSceneNode(Heriverse.ActualSceneNode).restoreDefaultMaterial();
	if (ATON.getSceneNode(nodeName)) {
		Heriverse.ActualSceneNode = nodeName;
		ATON.getSceneNode(nodeName).highlight();
	}
}
function goToSemShape() {
	let ssid = this.dataset.ssid;
	let ssidElem = document.querySelector("li[data-bs-elementid='" + ssid + "']");
	let listContainer = ssidElem.closest("div[role='tabpanel']");
	ssidElem.scrollIntoView(true);
}
function deleteNodeWorkspace(e) {
	e.stopPropagation();
	const nodeId = this.closest("li").dataset.bsElementid;
	const node = Heriverse.currEM.EMnodes[nodeId];

	if (confirm("Vuoi eliminare il nodo " + node.name + "?")) {
		for (let edgeType in Heriverse.currMG.json.graphs[node.graph].edges) {
			let i = 0;
			while (i < Heriverse.currMG.json.graphs[node.graph].edges[edgeType]) {
				const currEdge = Heriverse.currMG.json.graphs[node.graph].edges[edgeType][i];
				if (currEdge.from === nodeId || currEdge.to === nodeId)
					Heriverse.currMG.json.graphs[node.graph].edges[edgeType].splice(i, 1);
				else i++;
			}
		}

		if (HeriverseGraph.stratigraphicTypes.includes(node.type))
			delete Heriverse.currMG.json.graphs[node.graph].nodes["stratigraphic"][
				HeriverseNode.getTypeFromNodeType(node.type)
			][nodeId];
		else
			delete Heriverse.currMG.json.graphs[node.graph].nodes[
				HeriverseNode.getTypeFromNodeType(node.type)
			][nodeId];

		Heriverse.loadEM(null, false, true);
	}
}
function editNodeWorkspace(e) {
	e.stopPropagation();
	const nodeId = this.closest("li").dataset.bsElementid;
	const node = Heriverse.currEM.EMnodes[nodeId];
	Editor.setupEditCreateModal(node.type, node);

	const modal = document.getElementById("createEditNode");
	bootstrap.Modal.getOrCreateInstance(modal).show();
}
Editor.populateWorkspace = () => {
	if (!Heriverse) return;

	const workspacePanelAll = document.getElementById("workspace-panel-all").querySelector("ul");
	const workspacePanelStratigraphic = document
		.getElementById("workspace-panel-stratigraphic")
		.querySelector("ul");
	workspacePanelAll.innerHTML = "";
	workspacePanelStratigraphic.innerHTML = "";

	if (
		Heriverse.ResourceScene &&
		Heriverse.ResourceScene.resource_json &&
		Heriverse.ResourceScene.resource_json.multigraph &&
		Heriverse.ResourceScene.resource_json.multigraph.graphs
	) {
	}

	if (Heriverse.currEM && Heriverse.currEM.EMnodes) {
		let nodeTypes = {};
		Object.keys(Heriverse.currEM.EMnodes).forEach((nodeId) => {
			let element = Heriverse.currEM.EMnodes[nodeId];
			if (!nodeTypes[element.type]) {
				nodeTypes[element.type] = document
					.getElementById("workspace-panel-" + element.type)
					.querySelector("ul");
				nodeTypes[element.type].innerHTML = "";
			}
		});

		Object.keys(Heriverse.currEM.EMnodes).forEach((nodeId) => {
			let node = Heriverse.currEM.EMnodes[nodeId];

			let hasSemanticShape =
				node.neighbors && node.neighbors.semantic_shape
					? Object.values(node.neighbors.semantic_shape).length
					: false;
			let semanticShapeId =
				node.neighbors &&
				node.neighbors.semantic_shape &&
				Object.values(node.neighbors.semantic_shape).length
					? Object.entries(node.neighbors.semantic_shape)[0][0]
					: "";

			if (Heriverse.currentGraphs.includes(node.graph)) {
				let nodeListElem =
					"<li class='list-group-item bg-dark text-white d-flex flex-row align-items-center";

				if (node.type === "semantic_shape") {
					nodeListElem +=
						" workspace-sem-shape' data-bs-description='" +
						node.description +
						"' data-bs-name='" +
						node.name +
						"'";
				} else if (Heriverse.HeriverseGraph.stratigraphicTypes.includes(node.type)) {
					nodeListElem +=
						" workspace-scene-node' data-bs-description='" +
						node.description +
						"' data-bs-name='" +
						node.name +
						"'";
				}

				nodeListElem += "' data-bs-elementId='" + nodeId + "' data-bs-type='" + node.type + "'>";

				nodeListElem += "<div class='me-3'>";

				nodeListElem +=
					"<img src='../res/graphicons/" +
					node.type +
					".svg' alt='Icona " +
					node.type +
					"' title='" +
					node.name +
					"' class='workspace_entry_img'>";

				nodeListElem += "</div>";
				nodeListElem += "<div class='flex-grow-1 me-3'>";
				nodeListElem += "<div class='fw-bold text-break workspace-element-text'>" + node.name;

				if (hasSemanticShape) {
					nodeListElem +=
						"<button style='cursor: pointer' type='button' class='badge rounded-pill bg-light text-dark p-1 mx-3 fs-5 semantic-shape-badge' data-ssid='" +
						semanticShapeId +
						"'><i class='fa-solid fa-cubes'></i></button>";
				}

				nodeListElem += "</div>";
				nodeListElem += "</div>";

				if (Heriverse.MODE === Heriverse.MODETYPES.EDITOR) {
					nodeListElem +=
						"<button style='cursor: pointer' type='button' class='badge rounded-pill p-2 mx-2 fs-6 bg-danger text-light workspace-remove-button'><i class='fa-solid fa-trash'></i></button>";
					nodeListElem +=
						"<button style='cursor: pointer' type='button' class='badge rounded-pill p-2 mx-2 fs-6 bg-light text-dark workspace-edit-button'><i class='fa-solid fa-pen-to-square'></i></button>";
				}

				nodeListElem += "</li>";

				workspacePanelAll.innerHTML += nodeListElem;
				if (HeriverseGraph.stratigraphicTypes.includes(node.type))
					workspacePanelStratigraphic.innerHTML += nodeListElem;
				nodeTypes[node.type].innerHTML += nodeListElem;
			}
		});
		$(document)
			.off("click", ".workspace-scene-node", highlightSceneNode)
			.on("click", ".workspace-scene-node", highlightSceneNode);

		$(document)
			.off("click", ".semantic-shape-badge", highlightSemNode)
			.on("click", ".semantic-shape-badge", highlightSemNode);

		$(document)
			.off("click", ".workspace-remove-button", deleteNodeWorkspace)
			.on("click", ".workspace-remove-button", deleteNodeWorkspace);

		$(document)
			.off("click", ".workspace-edit-button", editNodeWorkspace)
			.on("click", ".workspace-edit-button", editNodeWorkspace);
	}
};

function isHeriNodeEqualAtonNode(heriNode, atonNode) {
	return (
		heriNode &&
		atonNode &&
		heriNode.data &&
		atonNode.userData &&
		heriNode.data.url &&
		atonNode.userData.urlContent &&
		heriNode.data.url === atonNode.userData.urlContent &&
		heriNode.data.url_type &&
		atonNode.userData.contType &&
		heriNode.data.url_type === atonNode.userData.contType &&
		heriNode.name &&
		atonNode.userData.contName &&
		heriNode.name === atonNode.userData.contName &&
		heriNode.data.description &&
		atonNode.userData.contDescription &&
		heriNode.data.description === atonNode.userData.contDescription
	);
}
function toggleShelfResManageButtons(enabled) {
	const buttonsContainer = document.getElementById("removeFromScene").closest("div");
	const buttons = buttonsContainer.querySelectorAll("button");

	buttonsContainer.style.opacity = enabled ? 1 : 0.5;

	buttons.forEach((btn) => {
		btn.disabled = !enabled;
	});
}
function toggleAddRemoveNodeFromGraph(isAdded) {
	const addFromSceneToGraphButton = document.getElementById("addFromSceneToGraph");

	addFromSceneToGraphButton.disabled = isAdded;
}
function addShelfResourceToGraph() {
	let default_authors = Heriverse.currMG.json.graphs[Heriverse.currGraphId].defaults.authors;
	let default_license = Heriverse.currMG.json.graphs[Heriverse.currGraphId].defaults.license;
	let default_embargo_until =
		Heriverse.currMG.json.graphs[Heriverse.currGraphId].defaults.embargo_until;

	if (addFromScene) {
		linkNode.setNodeInfo(
			null,
			HeriverseNode.NODE_TYPE.LINK,
			currSelectedNode.userData.contName,
			"",
			{
				url: currSelectedNode.userData.urlContent,
				url_type: currSelectedNode.userData.contType,
				description: currSelectedNode.userData.contDescription,
			},
			default_license,
			default_authors,
			default_embargo_until
		);
	} else {
		linkNode.setNodeInfo(
			null,
			HeriverseNode.NODE_TYPE.LINK,
			currShelfElement.getAttribute("data-name-content"),
			"",
			{
				url: currShelfElement.getAttribute("data-url-content"),
				url_type: currShelfElement.getAttribute("data-content-type"),
				description: currShelfElement.getAttribute("data-description-content"),
			},
			default_license,
			default_authors,
			default_embargo_until
		);
	}
	Heriverse.currMG.newNode(linkNode);

	Editor.shelf_objects_in_graph[linkNode.id] = { link: linkNode, samePathElementsIds: [] };

	const typeSelected = document.querySelector("#insertShelfResourceModalElementType").value;

	if (typeSelected === "document") {
		Editor.setupModalSteps(
			Heriverse.CONNECTION_RULES_NODETYPES.LINK,
			Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC,
			ShelfNode.CONTENT_TYPE.MODEL_3D
		);

		if (!pathToCreate) return;

		currentModal = document.getElementById("insertDocumentModal");

		if (
			workspaceElement &&
			!Heriverse.HeriverseGraph.stratigraphicTypes.includes(
				workspaceElement.getAttribute("data-bs-type")
			)
		)
			workspaceElement = null;

		if (workspaceElement) workspaceElementId = workspaceElement.getAttribute("data-bs-elementId");

		const modal = document.getElementById("insertDocumentModal");

		const rmdocNode = new HeriverseNode();
		if (addFromScene) {
			rmdocNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_DOC,
				currSelectedNode.userData.contName,
				currSelectedNode.userData.contDescription,
				{
					transform: {
						position: [
							currSelectedNode.position.x,
							currSelectedNode.position.y,
							currSelectedNode.position.z,
						],
						rotation: [
							currSelectedNode.rotation.x,
							currSelectedNode.rotation.y,
							currSelectedNode.rotation.z,
						],
						scale: [currSelectedNode.scale.x, currSelectedNode.scale.y, currSelectedNode.scale.z],
					},
				},
				default_license,
				default_authors,
				default_embargo_until
			);
		} else {
			rmdocNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_DOC,
				currShelfElement.getAttribute("data-name-content"),
				currShelfElement.getAttribute("data-description-content"),
				{
					transform: {
						position: ["0.0", "0.0", "0.0"],
						rotation: ["0.0", "0.0", "0.0"],
						scale: ["1.0", "1.0", "1.0"],
					},
				},
				default_license,
				default_authors,
				default_embargo_until
			);
		}

		Heriverse.currMG.newNode(rmdocNode);
		Editor.shelf_objects_in_graph[linkNode.id]["samePathElementsIds"].push(rmdocNode.id);

		const otherExtractors = document.querySelectorAll(
			"#insertDocumentModal .wizard-step[data-step='3'] > ul input[type='checkbox']:checked"
		);
		let extractorIds = [];
		if (otherExtractors.length > 0)
			otherExtractors.forEach((extractor) => {
				extractorIds.push(extractor.dataset.bsId);
			});
		const documentSelector = modal.querySelector(".wizard-step[data-step='1'] > select");
		const extractorSelector = modal.querySelector(".wizard-step[data-step='2'] > select");
		const combinerSelector = modal.querySelector(".wizard-step[data-step='4'] > select");
		const propertySelector = modal.querySelector(".wizard-step[data-step='5'] > select");
		const stratigraphicSelector = modal.querySelector(".wizard-step[data-step='6'] > select");

		const documentName =
			documentSelector.selectedIndex !== 0
				? documentSelector.options[documentSelector.selectedIndex].dataset.bsName
				: modal.querySelector("#documentName").value;
		const documentDescription =
			documentSelector.selectedIndex !== 0
				? documentSelector.options[documentSelector.selectedIndex].dataset.bsDescription
				: modal.querySelector("#documentDescription").value;
		const extractorName =
			extractorSelector.selectedIndex !== 0
				? extractorSelector.options[extractorSelector.selectedIndex].dataset.bsName
				: modal.querySelector("#extractorName").value;
		const extractorDescription =
			extractorSelector.selectedIndex !== 0
				? extractorSelector.options[extractorSelector.selectedIndex].dataset.bsDescription
				: modal.querySelector("#extractorDescription").value;
		const combinerName =
			extractorIds.length > 0 && combinerSelector.selectedIndex !== 0
				? combinerSelector.options[combinerSelector.selectedIndex].dataset.bsName
				: extractorIds.length > 0
				? modal.querySelector("#combinerName").value
				: "";
		const combinerDescription =
			extractorIds.length > 0 && combinerSelector.selectedIndex !== 0
				? combinerSelector.options[combinerSelector.selectedIndex].dataset.bsDescription
				: extractorIds.length > 0
				? modal.querySelector("#combinerDescription").value
				: "";
		const propertyName =
			propertySelector.selectedIndex !== 0
				? propertySelector.options[propertySelector.selectedIndex].dataset.bsName
				: modal.querySelector("#propertyName").value;
		const propertyDescription =
			propertySelector.selectedIndex !== 0
				? propertySelector.options[propertySelector.selectedIndex].dataset.bsDescription
				: modal.querySelector("#propertyDescription").value;
		const stratigraphicId =
			stratigraphicSelector.selectedIndex !== 0
				? stratigraphicSelector.options[stratigraphicSelector.selectedIndex].dataset.bsId
				: workspaceElementId;

		let documentNode, extractorNode, combinerNode, propertyNode, stratigraphicNode;

		if (documentSelector.selectedIndex !== 0) {
			documentNode =
				Heriverse.currEM.EMnodes[
					documentSelector.options[documentSelector.selectedIndex].dataset.bsId
				];
		} else {
			documentNode = new HeriverseNode();
			documentNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.DOCUMENT,
				documentName,
				documentDescription,
				{},
				default_license,
				default_authors,
				default_embargo_until
			);
			Heriverse.currMG.newNode(documentNode);
			Editor.shelf_objects_in_graph[linkNode.id]["samePathElementsIds"].push(documentNode.id);
		}

		if (extractorSelector.selectedIndex !== 0) {
			extractorNode =
				Heriverse.currEM.EMnodes[
					extractorSelector.options[extractorSelector.selectedIndex].dataset.bsId
				];
		} else {
			extractorNode = new HeriverseNode();
			extractorNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.EXTRACTOR,
				extractorName,
				extractorDescription,
				{},
				default_license,
				default_authors,
				default_embargo_until
			);
			Heriverse.currMG.newNode(extractorNode);
			Editor.shelf_objects_in_graph[linkNode.id]["samePathElementsIds"].push(extractorNode.id);
		}

		if (combinerSelector.selectedIndex !== 0) {
			combinerNode =
				Heriverse.currEM.EMnodes[
					combinerSelector.options[combinerSelector.selectedIndex].dataset.bsId
				];
		} else if (combinerName) {
			combinerNode = new HeriverseNode();
			combinerNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.COMBINER,
				combinerName,
				combinerDescription,
				{},
				default_license,
				default_authors,
				default_embargo_until
			);
			Heriverse.currMG.newNode(combinerNode);
			Editor.shelf_objects_in_graph[linkNode.id]["samePathElementsIds"].push(combinerNode.id);
		}

		if (propertySelector.selectedIndex !== 0) {
			propertyNode =
				Heriverse.currEM.EMnodes[
					propertySelector.options[propertySelector.selectedIndex].dataset.bsId
				];
		} else {
			propertyNode = new HeriverseNode();
			propertyNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.PROPERTY,
				propertyName,
				propertyDescription,
				{},
				default_license,
				default_authors,
				default_embargo_until
			);
			Heriverse.currMG.newNode(propertyNode);
			Editor.shelf_objects_in_graph[linkNode.id]["samePathElementsIds"].push(propertyNode.id);
		}

		if (stratigraphicId) {
			stratigraphicNode = Heriverse.currEM.EMnodes[stratigraphicId];
		}

		if (documentNode != undefined && extractorNode != undefined) {
			Heriverse.currMG.newEdge(
				null,
				extractorNode,
				documentNode,
				HeriverseNode.RELATIONS.EXTRACTED_FROM
			);
		}
		if (combinerNode != undefined && extractorNode != undefined) {
			Heriverse.currMG.newEdge(null, combinerNode, extractorNode, HeriverseNode.RELATIONS.COMBINES);

			if (extractorIds.length > 0) {
				extractorIds.forEach((extractorId) => {
					Heriverse.currMG.newEdgeFromIds(
						null,
						combinerNode.id,
						extractorId,
						HeriverseNode.RELATIONS.COMBINES
					);
				});
			}
		}
		if (combinerNode != undefined && propertyNode != undefined) {
			Heriverse.currMG.newEdge(
				null,
				propertyNode,
				combinerNode,
				HeriverseNode.RELATIONS.HAS_DATA_PROVENANCE
			);
		} else if (extractorNode != undefined && propertyNode != null) {
			Heriverse.currMG.newEdge(
				null,
				propertyNode,
				extractorNode,
				HeriverseNode.RELATIONS.HAS_DATA_PROVENANCE
			);
		}
		if (stratigraphicNode && propertyNode != undefined) {
			Heriverse.currMG.newEdge(
				null,
				stratigraphicNode,
				propertyNode,
				HeriverseNode.RELATIONS.HAS_PROPERTY
			);
		}

		Heriverse.currMG.newEdge(
			null,
			documentNode,
			rmdocNode,
			HeriverseNode.RELATIONS.HAS_REPRESENTATION_MODEL_DOC
		);
		Heriverse.currMG.newEdge(
			null,
			rmdocNode,
			linkNode,
			HeriverseNode.RELATIONS.HAS_LINKED_RESOURCE
		);
	} else if (typeSelected === "special_find") {
		currentModal = document.getElementById("insertSFModal");

		const rmsfNode = new HeriverseNode();
		if (addFromScene) {
			rmsfNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_SF,
				currSelectedNode.userData.contName,
				currSelectedNode.userData.contDescription,
				{
					transform: {
						position: [
							currSelectedNode.position.x,
							currSelectedNode.position.y,
							currSelectedNode.position.z,
						],
						rotation: [
							currSelectedNode.rotation.x,
							currSelectedNode.rotation.y,
							currSelectedNode.rotation.z,
						],
						scale: [currSelectedNode.scale.x, currSelectedNode.scale.y, currSelectedNode.scale.z],
					},
				},
				default_license,
				default_authors,
				default_embargo_until
			);
		} else {
			rmsfNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_SF,
				currShelfElement.getAttribute("data-name-content"),
				currShelfElement.getAttribute("data-description-content"),
				{
					transform: {
						position: ["0.0", "0.0", "0.0"],
						rotation: ["0.0", "0.0", "0.0"],
						scale: ["1.0", "1.0", "1.0"],
					},
				},
				default_license,
				default_authors,
				default_embargo_until
			);
		}

		Heriverse.currMG.newNode(rmsfNode);
		Editor.shelf_objects_in_graph[linkNode.id]["samePathElementsIds"].push(rmsfNode.id);

		const modal = document.getElementById("insertSFModal");

		if (
			workspaceElement &&
			!Heriverse.HeriverseGraph.stratigraphicTypes.includes(
				workspaceElement.getAttribute("data-bs-type")
			)
		)
			workspaceElement = null;

		if (workspaceElement) workspaceElementId = workspaceElement.getAttribute("data-bs-elementId");

		const firstEpochSelector = modal.querySelector(".wizard-step[data-step='1'] > select");
		const survivedEpochsList = modal.querySelectorAll(
			".wizard-step[data-step='2'] > ul input:checked"
		);
		const sfSelector = modal.querySelector(".wizard-step[data-step='3'] > select");

		let survivedEpochIds = [];
		if (survivedEpochsList.length > 0) {
			survivedEpochsList.forEach((survivedEpochElement) => {
				survivedEpochIds.push(survivedEpochElement.dataset.bsId);
			});
		}

		const firstEpochId = firstEpochSelector.options[firstEpochSelector.selectedIndex].dataset.bsId;
		const sfSelectedId =
			sfSelector !== 0
				? sfSelector.options[sfSelector.selectedIndex].dataset.bsId
				: workspaceElementId;

		const firstEpochNode = Heriverse.currEM.getNode(firstEpochId);
		const sfNode = Heriverse.currEM.getNode(sfSelectedId);

		if (firstEpochNode !== undefined && rmsfNode !== undefined) {
			Heriverse.currMG.newEdge(
				null,
				rmsfNode,
				firstEpochNode,
				HeriverseNode.RELATIONS.HAS_FIRST_EPOCH
			);
		}
		if (survivedEpochIds.length > 0) {
			survivedEpochIds.forEach((survivedEpochId) => {
				let epochNode = Heriverse.currMG.getNode(survivedEpochId);
				if (epochNode !== undefined && rmsfNode !== null) {
					Heriverse.currMG.newEdge(
						null,
						rmsfNode,
						epochNode,
						HeriverseNode.RELATIONS.SURVIVE_IN_EPOCH
					);
				}
			});
		}
		if (sfNode !== undefined && rmsfNode !== undefined) {
			Heriverse.currMG.newEdge(
				null,
				sfNode,
				rmsfNode,
				HeriverseNode.RELATIONS.HAS_REPRESENTATION_MODEL_SF
			);
		}
		Heriverse.currMG.newEdge(null, rmsfNode, linkNode, HeriverseNode.RELATIONS.HAS_LINKED_RESOURCE);
	} else if (typeSelected === "representation") {
		currentModal = document.getElementById("insertRMModal");

		const rmNode = new HeriverseNode();
		if (addFromScene) {
			rmNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL,
				currSelectedNode.userData.contName,
				currSelectedNode.userData.contDescription,
				{
					transform: {
						position: [
							currSelectedNode.position.x,
							currSelectedNode.position.y,
							currSelectedNode.position.z,
						],
						rotation: [
							currSelectedNode.rotation.x,
							currSelectedNode.rotation.y,
							currSelectedNode.rotation.z,
						],
						scale: [currSelectedNode.scale.x, currSelectedNode.scale.y, currSelectedNode.scale.z],
					},
				},
				default_license,
				default_authors,
				default_embargo_until
			);
		} else {
			rmNode.setNodeInfo(
				null,
				HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL,
				currShelfElement.getAttribute("data-name-content"),
				currShelfElement.getAttribute("data-description-content"),
				{
					transform: {
						position: ["0.0", "0.0", "0.0"],
						rotation: ["0.0", "0.0", "0.0"],
						scale: ["1.0", "1.0", "1.0"],
					},
				},
				default_license,
				default_authors,
				default_embargo_until
			);
		}

		Heriverse.currMG.newNode(rmNode);
		Editor.shelf_objects_in_graph[linkNode.id]["samePathElementsIds"].push(rmNode.id);

		const modal = document.querySelector("#insertRMModal");

		if (
			workspaceElement &&
			!Heriverse.HeriverseGraph.stratigraphicTypes.includes(
				workspaceElement.getAttribute("data-bs-type")
			)
		)
			workspaceElement = null;

		if (workspaceElement) workspaceElementId = workspaceElement.getAttribute("data-bs-elementId");

		const firstEpochSelector = modal.querySelector(".wizard-step[data-step='1'] > select");
		const survivedEpochsList = modal.querySelectorAll(
			".wizard-step[data-step='2'] > ul input:checked"
		);
		const suSelector = modal.querySelector(".wizard-step[data-step='3'] > select");

		let survivedEpochIds = [];
		if (survivedEpochsList.length > 0) {
			survivedEpochsList.forEach((survivedEpochElement) => {
				survivedEpochIds.push(survivedEpochElement.dataset.bsId);
			});
		}

		const firstEpochId = firstEpochSelector.options[firstEpochSelector.selectedIndex].dataset.bsId;
		const suSelectedId =
			suSelector !== 0
				? suSelector.options[suSelector.selectedIndex].dataset.bsId
				: workspaceElementId;

		const firstEpochNode = Heriverse.currEM.getNode(firstEpochId);
		const suNode = Heriverse.currEM.getNode(suSelectedId);

		if (firstEpochNode !== undefined && rmNode !== undefined) {
			Heriverse.currMG.newEdge(
				null,
				firstEpochNode,
				rmNode,
				HeriverseNode.RELATIONS.HAS_FIRST_EPOCH
			);
		}
		if (survivedEpochIds.length > 0) {
			survivedEpochIds.forEach((survivedEpochId) => {
				let epochNode = Heriverse.currMG.getNode(survivedEpochId);
				if (epochNode !== undefined && rmNode !== null) {
					Heriverse.currMG.newEdge(
						null,
						rmNode,
						epochNode,
						HeriverseNode.RELATIONS.SURVIVE_IN_EPOCH
					);
				}
			});
		}
		if (suNode !== undefined && rmNode !== undefined) {
			Heriverse.currMG.newEdge(
				null,
				suNode,
				rmNode,
				HeriverseNode.RELATIONS.HAS_REPRESENTATION_MODEL
			);
		}

		Heriverse.currMG.newEdge(null, rmNode, linkNode, HeriverseNode.RELATIONS.HAS_LINKED_RESOURCE);
	}

	Heriverse.Scene.multigraph = Heriverse.currMG.json;
	Heriverse.ResourceScene.resource_json.multigraph = Heriverse.currMG.json;

	if (addFromScene) {
		currSelectedNode.userData.addedToGraph = true;
		toggleAddRemoveNodeFromGraph(currSelectedNode.userData.addedToGraph);
	}

	completedSingleRMModal = true;

	const modalInstance = bootstrap.Modal.getInstance(currentModal);
	if (modalInstance._isShown) {
		modalInstance.hide();
	}

	Heriverse.loadEM("", false, true);
}
Editor.setupShelfResManageButtons = () => {
	let isEnabled = currShelfElement !== undefined && currShelfElement !== null;

	toggleShelfResManageButtons(isEnabled);

	document.getElementById("saveGraphState").addEventListener("click", () => {
		if (confirm("Vuoi salvare le modifiche sul grafo?")) {
			$("#idLoader").show();
			if (currSelectedNode) {
				Heriverse.gizmoControls.detach(currSelectedNode);
			}
			currSelectedNode = null;
			if (Editor.semanticShapeDrawingActive) ATON.fire("SemanticShapeDrawingMode", true);
			Editor.send(Heriverse.ResourceScene);
		}
	});
	document.getElementById("exportGraphState").addEventListener("click", () => {
		HeriverseImportExport.exportResourceJSON();
	});
	document.getElementById("exportSemanticShape").addEventListener("click", () => {
		Editor.setupExportSemShapeModal();
	});
	document.getElementById("removeFromScene").addEventListener("click", () => {
		if (currSelectedNode.userData.addedToGraph)
			alert(
				"Impossibile rimuovere l'elemento dalla scena poiché aggiunto al grafo. Rimuovere dal grafo prima di procedere con la rimozione dalla scena."
			);
		else if (confirm("Vuoi rimuovere l'elemento selezionato dalla scena?")) {
			currSelectedNode.userData.addedToScene = false;

			Heriverse.gizmoControls.detach(currShelfElement);

			let elemIndex = Editor.shelf_objects_in_scene.indexOf(currSelectedNode);
			Editor.shelf_objects_in_scene.splice(elemIndex, 1);
			currSelectedNode.parent.removeChild(currSelectedNode);

			const dataROFS = {
				event: HeriverseEvents.Events.REMOVE_OBJECT_FROM_SCENE,
				object: currSelectedNode,
			};
			ATON.fireEvent(HeriverseEvents.Events.PHOTON_EVENT, dataROFS);

			currSelectedNode = null;

			toggleShelfResManageButtons(false);
		}
	});
	document.getElementById("addFromSceneToGraph").addEventListener("click", () => {
		if (confirm("Vuoi aggiungere l'elemento al grafo?")) {
			addFromScene = true;
			$("#insertShelfResourceModal").modal("show");
		}
	});
};

const semShapeToExport = {};
const namePrefix = "Shape for ";
function selectAllShapes() {
	const modal = document.getElementById("semanticShapeDownloadModal");
	const checkboxes = modal.querySelectorAll(".semShapeCheckbox:not(.selectAllSemanticCheck)");

	checkboxes.forEach((checkbox) => {
		checkbox.checked = this.checked;
		const currSemShape = Heriverse.currEM.EMnodes[checkbox.dataset.id];
		if (this.checked) {
			semShapeToExport[currSemShape.id] = ATON.getSemanticNode(
				currSemShape.name.split(namePrefix)[1]
			);
		} else {
			delete semShapeToExport[currSemShape.id];
		}
	});
}
function selectSemShape() {
	const currSemShape = Heriverse.currEM.EMnodes[this.dataset.id];
	const modal = document.getElementById("semanticShapeDownloadModal");
	const selectAllCheckbox = modal.querySelector(".selectAllSemanticCheck");
	const checkboxes = modal.querySelectorAll(".semShapeCheckbox:not(.selectAllSemanticCheck)");

	if (semShapeToExport[currSemShape.id]) {
		delete semShapeToExport[currSemShape.id];
	} else
		semShapeToExport[currSemShape.id] = ATON.getSemanticNode(
			currSemShape.name.split(namePrefix)[1]
		);

	selectAllCheckbox.checked = checkboxes.length === Object.values(semShapeToExport).length;
}
function exportSemShapes() {
	const modal = document.getElementById("semanticShapeDownloadModal");
	const bsModal = bootstrap.Modal.getOrCreateInstance(modal);

	HeriverseImportExport.exportNodesAsZip(semShapeToExport);

	bsModal.hide();
}
Editor.setupExportSemShapeModal = () => {
	if (!Object.values(Heriverse.currEM.proxyNodes).length) {
		alert("Non sono presenti maschere semantiche.");
		return;
	}
	const modal = document.getElementById("semanticShapeDownloadModal");
	const bsModal = bootstrap.Modal.getOrCreateInstance(modal);
	const modalBody = modal.querySelector(".modal-body");

	let html = `<ul class="list-group">`;
	html += `<li class="list-group-item"><input class="selectAllSemanticCheck semShapeCheckbox" type="checkbox" /> Seleziona tutto </li>`;
	Object.values(Heriverse.currEM.proxyNodes).forEach((proxy) => {
		const semShape = proxy.shape;

		html += `<li class="list-group-item"><input class="semShapeCheckbox" type="checkbox" data-id="${semShape.id}" data-name="${semShape.name}"/> ${semShape.name}</li>`;
	});
	html += "</ul>";

	modalBody.innerHTML = html;

	$(document)
		.off("change", ".selectAllSemanticCheck", selectAllShapes)
		.on("change", ".selectAllSemanticCheck", selectAllShapes);
	$(document)
		.off("change", ".semShapeCheckbox:not(.selectAllSemanticCheck)", selectSemShape)
		.on("change", ".semShapeCheckbox:not(.selectAllSemanticCheck)", selectSemShape);

	$(document)
		.off("click", "#exportSSBtn", exportSemShapes)
		.on("click", "#exportSSBtn", exportSemShapes);

	bsModal.show();
};

Editor.addDocumentToShelf = (id, name, description, url, file) => {
	let data = {};
	if (file.length > 0) {
		let uploaded_url = Editor.uploadResource(file, "document");

		data.url = uploaded_url;
	} else {
		data.url = url;
	}

	data.url_type = "document";
	data.description = description;

	if (!Heriverse.shelf)
		Heriverse.shelf = new Heriverse.ShelfGraph("", Heriverse.currEM.mdgraph.json);
	Heriverse.shelf.addShelfNode(id, name, "", data);
};

Editor.addImageToShelf = (id, name, description, url, file) => {
	let data = {};
	if (file.length > 0) {
		let uploaded_url = Editor.uploadResource(file, "image");

		data.url = uploaded_url;
	} else {
		data.url = url;
	}

	data.url_type = "image";
	data.description = description;

	Heriverse.shelf.addShelfNode(id, name, "", data);
};

Editor.addRepresentationModel = (id, name, description, url, file, shelf = false) => {
	let data = {};
	if (file.length > 0) {
		let uploaded_url = Editor.uploadResource(file, "3d_model");

		data.url = uploaded_url;
	} else {
		data.url = url;
	}

	if (shelf) {
		data.url_type = "3d_model";
		data.description = description;
	}
	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL,
		name,
		description,
		data,
		shelf ? "shelf" : Heriverse.currGraphId,
		shelf
	);
};

Editor.addEpoch = (id, name, description, start_time, end_time, color, min_y, max_y) => {
	let data = {};
	data.start_time = start_time;
	data.end_time = end_time;
	data.color = color;
	data.min_y = min_y;
	data.max_y = max_y;

	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.EPOCH,
		name,
		description,
		data,
		Heriverse.currGraphId,
		false
	);
};

Editor.addAuthor = (id, name, description, orcid, author_name, author_surname) => {
	let data = {};
	data.orcid = orcid;
	data.name = author_name;
	data.surname = author_surname;
	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.AUTHOR,
		name,
		description,
		data,
		Heriverse.currGraphId,
		false
	);
};

Editor.addStratigraphic = (id, type, name, description) => {
	let data = {};
	let node = new HeriverseNode();
	node.setNodeInfo(id, type, name, description, data);
	Heriverse.currMG.newStratigraphicNode(node);
	Heriverse.Scene.multigraph = Heriverse.currMG.json;
	Heriverse.ResourceScene.resource_json.multigraph = Heriverse.currMG.json;

	Heriverse.setScene();
};

Editor.addGroup = (id, name, description) => {
	let data = {};
	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.GROUP,
		name,
		description,
		data,
		Heriverse.currGraphId,
		false
	);
};

Editor.addProperty = (id, name, description) => {
	let data = {};
	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.PROPERTY,
		name,
		description,
		data,
		Heriverse.currGraphId,
		false
	);
};

Editor.addDocument = (id, name, description) => {
	let data = {};
	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.DOCUMENT,
		name,
		description,
		data,
		Heriverse.currGraphId,
		false
	);
};

Editor.addExtractor = (id, name, description) => {
	let data = {};
	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.EXTRACTOR,
		name,
		description,
		data,
		Heriverse.currGraphId,
		false
	);
};

Editor.addCombiner = (id, name, description) => {
	let data = {};
	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.COMBINER,
		name,
		description,
		data,
		Heriverse.currGraphId,
		false
	);
};

Editor.addLink = (id, name, description, url, file, url_type, data_description) => {
	let data = {};
	(data.url = url), (data.url_type = url_type);
	data.description = data_description;
	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.LINK,
		name,
		description,
		data,
		Heriverse.currGraphId,
		false
	);
};

Editor.addSemantiShape = (
	id,
	name,
	description,
	url,
	file = null,
	convexshapes = [],
	spheres = []
) => {
	let data = {};
	data.url = url;
	data.convexshapes = convexshapes;
	data.spheres = spheres;

	Editor.addNode(
		id,
		HeriverseNode.NODE_TYPE.SEMANTIC_SHAPE,
		name,
		description,
		data,
		Heriverse.currGraphId,
		false
	);
};

Editor.addNode = (id, type, name, description, data, graph = "shelf", shelf = false) => {
	let node;
	if (shelf) {
		Heriverse.shelf.addShelfNode(id, type, name, data);
		Heriverse.Scene.multigraph.graphs[graph] = Heriverse.shelf.json.graphs[graph];
		Heriverse.ResourceScene.resource_json.multigraph.graphs[graph] =
			Heriverse.shelf.json.graphs[graph];
	} else {
		let default_authors = Heriverse.currMG.json.graphs[graph].defaults
			? Heriverse.currMG.json.graphs[graph].defaults.authors
			: [];
		let default_license = Heriverse.currMG.json.graphs[graph].defaults
			? Heriverse.currMG.json.graphs[graph].defaults.license
			: "";
		let default_embargo_until = Heriverse.currMG.json.graphs[graph].defaults
			? Heriverse.currMG.json.graphs[graph].defaults.embargo_until
			: "";
		node = new HeriverseNode();
		node.setNodeInfo(
			id,
			type,
			name,
			description,
			data,
			default_license,
			default_authors,
			default_embargo_until,
			graph
		);
		Heriverse.currMG.newNode(node);
		Heriverse.Scene.multigraph = Heriverse.currMG.json;
		Heriverse.ResourceScene.resource_json.multigraph = Heriverse.currMG.json;
	}
	// Heriverse.loadEM(null, false, true);
	Heriverse.refresh(Heriverse.ResourceScene);
};

Editor.addNodeToEpoch = () => {
	let s = Heriverse.Scene;
	let url = "";
	let files = document.getElementById("new-object-file").files;
	if (files != null) {
		url = Editor.uploadResource(files);
	} else {
		url = [document.getElementById("new-object-url").value];
	}
	if (!s.scenegraph.nodes) {
		s.scenegraph.nodes = {};
	}
	if (!s.scenegraph.nodes[Editor.epoch]) {
		s.scenegraph.nodes[Editor.epoch] = {};
	}
	if (!s.scenegraph.nodes[Editor.epoch].urls) {
		s.scenegraph.nodes[Editor.epoch].urls = [];
	}
	let gltfFiles = url.filter((file) => file.endsWith(".gltf") || file.endsWith(".glb"));
	if (gltfFiles.length > 0) {
		for (let i = 0; i < gltfFiles.length; i++) {
			s.scenegraph.nodes[Editor.epoch].urls.push(gltfFiles[i]);
		}
	}

	Editor.send(s, false, files);
};

Editor.addNodeOld = () => {
	let id = document.getElementById("new-node-id").value;
	let name = document.getElementById("new-node-name").value;
	let type = document.getElementById("nodetypes").value;
	let url = document.getElementById("new-node-url").value;
	let author = document.getElementById("new-node-author").value;
	let url_type = document.getElementById("urltypes").value;
	let description = document.getElementById("new-node-description").value;
	let start = document.getElementById("new-node-start-from").value;
	let end = document.getElementById("new-node-start-to").value;

	let files = document.getElementById("new-node-file").files;

	if (files != null) {
		let urls = Editor.uploadResource(files);

		let gltfFiles = urls.filter((file) => file.endsWith(".gltf") || file.endsWith(".glb"));

		if (gltfFiles != null && gltfFiles.length == 1) {
			url = gltfFiles[0];
		}
	}

	Heriverse.addNode(id, type, name, description, author, url, url_type, start, end);
	Editor.sendKG(Heriverse.currEM._jsonGraph);
};

Editor.addEdge = () => {
	let from_id = document.getElementById("new-edge-from").value;
	let to_id = document.getElementById("new-edge-to").value;
	let type = document.getElementById("edgetypes").value;
	let id = from_id + "::" + to_id;
	let to = Heriverse.currMG.getNode(to_id);
	let from = Heriverse.currMG.getNode(from_id);
	Heriverse.currMG.newEdge(id, from, to, type);
	Heriverse.Scene.multigraph = Heriverse.currMG.json;
	Heriverse.ResourceScene.resource_json.multigraph = Heriverse.currMG.json;
	Editor.send(Heriverse.ResourceScene);
};

Editor.applyFreeSemShape = () => {
	Editor.setupEditCreateModal(Heriverse.CONNECTION_RULES_NODETYPES.SEMANTIC_SHAPE);

	const modal = document.getElementById("createEditNode");
	bootstrap.Modal.getOrCreateInstance(modal).show();
};

Editor.setupEventHandlers = () => {
	ATON.on("goToPeriodPerformed", (e) => {
		Editor.epoch = Heriverse.currPeriodName;
	});
	ATON.on("SemanticShapeDrawingMode", (b) => {
		const startDrawButton = document.getElementById("startSemanticShapeDrawing");
		const finalizeDrawButton = document.getElementById("finalizeSemanticShapeDrawing");

		if (!b) {
			Editor.applyFreeSemShape();
		} else {
			if (Editor.semanticShapeDrawingActive) {
				Editor.semanticShapeDrawingActive = !b;
				ATON.SemFactory.stopCurrentConvex();
				startDrawButton.classList.remove("active");
			} else {
				Editor.semanticShapeDrawingActive = b;
				finalizeDrawButton.disabled = !Editor.semanticShapeDrawingActive;
				startDrawButton.classList.add("active");
			}
			finalizeDrawButton.disabled = !Editor.semanticShapeDrawingActive;
		}
	});
	ATON.on("EMLoaded", (e) => {});
	ATON.on("Tap", (e) => {
		if (Editor.semanticShapeDrawingActive && Heriverse.MODE === Heriverse.MODETYPES.EDITOR) {
			const buttonFinalizeShapeBox = document
				.getElementById("finalizeSemanticShapeDrawing")
				.getBoundingClientRect();

			let clicked_object = ATON._rcScene.intersectObjects(ATON._rootVisible.children, true)[0];

			const isInFinalizeButton =
				Heriverse.mousePosition.x >= buttonFinalizeShapeBox.left &&
				Heriverse.mousePosition.x <= buttonFinalizeShapeBox.right &&
				Heriverse.mousePosition.y >= buttonFinalizeShapeBox.top &&
				Heriverse.mousePosition.y <= buttonFinalizeShapeBox.bottom;

			if (!isInFinalizeButton) {
				let clicked_point = clicked_object.point;
				// ATON.SemFactory.addSurfaceConvexPoint(0.01);
				ATON.SemFactory.addConvexPoint(clicked_point);
			}
		}
	});
};

Editor.delete3DObject = (id) => {
	if (confirm("Sei sicuro di voler eliminare questo elemento?")) {
		let s = Heriverse.Scene;
		if (!s.scenegraph.nodes) {
			s.scenegraph.nodes = {};
		}
		if (!s.scenegraph.nodes[Editor.epoch]) {
			s.scenegraph.nodes[Editor.epoch] = {};
		}
		if (!s.scenegraph.nodes[Editor.epoch].urls) {
			s.scenegraph.nodes[Editor.epoch].urls = [];
		}
		if (s.scenegraph.nodes[Editor.epoch].urls[id]) {
			s.scenegraph.nodes[Editor.epoch].urls.splice(id, 1);
		}
		Editor.send(s);
	}
};

Editor.sendKG = (KG) => {
	let graph = {
		sid: Heriverse.paramSID,
		kgraph: { kgraph: KG },
	};
	$.ajax({
		type: "POST",
		url: "http://localhost:3000/saveKGraph",
		data: JSON.stringify(graph),
		contentType: "application/json",
		success: function (response) {
			Heriverse.refresh();
		},
	});
};

Editor.sendOld = (E) => {
	let data = {
		sid: Heriverse.paramSID,
		scene: { scene: E },
	};
	$.ajax({
		type: "POST",
		url: "http://localhost:3000/saveScene",
		data: JSON.stringify(data),
		contentType: "application/json",
		success: function (response) {
			Heriverse.refresh(E);
		},
	});
};

Editor.send = (E, shelf_update = false, attempt = false) => {
	if (E.creator && E.creator._id) {
		E.creator = E.creator._id;
	}
	if (Array.isArray(E.viewers)) {
		E.viewers = E.viewers.map((viewer) =>
			typeof viewer === "object" && viewer !== null && "_id" in viewer ? viewer._id : viewer
		);
	}
	if (Array.isArray(E.editors)) {
		E.editors = E.editors.map((editor) =>
			typeof editor === "object" && editor !== null && "_id" in editor ? editor._id : editor
		);
	}
	let data = {
		sid: Heriverse.paramSID,
		scene: { scene: Heriverse.ResourceScene },
	};

	$.ajax({
		type: "PUT",
		url: Utils.baseHost + "heriverse/scene",
		data: JSON.stringify(E),
		contentType: "application/json",
		headers: { token: sessionStorage.getItem("access_token") },
		success: function (response) {
			if (shelf_update) Heriverse.refresh(response, shelf_update);
			else Heriverse.refresh(response);
		},
		error: function (error) {
			if (error.status == 401 && !attempt) {
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
							Editor.send(E, false, true);
						} else {
							location.href = "/a/heriverse/login";
						}
					});
				}
			}
		},
	});
};

Editor.uploadResource = (files, contentType = "") => {
	let ret = "";
	let formData = new FormData();
	for (let i = 0; i < files.length; i++) {
		formData.append("files", files[i]);
	}

	$.ajax({
		type: "POST",
		url: Utils.baseHost + "heriverse/upload",
		headers: { authServer: "DIGILAB" },
		data: formData,
		processData: false,
		contentType: false,
		async: false,
		success: function (response) {
			let files_array = response.files;
			if (contentType === "3d_model") {
				ret = files_array.find((value) => /\.(?:gltf|glb|obj|ply|fbx|3ds|e57)$/i.test(value));
			} else if (contentType === "image") {
				ret = files_array.find((value) => /\.(?:jpg|jpeg|png)$/i.test(value));
			} else if (contentType === "document") {
				ret = files_array.find((value) => /\.(?:pdf|txt|docx|tiff|xlsx)$/i.test(value));
			} else {
				ret = files_array;
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.error("Errore nella richiesta:", textStatus, errorThrown);
			reject(new Error("Errore nel caricamento della risorsa"));
		},
	});
	return ret;
};

function compileFieldsToEdit(node, containerId) {
	const modal = document.getElementById(containerId);
	const modalBody = modal.querySelector(".modal-body");
	const inputForms = modalBody.querySelectorAll("input, textarea, select, div[id$='Info']");

	[...inputForms].forEach((inputElem) => {
		if (inputElem.id.includes("Name")) inputElem.value = node.name;
		else if (inputElem.id.includes("Description"))
			inputElem.value = node.description || node.data.description;
		else if (inputElem.id.includes("TypeSelect"))
			inputElem.selectedIndex = [...inputElem.options].findIndex(
				(elem) =>
					(node.type === HeriverseNode.NODE_TYPE.LINK && elem.textContent === node.data.url_type) ||
					elem.textContent === node.type
			);
		else if (inputElem.id.includes("StartTime")) inputElem.value = node.data.start_time;
		else if (inputElem.id.includes("EndTime")) inputElem.value = node.data.end_time;
		else if (inputElem.id.includes("Color")) inputElem.value = node.data.color;
		else if (inputElem.id.includes("MinY")) inputElem.value = node.data.min_y;
		else if (inputElem.id.includes("MaxY")) inputElem.value = node.data.max_y;
		else if (inputElem.id.includes("FileText")) inputElem.value = node.data.url;
		else if (inputElem.id.includes("Info")) {
			const liElements = inputElem.querySelectorAll("ul li");
			const elementToSelect = [...liElements].find((liElement) =>
				node.name.includes(liElement.textContent.trim())
			);

			if (elementToSelect) UI.selectPropertyType(elementToSelect);
			const nameSpan = document.createElement("span");
			nameSpan.classList.add(
				"w-100",
				"fs-6",
				"text-center",
				"my-2",
				"d-flex",
				"justify-content-center"
			);
			nameSpan.innerHTML = "Name: " + node.name;
			const descriptionSpan = document.createElement("span");
			descriptionSpan.classList.add(
				"w-100",
				"fs-6",
				"text-center",
				"my-2",
				"d-flex",
				"justify-content-center"
			);
			descriptionSpan.innerHTML = "Description: " + node.description;
			modalBody.prepend(descriptionSpan);
			modalBody.prepend(nameSpan);
		} else if (inputElem.id.includes("Checklist")) {
		}
	});
}
function saveNodeInformation() {
	$("#idLoader").show();

	const modal = this.closest(".modal");
	const modalBody = modal.querySelector(".modal-body");
	const nodeId = modalBody.dataset.nodeid;
	const nodeType = Heriverse.getNodeTypeByCRNodeType(modalBody.dataset.type);
	const node = nodeId ? Heriverse.currEM.EMnodes[nodeId] : null;

	console.log("NODE TYPE", nodeType);

	let newName = "",
		newDescription = node ? node.description : "",
		newData = {},
		newType = "",
		newLicense = node ? node.license : "",
		newAuthors = node ? node.authors : "",
		newEmbargo = node ? node.embargo_until : "",
		newGraph = node ? node.graph : Heriverse.currGraphId;

	const inputForms = modal
		.querySelector(".modal-body")
		.querySelectorAll("input, textarea, select, div[id$='Info']");

	[...inputForms].forEach((inputForm) => {
		if (inputForm.id.includes("Name")) newName = inputForm.value;
		else if (inputForm.id.includes("Description")) {
			if (
				(node && node.type === HeriverseNode.NODE_TYPE.LINK) ||
				nodeType === HeriverseNode.NODE_TYPE.LINK
			)
				newData["description"] = inputForm.value;
			else newDescription = inputForm.value;
		} else if (inputForm.id.includes("TypeSelect")) newType = inputForm.value;
		else if (inputForm.id.includes("Relate")) {
			if (
				(node && node.type === HeriverseNode.NODE_TYPE.SEMANTIC_SHAPE) ||
				nodeType === HeriverseNode.NODE_TYPE.SEMANTIC_SHAPE
			) {
				const stratOptionSelected = inputForm.options[inputForm.selectedIndex];
				const stratigraphicNode = Heriverse.currEM.EMnodes[stratOptionSelected.dataset.id];

				ATON.SemFactory.completeConvexShape(stratigraphicNode.name);

				newName = namePrefix + stratigraphicNode.name;
				newData = {
					url: "",
					convexshape: ATON.getSemanticNode(stratigraphicNode.name).children[0],
					// convexshapes: ATON.SemFactory.convexPoints,
					speres: [],
				};
				newLicense = stratigraphicNode.license;
				newAuthors = stratigraphicNode.authors;
				newEmbargo = stratigraphicNode.embargo_until;
				newGraph = stratigraphicNode.graph;

				ATON.SemFactory.stopCurrentConvex();
				Editor.semanticShapeDrawingActive = false;
				document.getElementById("finalizeSemanticShapeDrawing").disabled =
					!Editor.semanticShapeDrawingActive;
				if (document.getElementById("startSemanticShapeDrawing").classList.contains("active"))
					document.getElementById("startSemanticShapeDrawing").classList.remove("active");
			}
		} else if (inputForm.id.includes("Color")) {
			newData["color"] = inputForm.value;
		} else if (inputForm.id.includes("StartTime")) {
			newData["start_time"] = inputForm.value;
		} else if (inputForm.id.includes("EndTime")) {
			newData["end_time"] = inputForm.value;
		} else if (inputForm.id.includes("MinY")) {
			newData["min_y"] = inputForm.value;
		} else if (inputForm.id.includes("MaxY")) {
			newData["max_y"] = inputForm.value;
		} else if (inputForm.id.includes("Info")) {
			newName = inputForm.querySelector("#propType-dropdownMenu").textContent;

			const descComponents = inputForm.querySelectorAll(
				"#propInput-section input, #propInput-section select, #propInput-section label"
			);
			[...descComponents].forEach((singleElem) => {
				switch (singleElem.tagName) {
					case "LABEL":
						newDescription += singleElem.textContent + " ";
						break;
					case "INPUT":
						newDescription += singleElem.value + " ";
						break;
					case "SELECT":
						newDescription += singleElem.options[singleElem.selectedIndex].value + " ";
						break;
				}
			});
		}
	});

	if (newData["start_time"] && newData["end_time"] && newData["start_time"] > newData["end_time"]) {
		alert("L'inizio dell'epoca è successivo alla fine. Inserisci informazioni consistenti.");
		return;
	}
	const updatedNode = new HeriverseNode();
	updatedNode.setNodeInfo(
		node ? node.id : null,
		newType || nodeType || node.type,
		newName || node.name,
		newDescription,
		Object.values(newData).length ? newData : node && node.data ? node.data : {},
		newLicense,
		newAuthors,
		newEmbargo,
		newGraph
	);

	console.log("UPDATED NODE", updatedNode);

	Heriverse.currMG.newNode(updatedNode);

	if (modalBody.dataset.newNode) {
		if (nodeType === HeriverseNode.NODE_TYPE.SEMANTIC_SHAPE) {
			const stratOptionSelected = inputForms[1].options[inputForms[1].selectedIndex];
			const stratigraphicNode = Heriverse.currEM.EMnodes[stratOptionSelected.dataset.id];

			Heriverse.currMG.newEdgeFromIds(
				null,
				stratigraphicNode.id,
				updatedNode.id,
				HeriverseNode.RELATIONS.HAS_SEMANTIC_SHAPE
			);
		}
	}

	Heriverse.Scene.multigraph = Heriverse.currMG.json;
	Heriverse.ResourceScene.resource_json.multigraph = Heriverse.currMG.json;
	console.log("HERIVERSE CURRMG JSON", Heriverse.currMG.json);

	// Heriverse.loadEM(null, false, true, Heriverse.currMG.json);
	Heriverse.setScene();

	bootstrap.Modal.getOrCreateInstance(document.getElementById(modal.id)).hide();
}
Editor.setupEditCreateModal = (nodeType, node = null, containerId = "createEditNode") => {
	const modal = document.getElementById(containerId);
	const modalBody = modal.querySelector(".modal-body");
	const modalTitle = modal.querySelector(".modal-title");
	let connectionRuleType, modalByType;
	if (HeriverseGraph.stratigraphicTypes.includes(nodeType)) {
		connectionRuleType = Heriverse.getCRNodeTypeByNodeType(HeriverseNode.NODE_TYPE.STRATIGRAPHIC);
	} else connectionRuleType = Heriverse.getCRNodeTypeByNodeType(nodeType);

	modalByType = Editor.modal_steps.find((step) => step.node_type === connectionRuleType);

	modalTitle.textContent = modalByType.title;
	modalTitle.dataset.i18n = modalByType.i18n_label;

	if (node) modalBody.dataset.nodeid = node.id;
	else modalBody.dataset.newNode = true;
	modalBody.dataset.type = nodeType;

	let bodyContent = "";
	modalByType.fields.forEach((field) => {
		if (
			(field.id.includes("Select") && !field.id.includes("TypeSelect")) ||
			field.id.includes("Checklist")
		)
			return;
		bodyContent += generateFieldHTML(field);
	});
	modalBody.innerHTML = bodyContent;

	if (node) compileFieldsToEdit(node, containerId);

	$("#" + containerId + " #doneButton")
		.off("click", saveNodeInformation)
		.on("click", saveNodeInformation);
};

let currentStep,
	setupSteps = [];
let currentSubPathCount = 0,
	lastSubPathCount = 0;
let combinerSwitchActive = false;
let actualStartType, actualEndType, pathToCreate, currentLinkId;
const wizardModal = document.getElementById("dynamicModalPathCreation");
const wizardTitle = wizardModal.querySelector("#wizardTitle");
const wizardGraph = wizardModal.querySelector("#wizardGraph");
const connector =
	'<div class="d-flex align-items-center step-line mb-2"><img src="' +
	(window.location.href.includes("heriverse-wapp")
		? "/a/heriverse-wapp/assets/progress_bar/"
		: "/a/heriverse/assets/progress_bar/") +
	"arrow down.svg" +
	'"></div>';
const wizardContent = wizardModal.querySelector("#wizardContent");
const pageSubPath = wizardModal.querySelector(".modal-footer > div");
const backBtn = wizardModal.querySelector("#prevBtn");
const nextBtn = wizardModal.querySelector("#nextBtn");
function getRandomColor() {
	let letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function buildProgressBar() {
	wizardGraph.innerHTML = "";

	let combinerIndex = -1;

	pathToCreate.path.forEach((pathComponentType, index) => {
		const graphNodeType = Heriverse.getNodeTypeByCRNodeType(pathComponentType);

		let graphNode = `<div class="step-circle step-empty ${
			index === pathToCreate.path.length - 1 ? "selected-step" : ""
		} mb-2" data-step=${pathToCreate.path.length - 1 - index} ${
			combinerIndex !== -1 ? 'data-sp="0"' : ""
		}>`;
		if (graphNodeType === HeriverseNode.NODE_TYPE.STRATIGRAPHIC) {
			graphNode += "SU";
		} else if (graphNodeType === HeriverseNode.STRATIGRAPHIC_TYPE.SF) {
			graphNode += "SF";
		} else {
			graphNode += `<img src="${
				(window.location.href.includes("heriverse-wapp")
					? "/a/heriverse-wapp/res/graphicons/"
					: "/a/heriverse/res/graphicons/") +
				graphNodeType +
				".svg"
			}" alt="${pathComponentType}">`;
		}
		graphNode += "</div>";

		if (combinerSwitchActive && combinerIndex !== -1 && index > combinerIndex) {
			document.querySelector("#combinerSubPaths .combinerSubPath").innerHTML += graphNode;
			if (index < pathToCreate.path.length - 1)
				document.querySelector("#combinerSubPaths .combinerSubPath").innerHTML += connector;
		} else {
			wizardGraph.innerHTML += graphNode;
			if (index < pathToCreate.path.length - 1) wizardGraph.innerHTML += connector;
		}

		if (graphNodeType === HeriverseNode.NODE_TYPE.COMBINER) {
			combinerIndex = index;
			wizardGraph.innerHTML += `<div id="combinerSubPaths"><div class="combinerSubPath active flex-column align-items-center justify-content-center" data-sp="0">`;
		}
	});

	document.querySelectorAll("#dynamicModalPathCreation .step-circle > img").forEach((img) => {
		function tag() {
			if (img.naturalWidth && img.naturalHeight) {
				img.classList.toggle("orizontalIcon", img.naturalWidth > img.naturalHeight);
				img.classList.toggle("verticalIcon", img.naturalHeight >= img.naturalWidth);
			}
		}

		if (img.complete) tag();
		else img.addEventListener("load", tag, { once: true });
	});
}

function buildSteps() {
	wizardContent.innerHTML = "";
	const totalStepsCount = pathToCreate.path.length;

	document
		.querySelector("#dynamicModalPathCreation #combinerToggle")
		.classList.toggle(
			"d-none",
			!pathToCreate.path.includes(Heriverse.CONNECTION_RULES_NODETYPES.EXTRACTOR)
		);
	document
		.querySelector("#dynamicModalPathCreation div.modal-footer > div")
		.classList.toggle("d-none", !combinerSwitchActive);

	setupSteps = [];
	for (let i = totalStepsCount - 1; i >= 0; i--) {
		setupSteps.push(
			Editor.modal_steps.find((single_step) => single_step.node_type === pathToCreate.path[i])
		);
	}

	let combinerIndex = -1;

	setupSteps.forEach((step, index) => {
		if (step.node_type === Heriverse.CONNECTION_RULES_NODETYPES.COMBINER) {
			combinerIndex = index;
		}

		const singleStep = document.createElement("div");
		singleStep.className = index === 0 ? "wizard-step active" : "wizard-step";
		singleStep.dataset.step = index;
		if (combinerSwitchActive && combinerIndex === -1) singleStep.dataset.subPath = lastSubPathCount;
		singleStep.dataset.type = step.node_type;
		let stepContent = "";
		step.fields.forEach((field) => {
			stepContent += generateFieldHTML(field);
		});
		if (step.node_type === Heriverse.CONNECTION_RULES_NODETYPES.COMBINER)
			stepContent += `<button id="extractorAdder" type="button" class="btn btn-info position-absolute" style="bottom: 5%; left:15%;">Aggiungi un estrattore</button>`;
		singleStep.innerHTML = stepContent;
		wizardContent.innerHTML += singleStep.outerHTML;
	});

	setupWizardEventListeners();
}

function combinerSwitch() {
	const switchInput = document.querySelector("#dynamicModalPathCreation #combinerOption");
	if (switchInput.checked) {
		combinerSwitchActive = true;
		let path1 = Heriverse.findShortestValidPath(
			actualStartType,
			Heriverse.CONNECTION_RULES_NODETYPES.COMBINER
		);
		let path2 = Heriverse.findShortestValidPath(
			Heriverse.CONNECTION_RULES_NODETYPES.COMBINER,
			actualEndType
		);
		pathToCreate = {
			connections: [...path1.connections, ...path2.connections],
			path: [...path1.path, ...path2.path.splice(1)],
		};
		buildSteps();
		buildProgressBar();
		updateButtons();
		setupPredefinedSteps();
	} else {
		lastSubPathCount = 0;
		currentSubPathCount = 0;
		combinerSwitchActive = false;
		pathToCreate = Heriverse.findShortestValidPath(actualStartType, actualEndType);
		buildSteps();
		buildProgressBar();
		updateButtons();
		setupPredefinedSteps();
	}
}
function prevBtnAction() {
	if (currentStep > 0) {
		$("#dynamicModalPathCreation .step-circle[data-step].selected-step").removeClass(
			"selected-step"
		);
		currentStep--;
		if (
			combinerSwitchActive &&
			$("#dynamicModalPathCreation .step-circle[data-step='" + currentStep + "'][data-sp]").length >
				0
		)
			renderStep(currentStep, currentSubPathCount);
		else renderStep(currentStep);
	}
}
function prevBtnPathAction() {
	if (currentSubPathCount > 0) {
		currentSubPathCount--;

		$("#dynamicModalPathCreation #combinerSubPaths .combinerSubPath.active").removeClass("active");
		$(
			"#dynamicModalPathCreation #combinerSubPaths .combinerSubPath[data-sp='" +
				currentSubPathCount +
				"']"
		).addClass("active");
		renderStep(currentStep, currentSubPathCount);
		updateButtons();
	}
}
function nextBtnAction() {
	if (currentStep < pathToCreate.path.length - 1) {
		$("#dynamicModalPathCreation .step-circle[data-step].selected-step").removeClass(
			"selected-step"
		);
		currentStep++;
		if (
			combinerSwitchActive &&
			$("#dynamicModalPathCreation .step-circle[data-step='" + currentStep + "'][data-sp]").length >
				0
		)
			renderStep(currentStep, currentSubPathCount);
		else renderStep(currentStep);
	} else {
		if (!validateCreation()) alert("Creazione non valida");
		else finalizePathCreation();
	}
}
function nextBtnPathAction() {
	if (currentSubPathCount < lastSubPathCount) {
		currentSubPathCount++;

		$("#dynamicModalPathCreation #combinerSubPaths .combinerSubPath.active").removeClass("active");
		$(
			"#dynamicModalPathCreation #combinerSubPaths .combinerSubPath[data-sp='" +
				currentSubPathCount +
				"']"
		).addClass("active");
		renderStep(currentStep, currentSubPathCount);
		updateButtons();
	}
}
function graphNodeInteraction(e) {
	const targetCircle = e.target.tagName === "DIV" ? e.target : e.target.parentElement;
	currentStep = parseInt(targetCircle.dataset.step);
	if (combinerSwitchActive && targetCircle.getAttribute("data-sp"))
		currentSubPathCount = parseInt(targetCircle.getAttribute("data-sp"));
	$("#dynamicModalPathCreation .step-circle[data-step]").removeClass("selected-step");
	if (combinerSwitchActive && targetCircle.dataset.sp) renderStep(currentStep, currentSubPathCount);
	else renderStep(currentStep);
}
function updateProgressState() {
	document.querySelectorAll("#dynamicModalPathCreation .step-circle[data-step]").forEach((btn) => {
		const idx = btn.dataset.step;
		let subPathIdx = combinerSwitchActive && btn.dataset.sp ? btn.dataset.sp : "-1";
		const status =
			combinerSwitchActive && subPathIdx !== "-1"
				? evaluateStep(idx, subPathIdx)
				: evaluateStep(idx);
		btn.classList.remove("step-empty", "step-partial", "step-complete");
		if (status === "complete") btn.classList.add("step-complete");
		else if (status === "partial") btn.classList.add("step-partial");
		else btn.classList.add("step-empty");
	});

	function evaluateStep(index, subpathIndex = "-1") {
		const currStep =
			combinerSwitchActive && subpathIndex !== "-1"
				? document.querySelector(
						"#dynamicModalPathCreation .wizard-step[data-step='" +
							index +
							"'][data-sub-path='" +
							subpathIndex +
							"']"
				  )
				: document.querySelector(
						"#dynamicModalPathCreation .wizard-step[data-step='" + index + "']"
				  );

		const currStepSelect = currStep.querySelector("select");
		if (currStepSelect && currStepSelect.selectedIndex !== 0) return "complete";

		const currStepInputs = [...currStep.querySelectorAll("input, textarea")];
		if (currStepInputs.length === 0) return "empty";
		const filled = currStepInputs.filter((el) =>
			el.type === "checkbox" || el.type === "radio" ? el.checked : el.value.trim() !== ""
		);

		let hasFiles = false,
			hasLink = false;
		if (
			currStep.querySelector("input[id$='Files']") &&
			currStep.querySelector("input[id$='FileText']")
		) {
			const fileInput = currStep.querySelector("input[id$='Files']");
			hasFiles = fileInput.files && fileInput.files.length > 0;

			const fileText = currStep.querySelector("input[id$='FileText']").value.trim();
			const urlPattern = /^https?:\/\/[^\s]+$/i;
			hasLink = urlPattern.test(fileText);
		}

		if (filled.length === 0) return "empty";
		return filled.length === currStepInputs.length ||
			currStepInputs.filter((el) => el.type === "checkbox").some((elem) => elem.checked) ||
			(filled.length === currStepInputs.length - 2 && (hasFiles || hasLink))
			? "complete"
			: "partial";
	}
}
function addNewExtractor() {
	const subPathsSection = wizardGraph.querySelector("#combinerSubPaths");

	let newSubPath = `<div class="combinerSubPath flex-column align-items-center justify-content-center" data-sp="${++lastSubPathCount}"><hr style="height: 10px; width: 100%; background: ${getRandomColor()}">`;

	let combinerIndex = -1;

	pathToCreate.path.forEach((pathComponentType, index) => {
		const graphNodeType = Heriverse.getNodeTypeByCRNodeType(pathComponentType);

		if (graphNodeType !== HeriverseNode.NODE_TYPE.COMBINER && combinerIndex === -1) return;
		else if (graphNodeType === HeriverseNode.NODE_TYPE.COMBINER) {
			combinerIndex = index;
			return;
		}
		let graphNode = `<div class="step-circle step-empty mb-2" data-step=${
			pathToCreate.path.length - 1 - index
		} data-sp=${lastSubPathCount}>`;
		if (graphNodeType === HeriverseNode.NODE_TYPE.STRATIGRAPHIC) {
			graphNode += "SU";
		} else if (graphNodeType === HeriverseNode.STRATIGRAPHIC_TYPE.SF) {
			graphNode += "SF";
		} else {
			graphNode += `<img src="${
				(window.location.href.includes("heriverse-wapp")
					? "/a/heriverse-wapp/res/graphicons/"
					: "/a/heriverse/res/graphicons/") +
				graphNodeType +
				".svg"
			}" alt="${pathComponentType}">`;
		}
		graphNode += "</div>";

		newSubPath += graphNode;
		if (index < pathToCreate.path.length - 1) newSubPath += connector;

		let stepFromPath = Editor.modal_steps.find((elem) => elem.node_type === pathComponentType);

		const singleStep = document.createElement("div");
		singleStep.className = index === 0 ? "wizard-step active" : "wizard-step";
		singleStep.dataset.step = pathToCreate.path.length - 1 - index;
		if (combinerSwitchActive && index > combinerIndex)
			singleStep.dataset.subPath = lastSubPathCount;
		singleStep.dataset.type = stepFromPath.node_type;
		let stepContent = "";
		stepFromPath.fields.forEach((field) => {
			stepContent += generateFieldHTML(field, lastSubPathCount);
		});
		singleStep.innerHTML = stepContent;
		wizardContent.innerHTML += singleStep.outerHTML;
	});

	newSubPath += "</div>";

	subPathsSection.innerHTML += newSubPath;

	document.querySelectorAll("#dynamicModalPathCreation .step-circle > img").forEach((img) => {
		function tag() {
			if (img.naturalWidth && img.naturalHeight) {
				img.classList.toggle("orizontalIcon", img.naturalWidth > img.naturalHeight);
				img.classList.toggle("verticalIcon", img.naturalHeight >= img.naturalWidth);
			}
		}

		if (img.complete) tag();
		else img.addEventListener("load", tag, { once: true });
	});

	updateButtons();
}
function resetModalContent() {
	currentStep = 0;
	wizardContent
		.querySelectorAll("input[type=text], input[type=number], input[type=date], textarea")
		.forEach((singleInput) => (singleInput.value = ""));

	wizardContent
		.querySelectorAll("input[type=checkbox]")
		.forEach((singleInput) => (singleInput.checked = false));

	wizardContent
		.querySelectorAll("select")
		.forEach((singleSelect) => (singleSelect.selectedIndex = 0));
}
function setupPredefinedSteps() {
	const firstStep = wizardContent.querySelector(
		".wizard-step[data-type^=Link]" + (combinerSwitchActive ? "[data-sub-path='0']" : "")
	);
	const firstStepElements = firstStep.querySelectorAll("input, select, textarea");
	const repModStep = wizardContent.querySelector(
		".wizard-step[data-type^='RepresentationModel']" +
			(combinerSwitchActive ? "[data-sub-path='0']" : "")
	);
	const lastStep = wizardContent.querySelector(
		".wizard-step[data-type^='Stratigraphic']" +
			(combinerSwitchActive ? "[data-sub-path='0']" : "") +
			", .wizard-step[data-type^='Stratigraphic']" +
			(combinerSwitchActive ? "[data-sub-path='0']" : "")
	);
	const lastStepElements = lastStep.querySelectorAll("input, select, textarea");

	if (currShelfElement) {
		if (currShelfElement.dataset.urlContent)
			[...firstStepElements].find((element) => element.id.includes("FileText")).value =
				currShelfElement.dataset.urlContent;
		if (currShelfElement.dataset.contentType) {
			let typeSelector = [...firstStepElements].find((element) =>
				element.id.includes("TypeSelect")
			);
			typeSelector.selectedIndex = [...typeSelector.options].findIndex(
				(element) => element.value === currShelfElement.dataset.contentType
			);
		}
		if (currShelfElement.dataset.nameContent)
			[...firstStepElements].find((element) => element.id.includes("Name")).value =
				currShelfElement.dataset.nameContent;
		if (currShelfElement.dataset.descriptionContent)
			[...firstStepElements].find((element) => element.id.includes("Description")).textContent =
				currShelfElement.dataset.descriptionContent;
	}

	if (currWorkspaceElement) {
		if (HeriverseGraph.stratigraphicTypes.includes(currWorkspaceElement.dataset.bsType)) {
			let nodeSelector = [...lastStepElements].find(
				(element) => element.id.includes("Select") && !element.id.includes("TypeSelect")
			);
			nodeSelector.selectedIndex = [...nodeSelector.options].findIndex(
				(element) => element.textContent === currWorkspaceElement.dataset.bsName
			);
			$("select#" + nodeSelector.id + ".existing-node-selector").trigger("change");
		}
	}
}

function setupWizardEventListeners() {
	$(document)
		.off("change", "#dynamicModalPathCreation #combinerOption", combinerSwitch)
		.on("change", "#dynamicModalPathCreation #combinerOption", combinerSwitch);

	$(document)
		.off(
			"change",
			"#dynamicModalPathCreation #wizardContent .wizard-step select.existing-node-selector",
			manageOtherInputs
		)
		.on(
			"change",
			"#dynamicModalPathCreation #wizardContent .wizard-step select.existing-node-selector",
			manageOtherInputs
		);

	$(document)
		.off("click", "#dynamicModalPathCreation .modal-footer #prevBtn", prevBtnAction)
		.on("click", "#dynamicModalPathCreation .modal-footer #prevBtn", prevBtnAction);

	$(document)
		.off("click", "#dynamicModalPathCreation .modal-footer #prevPathBtn", prevBtnPathAction)
		.on("click", "#dynamicModalPathCreation .modal-footer #prevPathBtn", prevBtnPathAction);

	$(document)
		.off("click", "#dynamicModalPathCreation .modal-footer #nextBtn", nextBtnAction)
		.on("click", "#dynamicModalPathCreation .modal-footer #nextBtn", nextBtnAction);

	$(document)
		.off("click", "#dynamicModalPathCreation .modal-footer #nextPathBtn", nextBtnPathAction)
		.on("click", "#dynamicModalPathCreation .modal-footer #nextPathBtn", nextBtnPathAction);

	$(document)
		.off("click", "#dynamicModalPathCreation #extractorAdder", addNewExtractor)
		.on("click", "#dynamicModalPathCreation #extractorAdder", addNewExtractor);

	$(document)
		.off("click", "#dynamicModalPathCreation .step-circle[data-step]", graphNodeInteraction)
		.on("click", "#dynamicModalPathCreation .step-circle[data-step]", graphNodeInteraction);

	$(document)
		.off(
			"input change",
			"#dynamicModalPathCreation input, #dynamicModalPathCreation select, #dynamicModalPathCreation textarea",
			updateProgressState
		)
		.on(
			"input change",
			"#dynamicModalPathCreation input, #dynamicModalPathCreation select, #dynamicModalPathCreation textarea",
			updateProgressState
		);

	$(document)
		.off("shown.bs.modal", "#dynamicModalPathCreation", setupPredefinedSteps)
		.on("shown.bs.modal", "#dynamicModalPathCreation", setupPredefinedSteps);

	$(document)
		.off("hidden.bs.modal", "#dynamicModalPathCreation", resetModalContent)
		.on("hidden.bs.modal", "#dynamicModalPathCreation", resetModalContent);
}

function renderStep(idx, subpathIndex = -1) {
	const step = setupSteps[idx];
	const stepToactive =
		combinerSwitchActive && subpathIndex !== -1
			? wizardContent.querySelector(
					".wizard-step[data-step='" + idx + "'][data-sub-path='" + subpathIndex + "']"
			  )
			: wizardContent.querySelector(".wizard-step[data-step='" + idx + "']");
	const relatedCircle =
		combinerSwitchActive && subpathIndex !== -1
			? wizardGraph.querySelector(
					".step-circle[data-step='" + idx + "'][data-sp='" + subpathIndex + "']"
			  )
			: wizardGraph.querySelector(".step-circle[data-step='" + idx + "']");
	if (!stepToactive && !relatedCircle) return;

	wizardTitle.textContent = `${step && step.title ? step.title : "Resoconto"} (${idx + 1}/${
		pathToCreate.path.length + 1
	})`;

	const activeStep = wizardContent.querySelector(".wizard-step.active");
	if (activeStep) activeStep.classList.remove("active");

	if (stepToactive) stepToactive.classList.add("active");
	if (relatedCircle) relatedCircle.classList.add("selected-step");

	updateButtons();
}

function generateFieldHTML(field, lastFieldIndex = 0) {
	let html = `<label for="${field.id}${
		lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
	}" class="form-label fs-6 fw-bold w-100" id="${field.id}Label${
		lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
	}" data-i18n=${field.i18n_label}>${field.label}${field.required ? " *" : ""}</label>`;

	if (field.type === "select") {
		html += `<select class="form-select mb-4 ${
			field.id.includes("TypeSelect") || field.id.includes("Relate") ? "" : "existing-node-selector"
		}" ${
			field.id.includes("TypeSelect") || field.id.includes("Relate")
				? ""
				: 'onchange="Editor.manageOtherInputs"'
		} id="${field.id}${lastFieldIndex > 0 ? "-" + lastFieldIndex : ""}" aria-labelledby="${
			field.id
		}Label${lastFieldIndex > 0 ? "-" + lastFieldIndex : ""}" data-type="${field.element_type}">`;
		html += `<option value="" data-i18n="SELECT_AN_ELEMENT" selected>Seleziona un elemento...</option>`;
		if (field.options) field.options.forEach((o) => (html += `<option value="${o}">${o}</option>`));
		else if (field.element_type) {
			const elements = {};
			Heriverse.currentGraphs.forEach((graphId) => {
				const nodes =
					Heriverse.currMG.json.graphs[graphId].nodes[field.element_type] ||
					Heriverse.currMG.json.graphs[graphId].nodes.stratigraphic[field.element_type];

				if (Object.values(nodes).length) {
					Object.entries(nodes).forEach(([key, value]) => {
						elements[key] = value;
					});
				}
			});

			if (Object.values(elements).length) {
				if (field.element_type === HeriverseNode.TYPE.STRATIGRAPHIC) {
					Object.values(elements).forEach((sub_section) => {
						Object.entries(sub_section).forEach(([element_key, element_value]) => {
							html += `<option data-id="${element_value.graph + "_" + element_key}" data-type="${
								element_value.type
							}">${element_value.name}</option>`;
						});
					});
				} else {
					Object.entries(elements).forEach(([element_key, element_value]) => {
						html += `<option data-id="${element_key}" data-type="${element_value.type}">${element_value.name}</option>`;
					});
				}
			}
		}
		html += `</select>`;
	} else if (field.type === "checklist") {
		const elements = field.values || [];
		if (!elements.length) {
			Heriverse.currentGraphs.forEach((graphId) => {
				const nodes =
					Heriverse.currMG.json.graphs[graphId].nodes[field.checklist_type] ||
					Heriverse.currMG.json.graphs[graphId].nodes.stratigraphic[field.checklist_type];

				if (Object.values(nodes).length) {
					Object.entries(nodes).forEach(([key, value]) => {
						elements.push([key, value]);
					});
				}
			});
		}
		html += `<ul id="${field.id}${
			lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
		}" class="list-group" aria-labelledby="${field.id}Label${
			lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
		}">`;

		if (field.checklist_type === HeriverseNode.TYPE.STRATIGRAPHIC) {
			elements.forEach(([element_subsection_key, element_subsection]) => {
				Object.entries(element_subsection).forEach(([element_key, element_value]) => {
					html += `<li class="list-group-item"><input type="checkbox" data-id="${element_key}" data-type="${field.checklist_type}"/> ${element_value.name}</li>`;
				});
			});
		} else {
			elements.forEach(([element_key, element]) => {
				html += `<li class="list-group-item"><input type="checkbox" data-id="${element_key}" data-type="${
					field.checklist_type || element.type
				}"/> ${element.name}</li>`;
			});
		}
		html += `</ul>`;
	} else if (field.type === "textarea") {
		html += `<textarea id="${field.id}${lastFieldIndex > 0 ? "-" + lastFieldIndex : ""}" name="${
			field.id
		}" class="form-control w-100" aria-labelledby="${field.id}Label${
			lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
		}" rows="2" data-type="${field.element_type}"></textarea>`;
	} else if (field.type === "typeSelector") {
		html += `<select id="${field.id}${
			lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
		}" class="inputTypeSelector" aria-labelledby="${field.id}Label${
			lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
		}" data-type="${field.element_type}">`;
		if (field.values && field.values.length > 0) {
			field.values.forEach((value) => {
				html += `<option value=${value}>${value}</option>`;
			});
		}
		html += `</select>`;
	} else if (field.type === "nodeSelector") {
		html += `<select id="${field.id}${
			lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
		}" class="inputNodeSelector" aria-labelledby="${field.id}Label${
			lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
		}" data-type="${field.element_type}">`;
		if (field.valuesType === HeriverseNode.NODE_TYPE.STRATIGRAPHIC) {
			Object.values(Heriverse.currEM.EMnodes).forEach((node) => {
				if (!HeriverseGraph.stratigraphicTypes.includes(node.type)) return;
				html += `<option value=${node.name} data-id=${node.id}>${node.name}</option>`;
			});
		}
		html += `</select>`;
	} else if (field.type === "file") {
		html += `<input class="form-control inputFile" aria-labelledBy="${field.id}Label${
			lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
		}" id="${field.id}${lastFieldIndex > 0 ? "-" + lastFieldIndex : ""}" type="${
			field.type
		}" multiple=${field.multiple} ${field.accept ? "accept=" + field.accept : ""}/>`;
	} else {
		if (field.element_type === HeriverseNode.TYPE.PROPERTIES && field.label === "Informazioni") {
			html += UI.buildPropertyTypeSelector(Heriverse.properties_rules);
		} else {
			html += `<input id="${field.id}${lastFieldIndex > 0 ? "-" + lastFieldIndex : ""}" type="${
				field.type
			}" class="form-controll flex-grow-1 ${
				field.element_type === HeriverseNode.TYPE.PROPERTIES && field.id.includes("Info")
					? ""
					: "w-100"
			}" aria-labelledby="${field.id}Label${
				lastFieldIndex > 0 ? "-" + lastFieldIndex : ""
			}" data-type="${field.element_type}" style="float: left"/>`;
		}
	}

	return html;
}

function manageOtherInputs(e) {
	const currentSelectElement = this;
	currentSelectElement
		.closest(".wizard-step[data-step]")
		.querySelectorAll(
			"input[type=text], textarea, input[type=checkbox], input[type=number], input[type=color], select.inputTypeSelector"
		)
		.forEach((singleInput) => {
			singleInput.disabled = currentSelectElement.selectedIndex !== 0;
			if (document.querySelector(`label[for='${singleInput.id}']`))
				document.querySelector(`label[for='${singleInput.id}']`).style.opacity =
					currentSelectElement.selectedIndex !== 0 ? 0.3 : 1;
			else
				document.querySelector(
					`label[for='${singleInput.parentElement.parentElement.id}']`
				).style.opacity = currentSelectElement.selectedIndex !== 0 ? 0.3 : 10;
			singleInput.style.opacity = currentSelectElement.selectedIndex !== 0 ? 0.3 : 1;
		});
}

function updateButtons() {
	pageSubPath.querySelector("span").textContent = `${currentSubPathCount + 1} / ${
		lastSubPathCount + 1
	}`;
	pageSubPath.querySelector("#prevPathBtn").disabled = currentSubPathCount === 0;
	pageSubPath.querySelector("#nextPathBtn").disabled = currentSubPathCount === lastSubPathCount;
	backBtn.classList.toggle("d-none", currentStep === 0);
	nextBtn.textContent = currentStep === pathToCreate.path.length + 1 ? "Finish" : "Next";
}

function validateCreation() {
	const selectors = Object.values(wizardContent.querySelectorAll("select"));
	if (
		selectors.filter((selector) => selector.selectedIndex !== 0).length === pathToCreate.path.length
	)
		return true;

	const inputsBySteps = [];
	const actualSteps = wizardContent.querySelectorAll(
		".wizard-step[data-step]:not([data-step='" + pathToCreate.path.length + "'])"
	);

	actualSteps.forEach((actualStep, index) => {
		inputsBySteps.push({
			stepIndex: actualStep.dataset.step,
			stepType: actualStep.dataset.type,
			selector: actualStep.querySelector("select.existing-node-selector"),
			inputList: actualStep.querySelectorAll("input[type=text], textarea"),
			propertyDesc: actualStep.querySelectorAll(
				"div#" +
					Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
					"Info #propInput-section input, div#" +
					Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
					"Info #propInput-section select, div#" +
					Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
					"Info #propInput-section label"
			),
			checkedList: actualStep.querySelectorAll("input[type=checkbox]:checked"),
		});
	});
	let completedSteps = 0;

	inputsBySteps.forEach((singleStep) => {
		if (
			singleStep.selector &&
			singleStep.stepType === Heriverse.getCRNodeTypeByNodeType(singleStep.selector.dataset.type) &&
			singleStep.selector.selectedIndex !== 0
		) {
			completedSteps++;
		} else if (singleStep.inputList.length > 0) {
			let fieldCount = 0;
			singleStep.inputList.forEach((input) => {
				if (!input.value) return;
				else fieldCount++;
			});
			if (fieldCount > 0) {
				completedSteps++;
			}
		}

		if (singleStep.checkedList.length > 0) {
		}
	});

	return completedSteps === inputsBySteps.length;
}

function buildWizardSummary() {
	const steps = wizardContent.querySelectorAll(
		".wizard-step[data-step]:not([data-step='" + pathToCreate.path.length + "'])"
	);
	const contentBySteps = [];
	steps.forEach((step, index) => {
		contentBySteps.push({
			stepIndex: step.dataset.step,
			subPathIndex: step.dataset.subPath ? step.dataset.subPath : -1,
			stepName: step.title,
			stepType: step.node_type,
			selector: step.querySelector("select.existing-node-selector"),
			inputList: step.querySelectorAll(
				"input[type=text], input[type=date], input[type=number], input[type=color], input[type=file], select.inputTypeSelector, textarea"
			),
			propertyDesc: step.querySelectorAll(
				"div#" +
					Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
					"Info #propInput-section input, div#" +
					Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
					"Info #propInput-section select, div#" +
					Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
					"Info #propInput-section label"
			),
			checkList: step.querySelector("ul"),
		});
	});

	contentBySteps.forEach((singleStep, indx) => {
		let selected_type = "";

		const summarySection = wizardContent.querySelector(
			`.summarySection[data-index='${singleStep.stepIndex}']${
				singleStep.subPathIndex !== -1 ? "[data-sp='" + singleStep.subPathIndex + "']" : ""
			}`
		);
		const sectionTextFields = summarySection.querySelectorAll("li span");

		if (singleStep.selector && singleStep.selector.selectedIndex !== 0) {
			const selectedOption = singleStep.selector.options[singleStep.selector.selectedIndex];
			const selectedNode = Heriverse.currEM.EMnodes[selectedOption.dataset.id];

			sectionTextFields[0].textContent = selectedNode.name;
			if (sectionTextFields[1].id.includes("Description"))
				sectionTextFields[1].textContent =
					selectedNode.description || selectedNode.data.description;
			else if (sectionTextFields[1].id.includes("StartTime"))
				sectionTextFields[1].textContent = selectedNode.data.start_time;

			if (sectionTextFields.length > 2) {
				if (selectedNode.type === HeriverseNode.NODE_TYPE.EPOCH) {
					sectionTextFields[2].textContent = selectedNode.data.end_time;
					sectionTextFields[3].textContent = selectedNode.data.color;
					sectionTextFields[4].textContent = selectedNode.data.min_y;
					sectionTextFields[5].textContent = selectedNode.data.max_y;
				} else if (HeriverseGraph.stratigraphicTypes.includes(selectedNode.type)) {
					sectionTextFields[2].textContent = selectedNode.type;
				} else if (selectedNode.type === HeriverseNode.NODE_TYPE.LINK) {
					sectionTextFields[2].textContent = selectedNode.data.url_type;
					sectionTextFields[3].textContent = selectedNode.data.url;
				}
			}
		} else if (singleStep.inputList.length > 0) {
			const inputListAsArray = [...singleStep.inputList];
			if (singleStep.propertyDesc.length > 0) {
				let propertyDescription = "";

				singleStep.propertyDesc.forEach((singleElem) => {
					switch (singleElem.tagName) {
						case "LABEL":
							propertyDescription += singleElem.textContent + " ";
							break;
						case "INPUT":
							propertyDescription += singleElem.value + " ";
							break;
						case "SELECT":
							propertyDescription += singleElem.options[singleElem.selectedIndex].value + " ";
							break;
					}
				});

				sectionTextFields[0].textContent =
					document.querySelector("#propType-dropdownMenu").textContent;
				sectionTextFields[1].textContent = propertyDescription;
			} else {
				sectionTextFields.forEach((textField, index) => {
					if (textField.id.includes("TypeSelect")) {
						textField.textContent =
							singleStep.inputList[index].options[
								singleStep.inputList[index].selectedIndex
							].textContent;
						selected_type =
							singleStep.inputList[index].options[singleStep.inputList[index].selectedIndex]
								.textContent;
					} else if (textField.id.includes("Files") || textField.id.includes("FileText")) {
						let relativeFile;

						let urlSources = [];
						urlSources[0] = inputListAsArray.find((element) => element.id.includes("FileText"));
						urlSources[1] = inputListAsArray.find((element) => element.id.includes("Files"));
						let urlSource = urlSources[0].value ? urlSources[0] : urlSources[1];

						if (urlSource.value) {
							relativeFile = urlSource.value;
						} else {
							if (selected_type === "3d_model") {
								relativeFile = Array.from(urlSource.files)
									.map((file) => file.name)
									.find((value) => /\.(?:gltf|glb|obj|ply|fbx|3ds|e57)$/i.test(value));
							} else if (selected_type === "image") {
								relativeFile = Array.from(urlSource.files)
									.map((file) => file.name)
									.find((value) => /\.(?:jpg|jpeg|png)$/i.test(value));
							} else if (selected_type === "document") {
								relativeFile = Array.from(urlSource.files)
									.map((file) => file.name)
									.find((value) => /\.(?:pdf|txt|docx|tiff|xlsx)$/i.test(value));
							} else {
								relativeFile = Array.from(urlSource.files).map((file) => file.name);
							}
						}

						textField.textContent = relativeFile;
					} else textField.textContent = singleStep.inputList[index].value;
				});
			}
		} else if (singleStep.checkList) {
			const checkedOptions = singleStep.checkList.querySelectorAll("input[type=checkbox]:checked");
			const checklistSummary = summarySection.querySelector(".node-selection-checklist");
			let summaryContent = "";

			[...checkedOptions].forEach((checkinputElement) => {
				const nodeChecked = Heriverse.currEM.EMnodes[checkinputElement.dataset.id];
				summaryContent += `<li class="list-group-item"><strong>Nome: </strong><span>${nodeChecked.name}</span></li><li class="list-group-item"><strong>Descrizione: </strong><span>${nodeChecked.description}</span></li>`;
			});

			checklistSummary.innerHTML = summaryContent;
		}
	});
}

function finalizePathCreation() {
	$("#idLoader").show();
	let default_authors = Heriverse.currMG.json.graphs[Heriverse.currGraphId].defaults.authors;
	let default_license = Heriverse.currMG.json.graphs[Heriverse.currGraphId].defaults.license;
	let default_embargo_until =
		Heriverse.currMG.json.graphs[Heriverse.currGraphId].defaults.embargo_until;

	let stratigraphicWithChecklist;

	const inputsBySteps = [];
	const subPathsDone = [];
	const actualSteps = wizardContent.querySelectorAll(
		".wizard-step[data-step]:not([data-step='" + pathToCreate.path.length + "'])"
	);
	actualSteps.forEach((actualStep) => {
		inputsBySteps.push({
			stepIndex: actualStep.dataset.step,
			subPath: actualStep.dataset.subPath ? actualStep.dataset.subPath : -1,
			stepType: actualStep.dataset.type,
			nodeSelector: actualStep.querySelector("select[onchange='Editor.manageOtherInputs']"),
			inputList: actualStep.querySelectorAll(
				"input[type=text], input[type=color], input[type=number], input[type=file], textarea, select.inputTypeSelector, select.inputNodeSelector"
			),
			propertyDesc: actualStep.querySelectorAll(
				"div#" +
					Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
					"Info #propInput-section input, div#" +
					Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
					"Info #propInput-section select, div#" +
					Heriverse.CONNECTION_RULES_NODETYPES.PROPERTY +
					"Info #propInput-section label"
			),
			checkedList: actualStep.querySelectorAll("ul input[type=checkbox]:checked"),
		});
	});

	const nodesInvolved = [];

	inputsBySteps.forEach((singleStep) => {
		if (singleStep.subPath !== -1 && subPathsDone.includes(singleStep.subPath)) return;
		else if (singleStep.subPath !== -1) {
			subPathsDone.push(singleStep.subPath);
			const subPathNodesInvolved = [];
			inputsBySteps
				.filter((element) => element.subPath === singleStep.subPath)
				.forEach((otherStep) => {
					let concreteNode;
					const graphNodeType = Heriverse.getNodeTypeByCRNodeType(otherStep.stepType);
					if (otherStep.nodeSelector && otherStep.nodeSelector.selectedIndex !== 0) {
						let selectedOption =
							otherStep.nodeSelector.options[otherStep.nodeSelector.selectedIndex];
						concreteNode = Heriverse.currEM.EMnodes[selectedOption.dataset.id];
					} else if (otherStep.inputList.length > 0) {
						if (otherStep.propertyDesc.length > 0) {
							concreteNode = new HeriverseNode();
							let propertyDescription = "",
								propertyName = document.querySelector("#propType-dropdownMenu").textContent;

							otherStep.propertyDesc.forEach((singleElem) => {
								switch (singleElem.tagName) {
									case "LABEL":
										propertyDescription += singleElem.textContent + " ";
										break;
									case "INPUT":
										propertyDescription += singleElem.value + " ";
										break;
									case "SELECT":
										propertyDescription += singleElem.options[singleElem.selectedIndex].value + " ";
										break;
								}
							});

							concreteNode.setNodeInfo(
								null,
								graphNodeType,
								propertyName,
								propertyDescription,
								{},
								default_license,
								default_authors,
								default_embargo_until
							);

							Heriverse.currMG.newNode(concreteNode);
						} else {
							let nodeType =
								otherStep.inputList.length > 2 &&
								otherStep.inputList[2].tagName === "SELECT" &&
								graphNodeType === HeriverseNode.TYPE.STRATIGRAPHIC
									? otherStep.inputList[2].options[otherStep.inputList[2].selectedIndex].value
									: graphNodeType;

							concreteNode = new HeriverseNode();
							if (graphNodeType === HeriverseNode.NODE_TYPE.EPOCH) {
								concreteNode.setNodeInfo(
									null,
									nodeType,
									otherStep.inputList[0].value,
									"",
									{
										start_time: otherStep.inputList[1].value,
										end_time: otherStep.inputList[2].value,
										color: otherStep.inputList[3].value,
										min_y: otherStep.inputList[4].value,
										max_y: otherStep.inputList[5].value,
									},
									default_license,
									default_authors,
									default_embargo_until
								);
							} else if (graphNodeType === HeriverseNode.NODE_TYPE.LINK) {
								let relativeFile;
								if (otherStep.inputList[3].files && otherStep.inputList[3].files.length > 0) {
									relativeFile = Editor.uploadResource(otherStep.inputList[3].files);
								} else {
									relativeFile = otherStep.inputList[4].value;
								}

								concreteNode.setNodeInfo(
									null,
									nodeType,
									otherStep.inputList[0].value,
									"",
									{
										url: relativeFile,
										url_type: otherStep.inputList[2].value,
										description: otherStep.inputList[1].value,
									},
									default_license,
									default_authors,
									default_embargo_until
								);
							} else {
								concreteNode.setNodeInfo(
									null,
									nodeType,
									otherStep.inputList[0].value,
									otherStep.inputList[1].value,
									{},
									default_license,
									default_authors,
									default_embargo_until
								);
							}

							if (addFromScene && actualStartType === Heriverse.CONNECTION_RULES_NODETYPES.LINK) {
								if (concreteNode.type === HeriverseNode.NODE_TYPE.LINK) {
									currentLinkId = concreteNode.id;

									Editor.shelf_objects_in_graph[currentLinkId] = {
										link: concreteNode,
										samePathElements: [],
										parallelExtractors: [],
									};
								} else {
									Editor.shelf_objects_in_graph[currentLinkId].samePathElements.push({
										id: concreteNode.id,
										type: concreteNode.type,
									});
								}
							}

							Heriverse.currMG.newNode(concreteNode);
						}
					}

					if (otherStep.checkedList.length > 0) {
						const nodesChecked = [];

						otherStep.checkedList.forEach((checkedItem) => {
							nodesChecked.push(Heriverse.currEM.EMnodes[checkedItem.dataset.id]);
						});

						if (otherStep.checkedList[0].dataset.type === HeriverseNode.TYPE.EPOCHS) {
							nodesChecked.sort((a, b) => a.data.start_time - b.data.start_time);

							nodesChecked.forEach((nodeChecked, index) => {
								if (index === 0)
									Heriverse.currMG.newEdge(
										null,
										concreteNode,
										nodeChecked,
										HeriverseNode.RELATIONS.HAS_FIRST_EPOCH
									);
								else
									Heriverse.currMG.newEdge(
										null,
										concreteNode,
										nodeChecked,
										HeriverseNode.RELATIONS.SURVIVE_IN_EPOCH
									);
							});
						}
					}

					if (
						concreteNode.type === HeriverseNode.NODE_TYPE.EXTRACTOR ||
						concreteNode.type === HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL ||
						concreteNode.type === HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_DOC ||
						concreteNode.type === HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_SF
					) {
						nodesInvolved.push(concreteNode);
						subPathNodesInvolved.push(concreteNode);
					} else subPathNodesInvolved.push(concreteNode);
				});

			pathToCreate.connections.forEach((connection) => {
				let connectionFrom = subPathNodesInvolved.find(
					(node) => Heriverse.getCRNodeTypeByNodeType(node.type) === connection.from
				);
				let connectionTo = subPathNodesInvolved.find(
					(node) => Heriverse.getCRNodeTypeByNodeType(node.type) === connection.to
				);

				if (connectionFrom && connectionTo)
					Heriverse.currMG.newEdge(null, connectionFrom, connectionTo, connection.type);
			});
		} else {
			let concreteNode;
			const graphNodeType = Heriverse.getNodeTypeByCRNodeType(singleStep.stepType);
			if (singleStep.nodeSelector && singleStep.nodeSelector.selectedIndex !== 0) {
				let selectedOption = singleStep.nodeSelector.options[singleStep.nodeSelector.selectedIndex];
				concreteNode = Heriverse.currEM.EMnodes[selectedOption.dataset.id];
			} else if (singleStep.inputList.length > 0) {
				if (singleStep.propertyDesc.length > 0) {
					concreteNode = new HeriverseNode();
					let propertyDescription = "",
						propertyName = document.querySelector("#propType-dropdownMenu").textContent;

					singleStep.propertyDesc.forEach((singleElem) => {
						switch (singleElem.tagName) {
							case "LABEL":
								propertyDescription += singleElem.textContent + " ";
								break;
							case "INPUT":
								propertyDescription += singleElem.value + " ";
								break;
							case "SELECT":
								propertyDescription += singleElem.options[singleElem.selectedIndex].value + " ";
								break;
						}
					});

					concreteNode.setNodeInfo(
						null,
						graphNodeType,
						propertyName,
						propertyDescription,
						{},
						default_license,
						default_authors,
						default_embargo_until
					);

					Heriverse.currMG.newNode(concreteNode);
				} else {
					let nodeType =
						singleStep.inputList.length > 2 &&
						singleStep.inputList[2].tagName === "SELECT" &&
						graphNodeType === HeriverseNode.TYPE.STRATIGRAPHIC
							? singleStep.inputList[2].options[singleStep.inputList[2].selectedIndex].value
							: graphNodeType;

					concreteNode = new HeriverseNode();

					if (graphNodeType === HeriverseNode.NODE_TYPE.EPOCH) {
						concreteNode.setNodeInfo(
							null,
							nodeType,
							singleStep.inputList[0].value,
							"",
							{
								start_time: singleStep.inputList[1].value,
								end_time: singleStep.inputList[2].value,
								color: singleStep.inputList[3].value,
								min_y: singleStep.inputList[4].value,
								max_y: singleStep.inputList[5].value,
							},
							default_license,
							default_authors,
							default_embargo_until
						);
					} else if (graphNodeType === HeriverseNode.NODE_TYPE.LINK) {
						let relativeFile;
						if (singleStep.inputList[3].files && singleStep.inputList[3].files.length > 0) {
							relativeFile = Editor.uploadResource(singleStep.inputList[3].files);
						} else {
							relativeFile = singleStep.inputList[4].value;
						}

						concreteNode.setNodeInfo(
							null,
							nodeType,
							singleStep.inputList[0].value,
							"",
							{
								url: relativeFile,
								url_type: singleStep.inputList[2].value,
								description: singleStep.inputList[1].value,
							},
							default_license,
							default_authors,
							default_embargo_until
						);
					} else if (graphNodeType === HeriverseNode.NODE_TYPE.SEMANTIC_SHAPE) {
						const stratigraphicOptionSelected =
							inputsBySteps[1].options[inputsBySteps[1].selectedIndex];
						const stratigraphicNode =
							Heriverse.currEM.EMnodes[stratigraphicOptionSelected.dataset.id];

						concreteNode.setNodeInfo(
							stratigraphicNode.name + "_shape",
							nodeType,
							"Shape for " + stratigraphicNode.name,
							inputsBySteps[0].value,
							{ url: "", convexshapes: ATON.SemFactory.convexPoints, spheres: [] },
							default_license,
							default_authors,
							default_embargo_until,
							stratigraphicNode.graph
						);
					} else {
						concreteNode.setNodeInfo(
							null,
							nodeType,
							singleStep.inputList[0].value,
							singleStep.inputList[1].value,
							{},
							default_license,
							default_authors,
							default_embargo_until
						);
					}

					if (addFromScene && actualStartType === Heriverse.CONNECTION_RULES_NODETYPES.LINK) {
						if (concreteNode.type === HeriverseNode.NODE_TYPE.LINK && !currentLinkID) {
							currentLinkId = concreteNode.id;

							Editor.shelf_objects_in_graph[currentLinkId] = {
								link: concreteNode,
								samePathElements: [],
							};
						} else {
							Editor.shelf_objects_in_graph[currentLinkId].samePathElements.push({
								id: concreteNode.id,
								type: concreteNode.type,
							});
						}
					}

					Heriverse.currMG.newNode(concreteNode);
				}
			}

			if (singleStep.checkedList.length > 0) {
				const nodesChecked = [];

				singleStep.checkedList.forEach((checkedItem) => {
					nodesChecked.push(Heriverse.currEM.EMnodes[checkedItem.dataset.id]);
				});

				if (singleStep.checkedList[0].dataset.type === HeriverseNode.TYPE.EPOCHS) {
					nodesChecked.sort((a, b) => a.data.start_time - b.data.start_time);

					nodesChecked.forEach((nodeChecked, index) => {
						if (index === 0)
							Heriverse.currMG.newEdge(
								null,
								concreteNode,
								nodeChecked,
								HeriverseNode.RELATIONS.HAS_FIRST_EPOCH
							);
						else
							Heriverse.currMG.newEdge(
								null,
								concreteNode,
								nodeChecked,
								HeriverseNode.RELATIONS.SURVIVE_IN_EPOCH
							);
					});
				}
			}

			nodesInvolved.push(concreteNode);
		}
	});

	if (nodesInvolved.some((node) => node && HeriverseGraph.stratigraphicTypes.includes(node.type))) {
		const stratigraphicNode = nodesInvolved.find((node) =>
			HeriverseGraph.stratigraphicTypes.includes(node.type)
		);
		const otherNodes = [
			...nodesInvolved.filter(
				(node) =>
					node.type === HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL ||
					node.type === HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_DOC ||
					node.type === HeriverseNode.NODE_TYPE.REPRESENTATION_MODEL_SF
			),
		];

		Object.values(stratigraphicNode.neighbors.epoch)
			.sort((a, b) => a.data.start_time - b.data.start_time)
			.forEach((epoch, index) => {
				if (index === 0) {
					otherNodes.forEach((otherNode) => {
						Heriverse.currMG.newEdge(
							null,
							otherNode,
							epoch,
							HeriverseNode.RELATIONS.HAS_FIRST_EPOCH
						);
					});
				} else {
					otherNodes.forEach((otherNode) => {
						Heriverse.currMG.newEdge(
							null,
							otherNode,
							epoch,
							HeriverseNode.RELATIONS.SURVIVE_IN_EPOCH
						);
					});
				}
			});
	}

	pathToCreate.connections.forEach((connection) => {
		let connectionFrom = nodesInvolved.find(
			(node) =>
				node &&
				(Heriverse.getCRNodeTypeByNodeType(node.type) === connection.from ||
					([
						Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC,
						Heriverse.CONNECTION_RULES_NODETYPES.SPECIAL_FIND_UNIT,
					].includes(connection.from) &&
						HeriverseGraph.stratigraphicTypes.includes(node.type)))
		);
		let connectionTo = nodesInvolved.filter(
			(node) =>
				node &&
				(Heriverse.getCRNodeTypeByNodeType(node.type) === connection.to ||
					([
						Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC,
						Heriverse.CONNECTION_RULES_NODETYPES.SPECIAL_FIND_UNIT,
					].includes(connection.to) &&
						HeriverseGraph.stratigraphicTypes.includes(node.type)))
		);

		if (connectionFrom && connectionTo.length > 0)
			connectionTo.forEach((singleTo) => {
				Heriverse.currMG.newEdge(null, connectionFrom, singleTo, connection.type);
			});
	});

	Heriverse.Scene.multigraph = Heriverse.currMG.json;
	Heriverse.ResourceScene.resource_json.multigraph = Heriverse.currMG.json;

	bootstrap.Modal.getOrCreateInstance(document.getElementById("dynamicModalPathCreation")).hide();

	// Heriverse.loadEM("", false, true);
	Heriverse.setScene();
}

Editor.setupModalSteps = (startNodeType, endNodeType, rmType = "") => {
	setupSteps = [];
	currentStep = 0;
	currentSubPathCount = 0;
	lastSubPathCount = 0;
	combinerSwitchActive = false;

	actualStartType = startNodeType;
	actualEndType = endNodeType;

	if (
		(startNodeType === Heriverse.CONNECTION_RULES_NODETYPES.STRATIGRAPHIC ||
			startNodeType === Heriverse.CONNECTION_RULES_NODETYPES.SPECIAL_FIND_UNIT) &&
		endNodeType === Heriverse.CONNECTION_RULES_NODETYPES.LINK &&
		currShelfElement &&
		currShelfElement.dataset.contentType === ShelfNode.CONTENT_TYPE.MODEL_3D
	) {
		if (rmType === "representation") {
			let path1 = Heriverse.findShortestValidPath(
				startNodeType,
				Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL
			);
			let path2 = Heriverse.findShortestValidPath(
				Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL,
				endNodeType
			);
			pathToCreate = {
				connections: [...path1.connections, ...path2.connections],
				path: [...path1.path, ...path2.path.splice(1)],
			};
		} else if (rmType === "document") {
			let path1 = Heriverse.findShortestValidPath(
				startNodeType,
				Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_DOC
			);
			let path2 = Heriverse.findShortestValidPath(
				Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_DOC,
				endNodeType
			);
			pathToCreate = {
				connections: [...path1.connections, ...path2.connections],
				path: [...path1.path, ...path2.path.splice(1)],
			};
		} else if (rmType === "special_find") {
			let path1 = Heriverse.findShortestValidPath(
				startNodeType,
				Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_SF
			);
			let path2 = Heriverse.findShortestValidPath(
				Heriverse.CONNECTION_RULES_NODETYPES.REPRESENTATION_MODEL_SF,
				endNodeType
			);
			pathToCreate = {
				connections: [...path1.connections, ...path2.connections],
				path: [...path1.path, ...path2.path.splice(1)],
			};
		}
	} else pathToCreate = Heriverse.findShortestValidPath(startNodeType, endNodeType);

	if (pathToCreate) {
		buildSteps();
		buildProgressBar();
		updateButtons();
	} else {
		alert("Non è possibile creare un path.");
		return;
	}
};

export default Editor;
