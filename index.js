module.exports = function(bundler) {
	bundler.addAssetType(".mvl", require.resolve("./moon-asset"));
};
