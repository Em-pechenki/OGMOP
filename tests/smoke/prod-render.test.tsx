import { JSDOM } from "jsdom";
import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("prod render", () => {
  it("renders production build without error", () => {
    const html = fs.readFileSync(path.resolve("dist/index.html"), "utf8");
    const dom = new JSDOM(html, {
      url: "https://em-pechenki.github.io/OGMOP/",
      resources: "usable",
      runScripts: "dangerously",
    });
    // wait for async
    setTimeout(() => {
      const root = dom.window.document.getElementById("root");
      console.log("ROOT HTML:", root?.innerHTML?.slice(0, 500));
    }, 3000);
  });
});
