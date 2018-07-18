const fs = require("fs");
const path = require("path");
const MoonMVL = require("moon-mvl");
const { Asset } = require("parcel");

class MoonAsset extends Asset {
	constructor(name, pkg, options) {
		super(name, pkg, options);
		this.type = "js";
	}

	async generate() {
		const { js, css, deps } = MoonMVL(this.name, this.contents);

		for (let i = 0; i < deps.length; i++) {
			this.addDependency(deps[i]);
		}

		return [
			{
				type: "css",
				value: css
			},
			{
				type: "js",
				value: js
			}
		];
	}
}

module.exports = MoonAsset;
