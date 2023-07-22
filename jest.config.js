export default {
  preset: "ts-jest",
  extensionsToTreatAsEsm: [".ts"],
  transform: { "^.+\\.tsx?$": ["ts-jest", { useESM: true }] },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
