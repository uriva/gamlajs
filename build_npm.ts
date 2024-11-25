import { build, emptyDir } from "jsr:@deno/dnt@0.41.3";

const outDir = "./dist";

await emptyDir(outDir);

await build({
  entryPoints: ["./src/index.ts"],
  outDir,
  shims: { deno: true },
  package: {
    dependencies: { "@types/sjcl": "1.0.34" },
    name: "gamla",
    version: Deno.args[0],
    description: "Functional programming with async and type safety",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/uriva/gamlajs.git",
    },
    bugs: { url: "https://github.com/uriva/gamlajs/issues" },
  },
  importMap: "deno.json",
  postBuild() {
    Deno.copyFileSync("./LICENSE", outDir + "/LICENSE");
    Deno.copyFileSync("./README.md", outDir + "/README.md");
  },
});
