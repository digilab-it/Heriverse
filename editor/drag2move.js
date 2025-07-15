document.addEventListener("DOMContentLoaded", function (event) {
	dragElement(document.getElementById("right-panel"));
	dragElement(document.getElementById("shelf-panel"));
	dragElement(document.getElementById("workspace-panel"));

	function dragElement(elmnt) {
		var pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0;
		const top_bar = document.getElementById("container-bar").getBoundingClientRect();

		if (document.getElementById(elmnt.id + "-header")) {
			document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
			document.getElementById(elmnt.id + "-header").onpointerdown = dragMouseDown;
		} else {
			elmnt.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();

			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			document.onpointerup = closeDragElement;
			document.onmousemove = elementDrag;
			document.onpointermove = elementDrag;

			document.querySelectorAll("[id$='-panel']").forEach((elem) => {
				elem.style.zIndex = 1;
			});
			document.querySelector("#" + elmnt.id).style.zIndex = 5;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();

			const elementBox = elmnt.getBoundingClientRect();

			const workspaceW = window.innerWidth;
			const workspaceH = window.innerHeight;
			const topLimit = top_bar.bottom;
			const leftLimit = 0;
			const rightLimit = workspaceW - elmnt.offsetWidth;
			const bottomLimit = workspaceH - elmnt.offsetHeight;

			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			let newLeftPx = elmnt.offsetLeft - pos1;
			let newTopPx = elmnt.offsetTop - pos2;

			newLeftPx = Math.max(leftLimit, Math.min(newLeftPx, rightLimit));
			newTopPx = Math.max(topLimit, Math.min(newTopPx, bottomLimit));

			elmnt.style.left = (newLeftPx * 100) / workspaceW + "%";
			elmnt.style.top = (newTopPx * 100) / workspaceH + "%";
		}

		function closeDragElement() {
			document.onmouseup = null;
			document.onpointerup = null;
			document.onmousemove = null;
			document.onpointermove = null;
		}
	}
});
