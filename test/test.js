
var assert = require('assert');
var OutdentCommand = require('../');

describe('OutdentCommand', function () {
  var div;

  afterEach(function () {
    if (div) {
      // clean up...
      document.body.removeChild(div);
      div = null;
    }
  });

  describe('new OutdentCommand()', function () {

    it('should create a `OutdentCommand` instance', function () {
      var outdent = new OutdentCommand();

      assert(outdent instanceof OutdentCommand);
      assert(outdent.document === document);
    });

    describe('execute()', function () {

      it('should remove a BLOCKQUOTE element from parent block', function () {
        div = document.createElement('div');
        div.innerHTML = '<blockquote><p>hello</p></blockquote><p>world!</p>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.firstChild.firstChild, 1);
        range.setEnd(div.firstChild.firstChild.firstChild, 1);
        assert(range.collapsed);

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var outdent = new OutdentCommand();
        outdent.execute();

        // test that we have the expected HTML at this point
        assert.equal('<p>hello</p><p>world!</p>', div.innerHTML);

        // test that the Selection remains intact
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        assert(range.startContainer === div.firstChild.firstChild);
        assert(range.startOffset === 1);
        assert(range.endContainer === div.firstChild.firstChild);
        assert(range.endOffset === 1);
      });

      it('should remove a BLOCKQUOTE element when parent already multiple BLOCKQUOTEs', function () {
        div = document.createElement('div');
        div.innerHTML = '<blockquote><blockquote><blockquote><p>hello</p><p>world!</p></blockquote></blockquote></blockquote>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.firstChild.firstChild.firstChild.firstChild, 2);
        range.setEnd(div.firstChild.firstChild.firstChild.lastChild.firstChild, 2);
        assert(!range.collapsed);
        assert.equal('llowo', range.toString());

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var outdent = new OutdentCommand();
        outdent.execute();

        // test that we have the expected HTML at this point
        assert.equal('<blockquote><blockquote><p>hello</p><p>world!</p></blockquote></blockquote>', div.innerHTML);

        // test that the Selection remains intact
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        assert(range.startContainer === div.firstChild.firstChild.firstChild.firstChild);
        assert(range.startOffset === 2);
        assert(range.endContainer === div.firstChild.firstChild.lastChild.firstChild);
        assert(range.endOffset === 2);
        assert.equal('llowo', range.toString());
      });

      it('should remove bottom P from parent BLOCKQUOTE element', function () {
        div = document.createElement('div');
        div.innerHTML = '<blockquote><p>hello</p><p>world!</p></blockquote>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.lastChild.firstChild, 2);
        range.setEnd(div.firstChild.lastChild.firstChild, 2);
        assert(range.collapsed);

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var outdent = new OutdentCommand();
        outdent.execute();

        // test that we have the expected HTML at this point
        assert.equal('<blockquote><p>hello</p></blockquote><p>world!</p>', div.innerHTML);

        // test that the Selection remains intact
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        assert(range.startContainer === div.lastChild.firstChild);
        assert(range.startOffset === 2);
        assert(range.endContainer === div.lastChild.firstChild);
        assert(range.endOffset === 2);
        assert(range.collapsed);
      });

      it('should remove top P from parent BLOCKQUOTE element', function () {
        div = document.createElement('div');
        div.innerHTML = '<blockquote><p>hello</p><p>world!</p></blockquote>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.firstChild.firstChild, 2);
        range.setEnd(div.firstChild.firstChild.firstChild, 2);
        assert(range.collapsed);

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var outdent = new OutdentCommand();
        outdent.execute();

        // test that we have the expected HTML at this point
        assert.equal('<p>hello</p><blockquote><p>world!</p></blockquote>', div.innerHTML);

        // test that the Selection remains intact
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        assert(range.startContainer === div.firstChild.firstChild);
        assert(range.startOffset === 2);
        assert(range.endContainer === div.firstChild.firstChild);
        assert(range.endOffset === 2);
        assert(range.collapsed);
      });

      it('should remove middle P from parent BLOCKQUOTE element', function () {
        div = document.createElement('div');
        div.innerHTML = '<blockquote><p>foo</p><p>bar</p><p>baz</p></blockquote>';
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);

        // set current selection
        var range = document.createRange();
        range.setStart(div.firstChild.childNodes[1].firstChild, 1);
        range.setEnd(div.firstChild.childNodes[1].firstChild, 1);
        assert(range.collapsed);

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        var outdent = new OutdentCommand();
        outdent.execute();

        // test that we have the expected HTML at this point
        assert.equal('<blockquote><p>foo</p></blockquote><p>bar</p><blockquote><p>baz</p></blockquote>', div.innerHTML);

        // test that the Selection remains intact
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        assert(range.startContainer === div.childNodes[1].firstChild);
        assert(range.startOffset === 1);
        assert(range.endContainer === div.childNodes[1].firstChild);
        assert(range.endOffset === 1);
        assert(range.collapsed);
      });

    });

  });

});
