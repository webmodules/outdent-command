/// <reference path='require.d.ts' />

/**
 * TypeScript dependencies.
 */

import Command = require('command');

/**
 * JavaScript dependencies.
 */

var contains = require('node-contains');
var closest = require('component-closest');
var unwrap = require('unwrap-node');
var currentRange = require('current-range');
var currentSelection = require('current-selection');
var domIterator = require('dom-iterator');
var FrozenRange = require('frozen-range');
var debug = require('debug')('outdent-command');

/**
 * `OutdentCommand` class is a Command implementation that removes the nearest
 * BLOCKQUOTE element from the DOM.
 *
 * ``` js
 * var outdent = new OutdentCommand();
 * if (outdent.queryEnabled()) {
 *   outdent.execute();
 * }
 * ```
 *
 * @public
 */

class OutdentCommand implements Command {
  public document: Document;

  constructor(doc: Document = document) {
    this.document = doc;
    debug('created OutdentCommand: document %o', this.document);
  }

  execute(range?: Range, value?: any): void {
    var hasRange: boolean = !!(range && range instanceof Range);
    var selection: Selection;

    if (!hasRange) {
      selection = currentSelection(this.document);
      range = currentRange(selection);
    }

    // array to ensure that we only process a particular block node once
    // (in the instance that it has multiple text node children)
    var blocks: HTMLElement[] = [];

    var parent = range.commonAncestorContainer;
    var fr = new FrozenRange(range, parent);

    var next = range.startContainer;
    var end = range.endContainer;
    var iterator = domIterator(next).revisit(false);

    while (next) {
      var block: HTMLElement = closest(next, 'blockquote', true);
      debug('closest "block" node: %o', block);
      if (block && -1 === blocks.indexOf(block)) {
        blocks.push(block);
      }
      if (contains(end, next)) break;
      next = iterator.next(3 /* Node.TEXT_NODE */);
    }

    if (blocks.length > 0) {
      debug('need to remove %o BLOCKQUOTE elements', blocks.length);

      for (var i = 0; i < blocks.length; i++) {
        unwrap(blocks[i]);
      }

      fr.thaw(parent, range);

      if (!hasRange) {
        // when no Range was passed in then we must reset the document's Selection
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  queryEnabled(range?: Range): boolean {
    if (!range) range = currentRange(this.document);
    return !! range;
  }

  queryState(range?: Range): boolean {
    if (!range) range = currentRange(this.document);
    if (!range) return false;

    var next = range.startContainer;
    var end = range.endContainer;
    var iterator = domIterator(next).revisit(false);

    while (next) {
      var blockquote: HTMLElement = closest(next, 'blockquote', true);
      if (!blockquote) {
        return false;
      }
      if (contains(end, next)) break;
      next = iterator.next(3 /* Node.TEXT_NODE */);
    }

    return true;
  }
}

export = OutdentCommand;
