var { Parser } = require("acorn");
var coalesce = require("lodash.property");

module.exports = class {
  parse(file) {
    var parser = new Parser(
      {
        ecmaVersion: 2017,
        sourceType: "module"
      },
      file
    );

    // @ts-ignore
    var { body } = parser.parse();

    var result = this.parseGlobalRegistration(body);
    if (result) return result;

    return false;
  }

  parseGlobalRegistration(body) {
    var imports = body.filter(node => node.type == "ImportDeclaration");
    /// global call
    var globalRegistration = body.find(node => {
      if (node.type == "ExpressionStatement") {
        if (node.expression.type == "CallExpression") {
          var { object, property } = node.expression.callee;
          if (object.name == "Vue" && property.name == "component") {
            return true;
          }
        }
      }
    });

    var [componentName, schema] = globalRegistration.expression.arguments;
    var templateStmt = schema.properties.find(
      prop => prop.key.name == "template"
    );

    var templateName = coalesce("value.name")(templateStmt);
    if (!templateName) return false;

    var templateImportStmt = imports.find(i =>
      i.source.value.match(/\.html?$/)
    );
    var styleImportStmt = imports.find(i => i.source.value.match(/\.s?css$/));

    return {
      type: "separated",
      templateStmt,
      templateImportStmt,
      styleImportStmt
    };
  }
};
