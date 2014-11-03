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
var currentRange = require('current-range');
var currentSelection = require('current-selection');
var setRange = require('selection-set-range');
var isBackward = require('selection-is-backward');
var domIterator = require('dom-iterator');
var FrozenRange = require('frozen-range');
var blockSel = require('block-elements').join(', ');
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
    var backward: boolean;
    var selection: Selection;

    if (!hasRange) {
      selection = currentSelection(this.document);
      backward = isBackward(selection);
      range = currentRange(selection);
    }

    // array to ensure that we only process a particular block node once
    // (in the instance that it has multiple text node children)
    var block: HTMLElement;
    var blocks: HTMLElement[] = [];

    var parent = range.commonAncestorContainer;
    var fr = new FrozenRange(range, parent);

    var next = range.startContainer;
    var end = range.endContainer;
    var iterator = domIterator(next).revisit(false);

    while (next) {
      block = closest(next, blockSel, true);
      debug('closest "block element" node: %o', block);
      if (block && block.parentNode.nodeName === 'BLOCKQUOTE' && -1 === blocks.indexOf(block)) {
        blocks.push(block);
      }
      if (contains(end, next)) break;
      next = iterator.next(3 /* Node.TEXT_NODE */);
    }

    if (blocks.length > 0) {
      debug('need to unwrap %o "block elements" from parent BLOCKQUOTE', blocks.length);

      if (contains(parent, blocks[0])) {
        parent = parent.parentNode;
        debug('setting `parent` to %o', parent);
      }

      var blockquote: HTMLElement;
      for (var i = blocks.length - 1; i >= 0; i--) {
        block = blocks[i];
        blockquote = <HTMLElement>block.parentNode;

        if (!block.nextSibling) {
          // block is at the end of the BLOCKQUOTE, insert after
          insertAfter(block, blockquote);
        } else if (!block.previousSibling) {
          // block is at the beginning of the BLOCKQUOTE, insert before
          blockquote.parentNode.insertBefore(block, blockquote);
        }

        // at this point, if the parent BLOCKQUOTE is empty, then remove it
        if (!blockquote.childNodes.length) {
          debug('removing empty %o element from DOM', blockquote.nodeName);
          blockquote.parentNode.removeChild(blockquote);
        }
      }

      fr.thaw(parent, range);

      if (!hasRange) {
        // when no Range was passed in then we must reset the document's Selection
        setRange(selection, range, backward);
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

function insertAfter(newElement, targetElement) {
  var parent = targetElement.parentNode;

  if (parent.lastChild === targetElement) {
    parent.appendChild(newElement);
  } else {
    parent.insertBefore(newElement, targetElement.nextSibling);
  }
}

export = OutdentCommand;
