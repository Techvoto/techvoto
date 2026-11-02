import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const localRequire = createRequire(import.meta.url);
let ts;
try { ts = localRequire('typescript'); }
catch {
  const globalModules = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
  ts = createRequire(path.join(globalModules, '__lint__.cjs'))('typescript');
}

const root = path.resolve('src');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) files.push(file);
  }
}
walk(root);
const issues = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const report = (node, rule, message) => {
    const { line, character } = tree.getLineAndCharacterOfPosition(node.getStart(tree));
    issues.push(`${path.relative(process.cwd(), file)}:${line + 1}:${character + 1} ${rule} ${message}`);
  };
  if (/\/\/\s*@ts-ignore\b|\/\*\s*@ts-ignore\b|@ts-nocheck\b/.test(source)) {
    const index = source.search(/@ts-(?:ignore|nocheck)\b/);
    report(tree, 'no-ts-suppression', `TypeScript suppression directive at offset ${index}`);
  }
  function visit(node) {
    if (ts.isDebuggerStatement(node)) report(node, 'no-debugger', 'Remove debugger statement.');
    if (node.kind === ts.SyntaxKind.AnyKeyword) report(node, 'no-explicit-any', 'Use a concrete or unknown type.');
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && ts.isIdentifier(node.expression.expression) && node.expression.expression.text === 'console'
      && ['log', 'debug', 'info'].includes(node.expression.name.text)) {
      report(node, 'no-console', 'Remove console logging from application source.');
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
}
if (issues.length) {
  process.stderr.write(`${issues.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Source guard lint passed (${files.length} TypeScript files).\n`);
}
