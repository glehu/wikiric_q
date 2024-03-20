const wikiricUtils = {
  htmlToString: function (html) {
    return new DOMParser()
    .parseFromString(html, 'text/html').documentElement.textContent
  }
}
export default wikiricUtils
