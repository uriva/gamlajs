import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";

const outDir = "./dist";

await emptyDir(outDir);

await build({
  entryPoints: ["./src/index.ts"],
  outDir,
  shims: { deno: true },
  package: {
    name: "gamla",
    version: "12.0.0",
    description: "Functional programming with async",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/uriva/gamlajs.git",
    },
    bugs: {
      url: "https://github.com/uriva/gamlajs/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("./LICENSE", outDir + "/LICENSE");
    Deno.copyFileSync("./README.md", outDir + "/README.md");
  },
});
