const VueComposer = require("./VueComposer");
const Parser = require("./Parser");
const { writeFileSync, readFileSync } = require("fs");

var file = readFileSync("testData/test1/index.js", { encoding: "utf8" });

var parser = new Parser();
var parsedData = parser.parse(file);

var composer = new VueComposer();
if (parsedData) {
  var output = composer.composeFromSeparated(
    "folder",
    file,
    parsedData.templateStmt,
    parsedData.templateImportStmt,
    parsedData.styleImportStmt
  );
  writeFileSync("file.vue", output);
}
