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

declare module "dom-iterator" {
  class Iterator {
    constructor(node: Node, root?: Node);

    reset(node?: Node): Iterator;
    revisit(revisit?: boolean): Iterator;

    opening(): Iterator;
    atOpening(): boolean;

    closing(): Iterator;
    atClosing(): boolean;

    next(): Node;
    next(expr: number): Node;
    next(expr: string): Node;
    next(expr: (node: Node, peek?: boolean) => boolean): Node;

    prev(): Node;
    prev(expr: number): Node;
    prev(expr: string): Node;
    prev(expr: (node: Node, peek?: boolean) => boolean): Node;

    previous(): Node;
    previous(expr: number): Node;
    previous(expr: string): Node;
    previous(expr: (node: Node, peek?: boolean) => boolean): Node;

    select(expr: number): Iterator;
    select(expr: string): Iterator;
    select(expr: (node: Node, peek?: boolean) => boolean): Iterator;

    selects(node: Node, peek?: boolean): boolean;

    reject(expr: number): Iterator;
    reject(expr: string): Iterator;
    reject(expr: (node: Node, peek?: boolean) => boolean): Iterator;

    rejects(node: Node, peek?: boolean): boolean;

    higher(node: Node): boolean;

    compile(expr: number): (node: Node, peek?: boolean) => boolean;
    compile(expr: string): (node: Node, peek?: boolean) => boolean;
    compile(expr: (node: Node, peek?: boolean) => boolean): (node: Node, peek?: boolean) => boolean;

    peek(): Node;
    peek(expr: number, n?: number): Node;
    peek(expr: string, n?: number): Node;
    peek(expr: (node: Node, peek?: boolean) => boolean, n?: number): Node;

    use(fn: (iterator: Iterator) => void ): Iterator;
  }
  export = Iterator;
}

declare module "node-contains" {
  function contains(node: Node, other: Node): boolean;
  export = contains;
}
