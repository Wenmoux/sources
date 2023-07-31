
//搜索
const search = (key, page) => {
  let response = POST("https://wap.po18.work/s.php",`searchkey=${encodeURI(key)}`)
  let array = []
  let $ = HTML.parse(response)
  $('ul.topul > li').forEach((child) => {
      let $ =HTML.parse(child)
    array.push({
      name: $('h2').text(),
      author: $('.author').text(),
      cover: $('img').attr('src'),
      category:"po18",
      summary:$("p").text(),
      status:$('.lianzai').text(),
      detail: $('a').attr('href'),
    })
  })

  return JSON.stringify(array)
}

//详情
const detail = (url) => {
    url = url.replace(/wap/,"www")
    let response = GET(url)
    let $ = HTML.parse(response)
    let book = {
    update: $("meta[property=og:novel:update_time]").attr("content"),
    category:  $("meta[property=og:novel:category]").attr("content"),
    summary: $("h3.bookinfo_intro").text(),
    lastChapter:  $("meta[property=og:novel:latest_chapter_name]").attr("content"),
    catalog: url
  }
  return JSON.stringify(book)
}
//目录
const catalog = (url) => {
  let response = GET(url)
  let $ = HTML.parse(response)
  let array = []
    $('ul > li').forEach((chapter) => {
      let $ = HTML.parse(chapter)
      name = $('a').text()
      
      array.push({
        name: name,
        url:url+ $('a').attr("href")
      })
    })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    return $("#htmlContent")
}
var bookSource = JSON.stringify({
    name: "海棠书屋",
    url: "www.po18.work",
    version: 100
})
