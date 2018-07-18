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
		const { js, css } = MoonMVL(this.name, this.contents);

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
