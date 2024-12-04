import * as nfsp from "node:fs/promises";
import * as np from "node:path";

for await (const entry of await nfsp.opendir("./dist/esm", {
  recursive: true,
})) {
  if (entry.name.endsWith(".js")) {
    const filename = np.join(entry.parentPath, entry.name);
    await nfsp.rename(filename, filename.replace(/\.js$/, ".mjs"));
  }
}
