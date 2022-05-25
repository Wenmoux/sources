const baseUrl = "https://tongrenquan.org"

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let response = POST(`${baseUrl}/e/search/indexstart.php`,{data:`keyboard=${ENCODE(key,'gb2312')}&show=title&classid=0`})
  let array = []
  let $ = HTML.parse(response)
    $('.books > div').forEach((child) => {
        let $ = HTML.parse(child)
      array.push({
        name: $('h3').text(),
        author: $('.booknews').remove('label').text().replace("作者：",""),
        cover: `${baseUrl}${$('img').attr('src')}`,
        detail: `${baseUrl}${$('h3 > a').attr('href')}`
      })
    })
  return JSON.stringify(array)
}

/**
 * 详情
 * @params {string} url
 * @returns {[{summary, status, category, words, update, lastChapter, catalog}]}
 */
const detail = (url) => {
  let response = GET(url)
  let $ = HTML.parse(response)
  let book = {
    summary: $('.infos > p').text(),
    catalog: url
  }
  return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
  let response = GET(url)
  let $ = HTML.parse(response)
  let array = []
   $('.book_list > ul > li').forEach(chapter => {
     let $ = HTML.parse(chapter)
      array.push({
        name: $('a').text(),
        url: `${baseUrl}${$('a').attr('href')}`
      })
    })
  return JSON.stringify(array)
}

/**
 * 章节
 * @params {string} url
 * @returns {string}
 */
const chapter = (url) => {
  let response = GET(url)
  let $ = HTML.parse(response)
  return $('.read_chapterDetail')
}

var bookSource = JSON.stringify({
  name: "同人圈",
  url: "tongrenquan.org",
  version: 100
})
