import { build, emptyDir } from "https://deno.land/x/dnt@0.39.0/mod.ts";

const outDir = "./dist";

await emptyDir(outDir);

await build({
  entryPoints: ["./src/index.ts"],
  outDir,
  shims: { deno: true, crypto: true },
  package: {
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
