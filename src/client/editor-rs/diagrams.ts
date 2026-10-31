import DOMPurify from "dompurify";
import { render } from "pele";

/** Show diagrams outside the editable document so the editor keeps full control of its DOM. */
export class Diagrams {
  private readonly panel = document.createElement("section");
  private timer: ReturnType<typeof setTimeout> | undefined;
  private last = "";
  private destroyed = false;

  constructor(container: HTMLElement) {
    this.panel.className = "mde-diagrams";
    this.panel.setAttribute("aria-label", "Diagram previews");
    this.panel.hidden = true;
    container.appendChild(this.panel);
  }

  update(text: string): void {
    if (this.destroyed || text === this.last) return;
    this.last = text;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.draw(text), 250);
  }

  private draw(text: string): void {
    const diagrams = Array.from(text.matchAll(/^\s*```mermaid\s*\n([\s\S]*?)^\s*```\s*$/gm));
    this.panel.replaceChildren();
    this.panel.hidden = diagrams.length === 0;
    if (!diagrams.length) return;
    const heading = document.createElement("h2");
    heading.textContent = "Diagram previews";
    this.panel.append(heading);
    diagrams.forEach((match, index) => {
      const figure = document.createElement("figure");
      try {
        const { svg } = render(match[1]!, {
          idPrefix: `grim-diagram-${index}-`, links: false, images: false,
          fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
          maxWidth: Math.max(300, Math.min(720, this.panel.clientWidth - 48)),
        });
        figure.innerHTML = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
      } catch (error) {
        const message = document.createElement("p");
        message.textContent = `Diagram ${index + 1} could not be rendered: ${error instanceof Error ? error.message : "Invalid diagram"}`;
        figure.append(message);
      }
      this.panel.append(figure);
    });
  }

  destroy(): void {
    this.destroyed = true;
    clearTimeout(this.timer);
    this.panel.remove();
  }
}
