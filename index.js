const fs = require("fs");
const path = require("path");
const Moon = require("moon");
const { Asset } = require("parcel");

class MoonAsset extends Asset {
	constructor(name, pkg, options) {
		super(name, pkg, options);
		this.type = "js";
	}

	async generate() {
		let code = "import Moon from \"moon\";";
		const view = "function(m,instance,locals){" + Moon.compile(this.contents) + "};";
		let data = "{};";

		const fileName = this.basename.slice(0, -4);
		const directoryName = path.dirname(this.name);
		if (fs.existsSync(path.join(directoryName, fileName + ".js"))) {
			const jsFile = `./${fileName}.js`;
			this.addDependency(jsFile);
			code += `import data from "${jsFile}";`;
			data = "data;";
		}

		code += `export default Moon.extend("${path.basename(directoryName)}",function(){var options=${data}options.view=${view}return options;});`;

		return [
			{
				type: "js",
				value: code
			}
		];
	}
}

module.exports = MoonAsset;
