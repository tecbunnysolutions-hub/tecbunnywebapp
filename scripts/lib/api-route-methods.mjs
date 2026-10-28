import ts from 'typescript';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

// Parse actual top-level exports; examples and commented legacy handlers are not APIs.
export function exportedRouteMethods(source, fileName = 'route.ts') {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const names = new Set();
  const binding = name => {
    if (ts.isIdentifier(name)) names.add(name.text);
    else for (const element of name.elements) if (ts.isBindingElement(element)) binding(element.name);
  };
  for (const statement of file.statements) {
    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) if (!element.isTypeOnly && !statement.isTypeOnly) names.add(element.name.text);
    }
    if (!statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (ts.isFunctionDeclaration(statement) && statement.name) names.add(statement.name.text);
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) binding(declaration.name);
  }
  return METHODS.filter(method => names.has(method));
}
