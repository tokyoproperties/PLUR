/**
 * global.d.ts
 * Ambient module declarations for asset types TypeScript can't resolve
 * on its own (CSS/SCSS modules imported for side effects or as
 * class-name maps on web).
 */

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css';
declare module '*.scss';
