/// <reference path='require.d.ts' />

declare module "block-elements" {
  var blockElements: string[];
  export = blockElements;
}

declare module "component-closest" {
  function closest(element: Node, selector: string, checkYoSelf?: boolean, root?: HTMLElement): HTMLElement;
  export = closest;
}

declare module "debug" {
  function debug(namespace: string): (format: string, ...args: any[]) => void;
  export = debug;
}


// copied from TypeScript's `lib.es6.d.ts`
interface IteratorResult<T> {
    done: boolean;
    value?: T;
}

interface Iterator<T> {
    next(): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
    throw?(e?: any): IteratorResult<T>;
}

declare module "range-iterator" {
  interface AcceptNode {
    (node: Node): any;
  }

  function RangeIterator(range: Range,
    whatToShow?: number | NodeFilter | AcceptNode,
    filter?: NodeFilter | AcceptNode,
    entityReferenceExpansion?: boolean): Iterator<Node>;

  export = RangeIterator;
}
