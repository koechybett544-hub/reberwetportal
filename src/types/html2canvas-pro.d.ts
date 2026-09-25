import type { Options } from 'html2canvas';

declare module 'html2canvas-pro' {
  export type Html2CanvasOptions = Partial<Options>;
  function html2canvas(
    element: HTMLElement,
    options?: Partial<Options>
  ): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
