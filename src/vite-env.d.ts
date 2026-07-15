/// <reference types="vite/client" />

declare module '*.mjs?url' {
  const src: string;
  export default src;
}

declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, config: Record<string, unknown>);
    loadFromHTML(elements: NodeListOf<Element> | HTMLElement[]): void;
    loadFromImages(imagesHref: string[]): void;
    updateFromImages(imagesHref: string[]): void;
    on(event: string, callback: (e: { data: number }) => void): void;
    destroy(): void;
    getCurrentPageIndex(): number;
    flip(pageIndex: number): void;
    flipNext(): void;
    flipPrev(): void;
  }
}

