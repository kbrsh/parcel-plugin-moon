const path = require("path");
const MoonMVL = require("moon-mvl");
const slash = require("moon-mvl/lib/slash");
const { Asset } = require("parcel");

class MoonAsset extends Asset {
	constructor(name, pkg, options) {
		super(name, pkg, options);
		this.type = "js";
	}

	async generate() {
		let { name, fileName, js, css } = MoonMVL(this.name, this.contents);
		let parts;

		if (process.env.NODE_ENV === "development") {
			js = `
				import fs from "fs";
				import { registerJS, registerCSS } from "moon-mvl/lib/hot";
				import scopeCSS from "moon-mvl/lib/scopeCSS";
				let removeJS = [];
				const removeCSS = registerCSS(scopeCSS("moon-${name}-${slash(name)}", fs.readFileSync(__dirname + "${path.sep}${fileName}.css").toString()));
				${
					js.replace("return options;", `
						const onCreate = options.onCreate;
						options.onCreate = function() {
							removeJS.push(registerJS(this));
							if (onCreate !== undefined) {
								onCreate();
							}
						};
						$&
					`)
				}
				if (module.hot) {
					module.hot.dispose(() => {
						for (let i = 0; i < removeJS.length; i++) {
							removeJS[i]();
						}

						removeJS = [];
						removeCSS();
					});
				}
			`;

			parts = [{
				type: "js",
				value: js
			}];
		} else {
			parts = [
				{
					type: "css",
					value: css
				},
				{
					type: "js",
					value: js
				}
			]
		}

		return parts;
	}
}

module.exports = MoonAsset;
