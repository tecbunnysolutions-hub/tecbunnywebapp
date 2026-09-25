import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const publicSource = join(root, 'apps', 'public', 'src');
const publicApi = join(publicSource, 'app', 'api');

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && ['node_modules', '.next', '.git'].includes(entry.name)) return [];
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

const localRouteHandlers = filesIn(publicApi).filter((path) => /[\\/]route\.(?:ts|tsx|js|jsx)$/.test(path));
const mutationPattern = /\.from\([^)]*\)[\s\S]{0,240}\.(?:insert|update|upsert|delete)\s*\(/;
const directMutations = filesIn(publicSource)
  .filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path))
  .filter((path) => mutationPattern.test(readFileSync(path, 'utf8')));

const browserClientsInHandlers = filesIn(join(root, 'apps'))
  .filter(path => /[\\/]src[\\/]app[\\/].*[\\/]route\.[jt]sx?$/.test(path))
  .filter(path => {
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
    return source.statements.some(statement => {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) return false;
      const module = statement.moduleSpecifier.text;
      if (!['@tecbunny/database', '@tecbunny/database/browser', '@tecbunny/core'].includes(module)) return false;
      const bindings = statement.importClause?.namedBindings;
      return bindings && ts.isNamedImports(bindings) && bindings.elements.some(binding =>
        !statement.importClause.isTypeOnly && !binding.isTypeOnly && ['createClient', 'createSupabaseBrowserClient', 'getBrowserClient', 'getClient'].includes((binding.propertyName ?? binding.name).text));
    });
  });

if (localRouteHandlers.length || directMutations.length || browserClientsInHandlers.length) {
  console.error('API boundary validation failed. Public mutations must use the central API, and server handlers must use server database clients.');
  for (const path of localRouteHandlers) console.error(`Local public route handler: ${relative(root, path)}`);
  for (const path of directMutations) console.error(`Direct public database mutation: ${relative(root, path)}`);
  for (const path of browserClientsInHandlers) console.error(`Browser database factory in server handler: ${relative(root, path)}`);
  process.exit(1);
}

console.log('API boundary validation passed: public mutations use the API; server handlers do not import browser database factories.');
