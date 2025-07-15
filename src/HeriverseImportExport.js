let HeriverseImportExport = {};
const JSZip = window.JSZip;
window.HeriverseImportExport = HeriverseImportExport;

HeriverseImportExport.exportNodesAsZip = async (_nodes, zipFilename = "models_bundle.zip") => {
	const zip = new JSZip();
	let nodes = Object.values(_nodes);
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		const filename = nodes[i].name + ".gltf";
		const ext = ATON.Utils.getFileExtension(filename);

		if (!ext) continue;

		if (ext === "glb" || ext === "gltf") {
			const opts = { binary: ext === "glb" };

			if (!ATON.Utils.exporterGLTF) ATON.Utils.exporterGLTF = new THREE.GLTFExporter();

			await new Promise((resolve) => {
				ATON.Utils.exporterGLTF.parse(
					node,
					(output) => {
						if (output instanceof ArrayBuffer) {
							zip.file(filename, output);
						} else {
							zip.file(filename, JSON.stringify(output));
						}
						resolve();
					},
					opts
				);
			});
		} else if (ext === "obj") {
			if (!ATON.Utils.exporterOBJ) ATON.Utils.exporterOBJ = new THREE.OBJExporter();

			const output = ATON.Utils.exporterOBJ.parse(node);
			zip.file(filename, output);
		} else if (ext === "usdz") {
			if (!ATON.Utils.exporterUSDZ) ATON.Utils.exporterUSDZ = new THREE.USDZExporter();

			const output = await ATON.Utils.exporterUSDZ.parse(node);
			zip.file(filename, output);
		}
	}

	const blob = await zip.generateAsync({ type: "blob" });
	HeriverseImportExport.downloadBlob(blob, zipFilename);
};

HeriverseImportExport.downloadBlob = (blob, filename) => {
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
	setTimeout(() => URL.revokeObjectURL(link.href), 100);
};

export default HeriverseImportExport;
