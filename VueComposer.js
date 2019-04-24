const { readFileSync } = require("fs");
const { join } = require("path");

module.exports = class {
  composeFromSeparated(
    dir,
    input,
    templateStmt,
    templateImportStmt,
    styleImportStmt = null
  ) {
    var { start, end, source } = templateImportStmt;

    var beforeTemplateImport = input.substr(0, start);
    /// +1 to remove \n
    var afterTemplateImport = input.substr(end + 1);
    var vueContent = beforeTemplateImport + afterTemplateImport;

    var templateHtml = readFileSync(dir, source.value);
    var templateIndented = this.indent(templateHtml);
    var templatePart = `<template>\n${templateIndented}</template>\n`;

    var { start, end } = templateStmt;
    /// as we have already removed some portion of input
    start -= input.length - vueContent.length;
    end -= input.length - vueContent.length;
    var beforeTemplate = vueContent.substr(0, start);

    var hasComma = vueContent[end] == ",";
    var hasNewLineAfter = vueContent
      .substr(end + (hasComma && 1), 20)
      .match(/\n\s*\w/);

    var afterTemplate = vueContent.substr(
      end + (hasComma && 1) + (hasNewLineAfter && hasNewLineAfter[0].length - 1)
    );

    vueContent = beforeTemplate + afterTemplate;

    var scriptContentIndented = this.indent(beforeTemplate + afterTemplate);
    var script = `<script>\n${scriptContentIndented}</script>\n`;

    var style = "";
    if (styleImportStmt) {
      var { start, end, source } = styleImportStmt;
      start -= input.length - vueContent.length;
      end -= input.length - vueContent.length;
      var beforeStyle = vueContent.substr(0, start);
      var afterStyle = vueContent.substr(end + 1);

      vueContent = beforeStyle + afterStyle;

      var styleContent = readFileSync(dir, source.value);
      var lang = null;
      if (source.value.match(/\.scss$/)) lang = "scss";
      else if (source.value.match(/\.css$/)) lang = "css";

      var indented = this.indent(styleContent);
      style = `<style lang="${lang}" scoped>\n${indented}</style>\n`;
    }

    return templatePart + script + style;
  }

  indent(content, spaces = 2, lastLf = true) {
    var indent = Array.from({ length: spaces })
      .map(() => " ")
      .join("");

    var indented = content
      .split("\n")
      .map((line, index, { length }) =>
        /// last empty line should not be indented
        line == "" && index == length - 1 ? "" : indent + line
      )
      .join("\n");
    if (lastLf && !indented.endsWith("\n")) indented += "\n";

    return indented;
  }

  readFile(dir, file) {
    return readFileSync(join(dir, file), {
      encoding: "utf-8"
    });
  }
};
