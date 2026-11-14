// Fails the build when the code uses a name that does not exist (a typo, a
// variable declared in the wrong place, a missing import, a wrong export).
// This is the kind of mistake that compiles fine but crashes a page at run time
// ("statusVersion is not defined"). It runs the TypeScript compiler and looks
// only at those specific errors, so it does not block on style or typing issues.
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram({
  rootNames: parsed.fileNames.filter((f) => /[\\/](client|server|shared)[\\/]/.test(f)),
  options: { ...parsed.options, noEmit: true, skipLibCheck: true },
});

const CODES = new Set([2304, 2552, 2448, 2454, 2305, 2614, 2724]); // cannot find name / used before defined / bad export
let problems = 0;
for (const d of ts.getPreEmitDiagnostics(program)) {
  if (!d.file || !CODES.has(d.code)) continue;
  if (d.file.fileName.includes("node_modules")) continue;
  const msg = ts.flattenDiagnosticMessageText(d.messageText, " ");
  if (/'(React|JSX|NodeJS)'/.test(msg)) continue;
  const { line } = d.file.getLineAndCharacterOfPosition(d.start);
  console.error(`${path.relative(root, d.file.fileName)}:${line + 1}  ${msg}`);
  problems++;
}
if (problems) {
  console.error(`\n${problems} undefined name(s) found: they would crash at run time.`);
  process.exit(1);
}
console.log("check-names: no undefined names");
