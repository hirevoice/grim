import "./rs/dom.ts";
import { describe, expect, test } from "bun:test";
import { Diagrams } from "../../src/client/editor-rs/diagrams.ts";

describe("diagram previews", () => {
  test("renders Mermaid and removes the preview when the block is removed", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const diagrams = new Diagrams(host);
    diagrams.update("```mermaid\nflowchart LR\n A --> B\n```");
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(host.querySelector(".pele-node")).not.toBeNull();
    diagrams.update("ordinary text");
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(host.querySelector("section")?.hidden).toBe(true);
    diagrams.destroy();
    expect(host.children.length).toBe(0);
    host.remove();
  });
});
