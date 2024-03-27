const wikiricUtils = {
  htmlToString: function (html) {
    const dParser = new DOMParser()
    const parsed = dParser.parseFromString(html, 'text/html')
    const elem = parsed.documentElement
    const strArray = []
    elem.childNodes.forEach((c) => {
      if (c.childNodes && c.childNodes.length > 0) {
        c.childNodes.forEach((cc) => {
          strArray.push(cc.innerText)
        })
      }
    })
    return strArray.join('\n').trim()
  }
}
export default wikiricUtils
