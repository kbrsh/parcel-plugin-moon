const fs = require("fs");
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
		const fileName = path.basename(this.name).slice(0, -4);
		const directoryName = path.dirname(this.name);
		const name = path.basename(directoryName);

		const jsFile = `.${path.sep}${fileName}.js`;
		const jsPath = path.join(directoryName, jsFile);
		let js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, "utf8") : null;

		const cssFile = `.${path.sep}${fileName}.css`;
		const cssPath = path.join(directoryName, cssFile);
		let css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : null;

		({ js, css } = MoonMVL(name, this.contents, jsFile, js, cssFile, css));
		let parts;

		if (process.env.NODE_ENV === "development") {
			js = `
				import fs from "fs";
				import { registerJS, registerCSS } from "moon-mvl/lib/hot";
				import scopeCSS from "moon-mvl/lib/scopeCSS";
				let removeJS = [];
				const removeCSS = registerCSS(scopeCSS("moon-${name}-${slash(name)}", fs.readFileSync("${cssPath}", "utf8")));
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
