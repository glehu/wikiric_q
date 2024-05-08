const wikiricUtils = {
  /**
   * Converts an HTML document to a human-readable string
   *
   * @param html
   * @returns {string}
   */
  htmlToString: function (html) {
    const dParser = new DOMParser()
    const parsed = dParser.parseFromString(html, 'text/html')
    const elem = parsed.documentElement
    const strArray = []
    let type
    let level
    let prefix
    let str
    let str2
    let len
    elem.childNodes.forEach((c) => {
      if (c.childNodes && c.childNodes.length > 0) {
        c.childNodes.forEach((cc) => {
          type = this.htmlTagNameToType(cc.tagName)
          switch (type) {
            case 'heading':
              prefix = ''
              level = this.htmlGetHeadingLevel(cc.tagName)
              if (level) {
                for (let i = 0; i < level; i++) {
                  prefix += '#'
                }
              }
              str = `${prefix} ${cc.innerText}`
              str2 = ''
              len = parseInt((str.length * 1.4).toString())
              for (let i = 0; i < len; i++) {
                str2 += '_'
              }
              strArray.push(`\n \n${str}\n${str2}`)
              break
            case 'line':
              strArray.push('---')
              break
            case 'blockquote':
              this._htmlParseChildNodes(cc, strArray, type)
              break
            case 'list':
              this._htmlParseChildNodes(cc, strArray, type)
              break
            default:
              strArray.push(cc.innerText)
          }
        })
      }
    })
    return strArray.join('\n').trim()
  },
  /**
   *
   * @param {ChildNode} c
   * @param {Array<String>} strArray
   * @param {String} parentType
   * @private
   */
  _htmlParseChildNodes: function (c, strArray, parentType) {
    let str
    c.childNodes.forEach((cc) => {
      const type = this.htmlTagNameToType(cc.tagName)
      str = ''
      switch (type) {
        case 'list' || 'blockquote':
          // Recursively call function to add each list item individually
          this._htmlParseChildNodes(cc, strArray, type)
          break
        case 'listitem':
          strArray.push(`* ${cc.innerText}`)
          break
        default:
          if (parentType === 'blockquote') {
            str = '[!] ' // Prepend exclamation mark
            parentType = '' // Cancel operation after first one
          }
          str += `${cc.innerText}`
          strArray.push(str)
      }
    })
  },
  /**
   * Converts an HTML element's tag name (e.g. H1)
   * ...to its type (e.g. heading)
   *
   * @param {String} tagName
   * @returns {string}
   */
  htmlTagNameToType: function (tagName) {
    if (tagName == null || tagName === '') {
      return ''
    }
    // Sanitize
    tagName = tagName.toLowerCase()
    // Check and return type
    const headingMatches = tagName.match(/h[1-6]/)
    if (headingMatches && headingMatches.length > 0) {
      return 'heading'
    } else if (tagName === 'p') {
      return 'paragraph'
    } else if (tagName === 'span') {
      return 'span'
    } else if (tagName === 'blockquote') {
      return tagName
    } else if (tagName === 'hr') {
      return 'line'
    } else if (tagName === 'code') {
      return tagName
    } else if (tagName === 'pre') {
      return 'code'
    } else if (tagName === 'ul' || tagName === 'ol') {
      return 'list'
    } else if (tagName === 'li') {
      return 'listitem'
    }
  },
  /**
   *
   * @param {String} tagName
   */
  htmlGetHeadingLevel: function (tagName) {
    // Sanitize
    tagName = tagName.toLowerCase()
    const headingMatches = [...tagName.matchAll(/h([1-6])/gm)]
    if (headingMatches && headingMatches.length > 0) {
      return headingMatches[0][1]
    }
  }
}
export default wikiricUtils
