'use strict';
const assert = require("assert");
const xFilter = require('./index');

describe("test Xss filter", function() {
  it("xFilter", () => {
    assert.equal(xFilter(), "");
    assert.equal(xFilter(null), "");
    assert.equal(xFilter(123), "123");
    assert.equal(xFilter({ a: 1111 }), "[object Object]");


    assert.equal(xFilter("<o>abcd</o>"), "&lt;o&gt;abcd&lt;/o&gt;");
    assert.equal(xFilter("<xFilter>"), "&lt;xFilter&gt;");
    assert.equal(xFilter('<xFilter o="x">'), '&lt;xFilter o="x"&gt;');

    assert.equal(xFilter("<>>"), "&lt;&gt;&gt;");
    assert.equal(xFilter("<scri" + "pt>"), "&lt;script&gt;");

  
  });
  it("xTag", () => {
    assert.equal(xFilter("<x>abcd</x>"), "<span>abcd</span>");
    assert.equal(xFilter('<x src="adf">abcd</x>'), "<span>abcd</span>");
    assert.equal(xFilter('<x href="https://www.baidu.com">abcd</x>'), '<a href="https://www.baidu.com" target="_blank" rel="nofollow">abcd</a>');
    assert.equal(xFilter('<x src="https://www.baidu.com"/>'), '<img src="https://www.baidu.com">');
    assert.equal(xFilter('<x code="javascript">var</x>'), '<code class="language-javascript">var</code>');

    assert.equal(xFilter('<x href="javascript:alert(123)">abcd</x>'), '&lt;x href="javascript:alert(123)"&gt;abcd&lt;/x&gt;');
    assert.equal(xFilter('<x src="htt://www.baidu.com"/>'), '&lt;x src="htt://www.baidu.com"/&gt;');
    assert.equal(xFilter('<x code="javascript"/>var</x>'), '&lt;x code="javascript"/&gt;var&lt;/x&gt;');
  })
})