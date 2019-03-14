'use strict';

module.exports = class Parser {
  constructor() {
    this.beforeTags = [];
  } 
  parse(html) {
    let startPos = 0,
      tagIsStart = false,
      tagStartPos = 0,
      tagEndPos = 0,
      inQuote = false;
    const len = html.length;
    let retHtml = '';
    for (let currentPos = 0; currentPos < len; currentPos++) {
      const char = html.charAt(currentPos);
      if (inQuote) {
        if (char !== inQuote) {
          continue;
        } else {
          inQuote = false;
        }
      } else {
        if (char === '"' || char === "'") {
          inQuote = char;
          continue;
        }
      }
      if (char === '<') {
        if (!tagIsStart) {
          // tag is not start, set current as tagStartPos, and continue to the next loop
          tagIsStart = true;
          tagStartPos = currentPos;
          continue;
        } else {
          // tag is start now, if now catch the '<' char
          // then set currentPos as tagStart, escape before substring
          retHtml += this.escapeHtml(html.slice(startPos, currentPos));
          startPos = currentPos;
          tagStartPos = currentPos;
        }
      } else if (char === '>') {
        retHtml += this.escapeHtml(html.slice(startPos, tagStartPos));
        const currentTag = html.slice(tagStartPos, currentPos + 1);
        retHtml += this.parseValidTag(currentTag);
        startPos = currentPos + 1;
        tagIsStart = false;
        tagEndPos = currentPos;
        continue;
      }
    }
    retHtml += this.escapeHtml(html.slice(tagEndPos+1, len));
    return retHtml;
  }

  spaceIndex(html) {
    var reg = /\s|\n|\t/;
    var match = reg.exec(html);
    return match ? match.index : -1;
  }

  getTagName(html) {
    var i = this.spaceIndex(html);
    if (i === -1) {
      var tagName = html.slice(1, -1);
    } else {
      var tagName = html.slice(1, i + 1);
    }
    tagName = tagName.trim().toLowerCase();
    if (tagName.slice(0, 1) === "/") tagName = tagName.slice(1);
    if (tagName.slice(-1) === "/") tagName = tagName.slice(0, -1);
    return tagName;
  }

  parseValidTag(html) {
    const tagName = this.getTagName(html);
    if (tagName !== 'x') {
      return this.escapeHtml(html);
    } else {
      if (html.startsWith('</')) {
        if (this.beforeTags.length === 0) {
          return this.escapeHtml(html);
        }
        return `</${this.beforeTags.pop()}>`
      } else {
        const legalAttr = [ 'href', 'src', 'code' ];
        const attrs = this.parseAttr(html);
        const validAttrs = attrs.filter(f => legalAttr.includes(f.key));
        if (html[html.length -2] === '/') {
          const attr = validAttrs.filter(f => f.key === 'src');
          // self close tag must be img
          if (!attr.length) {
            return this.escapeHtml(html);
          } else {
            const srcValue = attr[0]['value'];
            if (/^(https|http):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/.test(srcValue)) {
              return `<img src="${attr[0]['value']}">`
            } else {
              return this.escapeHtml(html);
            }
          }
        } else {
          const attr = validAttrs.filter(f => f.key === 'href' || f.key === 'code');
          if (!attr.length) {
            this.beforeTags.push('span');
            return `<span>`;
          } else {
            const { key, value } = attr[0];
            if (key === 'href') {
              if (/^(https|http):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/.test(value)) {
                this.beforeTags.push('a');
                return `<a href="${value}" target="_blank" rel="nofollow">`;
              } else {
                return this.escapeHtml(html);
              }
            } else {
              this.beforeTags.push('code');
              return `<code class="language-${value}">`
            }
          }
        }
      }
    }
  }

  parseAttr(html) {
    const attrs = html.split(' ');
    return attrs.reduce((result, current, index) => {
      if(index > 0) {
        if (index === attrs.length - 1) {
          if (current[current.length - 2] === '/') {
            current = current.substr(0, current.length -2);
          } else {
            current = current.substr(0, current.length -1);
          }
        }
        let [key, value] = current.split('=');
        if (key && value && value[0] === '"' && value[value.length - 1] === '"') {
          value = value.substr(1, value.length - 2);
          if (value) {
            result.push({key, value});
          }
        }
        return result;
      } else {
        return result;
      }
    }, []);
  }

  escapeHtml(html) {
    return html.replace('<', '&lt;').replace('>', '&gt;');
  }
}
