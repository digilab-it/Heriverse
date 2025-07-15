/*
@class APISimulator
@example 
new Heriverse.APISimulatore()
*/

export default class APISimulator {
	constructor(basepath) {
		this.basepath = basepath;
	}

	getScenes(onSuccess, onFail) {
		self = this;
		let path = "/" + this.basepath + "scenes/response.json";
		$.getJSON("/" + this.basepath + "scenes/response.json", (json) => {
			this._scenes = json.scenes;
		})
			.done(function () {
				if (onSuccess) {
					onSuccess();
				}
			}, "text")
			.fail(() => {
				if (onFail) onFail();
			});
	}

	createScene(scene, onSuccess, onFail) {
		self = this;
		let path = "/" + this.basepath + "scenes/response.json";
		$.getJSON("/" + this.basepath + "scenes/response.json", (json) => {
			this._scenes = json.scenes;
		})
			.done(function () {
				if (onSuccess) {
					onSuccess();
				}
			}, "text")
			.fail(() => {
				if (onFail) onFail();
			});
	}

	getLogin(onSuccess, onFail) {
		self = this;
		let path = "/" + this.basepath;

		if (onSuccess) {
			onSuccess();
		}
	}
}
