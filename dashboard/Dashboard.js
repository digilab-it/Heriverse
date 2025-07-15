"use strict";
/**
@namespace Dashboard
*/

let Dashboard = {};
let APP = ATON.App.realize();
window.Dashboard = Dashboard;
let basepath = "heriverse";
let open_card_callback = "Dashboard.goToScene";

APP.setup = () => {
	ATON.FE.realize();
	APP.requireFlares("Auth");
	Dashboard.setupEventHandlers();
	ATON.on("AllFlaresReady", () => {
		console.log("All flares ready");
	});
	ATON.on("AUTH_Scenes_Loaded", () => {
		Dashboard.hidePreloader();

		new Translate({
			defaultLocale: "en",
			supportedLocales: ["en", "it"],
			langSwitcherSelector: "#lang-switcher",
		});
	});
};

Dashboard.hidePreloader = () => {
	$("#preloader").fadeOut(500, function () {
		$("#Page").fadeIn(500);
	});
};

Dashboard.init = () => {
	let footerPageJson = {
		main_logos: [Utils.baseUrl + "/assets/icons/footer/heriverse_logo_horizontal.png"],
		main_logos_labels: ["Heriverse"],
		main_logos_urls: [Utils.baseUrl + "/scenes"],
		other_logos: [
			Utils.baseUrl + "/assets/icons/footer/H2_logo_white.svg",
			Utils.baseUrl + "/assets/icons/footer/DIGILAB_white.svg",
		],
		other_logos_urls: ["#", "#"],
		other_logos_labels: ["H2IOSC", "DIGILAB"],
		left_side_links: { obiettivi: "#", istituti: "#" },
		right_side_links: { cookies: "#", privacy: "#" },
		down_side_text: "",
		footer_background_color: "rgba(52, 67, 115, 1)",
		footer_text_color: "white",
		footer_downside_background_color: "rgba(68, 88, 151, 1)",
	};

	ATON.AuthOptions = {
		basepath: basepath,
		open_card_callback: open_card_callback,
		logo_pilot_header: Utils.baseUrl + "/assets/logo/heriverse_logo_horizontal.png",
		logo_pilot_footer: Utils.baseUrl + "/assets/logo/heriverse_logo_horizontal.svg",
		logo_pilot_url_header: Utils.pilotSite,
		logo_pilot_label_header: "Heriverse",
		logo_pilot_label_footer: "Heriverse",
		header_title: "WELCOME_TO_HERIVERSE",
		header_subtitle: "SELECT_SCENE",
		open_card_label: "OPEN_SCENE",
		search_params: ["title"],
		footer_json: footerPageJson,
		sortBy: "title",
	};
	APP.requireFlares(["Auth"]);
	APP.run();
};

Dashboard.goToHomePage = () => {
	window.location.assign(Utils.baseUrl + "/scenes");
};
Dashboard.goToScene = (id) => {
	id = String(id);
	window.location.assign(Utils.baseUrl + "/?scene=" + id);
};

Dashboard.setupEventHandlers = () => {
	ATON.on("AuthLoaded", (e) => {
		ATON.Flares["Auth"].loadDashboardScenes();
	});
};

Dashboard.goToCreateNewScene = () => {
	window.location.assign(Utils.baseUrl + "/create");
};

export default Dashboard;
