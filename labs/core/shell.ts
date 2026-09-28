// The static page (built from lab.json) already contains the section head, the themed
// game panel with the lab's root class, a loading line and the exit button. The shell
// finds the stage and swaps the loading line for the game once the lab is ready.
export interface Stage {
  /** The theme root element (e.g. `.lab-golf`), where the game renders. */
  root: HTMLElement;
  /** Call once the first frame is ready: removes the loading line. */
  ready(): void;
}

export function mountLab(rootClass: string): Stage {
  const root = document.querySelector<HTMLElement>(`.${rootClass}`);
  if (!root) throw new Error(`lab root .${rootClass} missing from page`);
  const loading = root.querySelector('.lab-loading');
  return {
    root,
    ready() { loading?.remove(); },
  };
}
