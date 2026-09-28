// One row per lab: route number, server-rendered game root class, theme slug, and whether
// the theme draws a panel box-shadow / title text-shadow (guards against resets overriding them).
export const LABS = [
  { n: '01', panelShadow: true, titleShadow: true, root: 'scale-arena', slug: 'arena' },
  { n: '02', panelShadow: false, titleShadow: false, root: 'magnitude-run', slug: 'blueprint' },
  { n: '03', panelShadow: true, titleShadow: false, root: 'lab-eval', slug: 'bureau' },
  { n: '04', panelShadow: true, titleShadow: true, root: 'lab-forge', slug: 'forge' },
  { n: '05', panelShadow: true, titleShadow: true, root: 'lab-ops', slug: 'siege' },
  { n: '06', panelShadow: true, titleShadow: true, root: 'lab-golf', slug: 'green' },
  { n: '07', panelShadow: true, titleShadow: false, root: 'lab-overfit', slug: 'atelier' },
  { n: '08', panelShadow: true, titleShadow: true, root: 'lab-attn', slug: 'noir' },
  { n: '09', panelShadow: true, titleShadow: true, root: 'lab-foundry', slug: 'abyss' },
  { n: '10', panelShadow: true, titleShadow: true, root: 'lab-galaxy', slug: 'cosmos' },
  { n: '11', panelShadow: true, titleShadow: true, root: 'lab-vision', slug: 'darkroom' },
  { n: '12', panelShadow: true, titleShadow: true, root: 'lab-rl', slug: 'arcade' },
];
