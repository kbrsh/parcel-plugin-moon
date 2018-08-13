const MoonMVL = require("moon-mvl");
const { Asset } = require("parcel");

class MoonAsset extends Asset {
	constructor(name, pkg, options) {
		super(name, pkg, options);
		this.type = "js";
	}

	async generate() {
		const { js, css } = MoonMVL(this.basename.slice(0, -4), this.contents, process.env.NODE_ENV === "development");

		let parts = [{
			type: "js",
			value: js
		}];

		if (css !== null) {
			parts.unshift({
				type: "css",
				value: css
			});
		}

		return parts;
	}
}

module.exports = MoonAsset;
