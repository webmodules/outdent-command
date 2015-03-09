/// <reference path='require.d.ts' />

/**
 * TypeScript dependencies.
 */

import AbstractCommand = require('abstract-command');
import closest = require('component-closest');
import RangeIterator = require('range-iterator');
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

    var startContainer = range.startContainer;
    var startOffset = range.startOffset;
    var endContainer = range.endContainer;
    var endOffset = range.endOffset;

    var next;
    var iterator = RangeIterator(range, (node) => 0 === node.childNodes.length);

    while (!(next = iterator.next()).done) {
      block = closest(next.value, blockSel, true);
      debug('closest "block element" node: %o', block);
      if (block && block.parentNode.nodeName === 'BLOCKQUOTE' && -1 === blocks.indexOf(block)) {
        blocks.push(block);
      }
    }

    if (blocks.length > 0) {
      debug('need to unwrap %o "block elements" from parent BLOCKQUOTE', blocks.length);

      var parent = range.commonAncestorContainer;

      // find the first parent node that's not a BLOCKQUOTE
      while (parent && (parent.nodeType !== 1 || parent.nodeName === 'BLOCKQUOTE')) {
        parent = parent.parentNode;
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

      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
    }
  }

  protected _queryState(range: Range): boolean {
    var next;
    var iterator = RangeIterator(range, (node) => 0 === node.childNodes.length);

    while (!(next = iterator.next()).done) {
      var blockquote: HTMLElement = closest(next.value, 'blockquote', true);
      if (!blockquote) return false;
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
