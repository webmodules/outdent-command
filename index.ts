/// <reference path='require.d.ts' />

/**
 * TypeScript dependencies.
 */

import AbstractCommand = require('abstract-command');
import contains = require('node-contains');
import closest = require('component-closest');
import DomIterator = require('dom-iterator');
import FrozenRange = require('frozen-range');
import blockElements = require('block-elements');
import DEBUG = require('debug');

var debug = DEBUG('outdent-command');
var blockSel = blockElements.join(', ');

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

class OutdentCommand extends AbstractCommand {

  constructor(doc: Document = document) {
    super(doc);
    debug('created OutdentCommand: document %o', this.document);
  }

  protected _execute(range: Range, value?: any): void {

    // array to ensure that we only process a particular block node once
    // (in the instance that it has multiple text node children)
    var block: HTMLElement;
    var blocks: HTMLElement[] = [];

    var parent = range.commonAncestorContainer;
    var fr = new FrozenRange(range, parent);

    var next = range.startContainer;
    var end = range.endContainer;
    var iterator = new DomIterator(next).revisit(false);

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

        } else {
          // there's children on both sides of the block, must split the BLOCKQUOTE
          var duplicate = blockquote.cloneNode(false);
          while (block.nextSibling) {
            duplicate.appendChild(block.nextSibling);
          }
          insertAfter(duplicate, blockquote);
          insertAfter(block, blockquote);
        }

        // at this point, if the parent BLOCKQUOTE is empty, then remove it
        if (!blockquote.childNodes.length) {
          debug('removing empty %o element from DOM', blockquote.nodeName);
          blockquote.parentNode.removeChild(blockquote);
        }
      }

      fr.thaw(parent, range);
    }
  }

  protected _queryState(range: Range): boolean {
    var next = range.startContainer;
    var end = range.endContainer;
    var iterator = new DomIterator(next).revisit(false);

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
