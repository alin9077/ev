import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const root = process.cwd();
export const applicationRequire = createRequire(path.join(root, "package.json"));
const ts = applicationRequire("typescript") as typeof import("typescript");

/** Exercise the actual source and callbacks without mounting a browser or HTTP server. */
export function compiledSource(
  relativePath: string,
  overrides: Record<string, unknown> = {},
  documentValue?: unknown,
): Record<string, unknown> {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const scopedRequire = createRequire(filename);
  const compiledModule = { exports: {} as Record<string, unknown> };
  const load = (id: string) =>
    Object.hasOwn(overrides, id) ? overrides[id] : scopedRequire(id);
  const run = vm.runInThisContext(
    `(function(require,module,exports,document){${output}\n})`,
    { filename },
  ) as (requireFn: typeof load, module: typeof compiledModule,
    exports: Record<string, unknown>, document: unknown) => void;
  run(load, compiledModule, compiledModule.exports, documentValue);
  return compiledModule.exports;
}

export type ElementNode = {
  type: unknown;
  props: {
    children?: unknown;
    value?: unknown;
    type?: string;
    onClick?: () => void;
    onChange?: (event: { target: { value: string } }) => void;
    [key: string]: unknown;
  };
};
export function elementNodes(value: unknown): ElementNode[] {
  if (Array.isArray(value)) return value.flatMap(elementNodes);
  if (!value || typeof value !== "object" || !("props" in value)) return [];
  const node = value as ElementNode;
  return [node, ...elementNodes(node.props.children)];
}
