const baseUrl = "https://app.kujiang.com"

//搜索
const search = (key) => {
  let response = GET(`${baseUrl}/v1/book/search?keyword=${encodeURI(key)}`)
  let array = []
  let $ = JSON.parse(response)
  $.body.forEach((child) => {
    array.push({
      name: child.v_book,
      author: child.penname,
      cover: child.img_url,
      detail: `${baseUrl}/v1/book/get_book_infos?book=${child.book}`,
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response).body.bookinfo
  let book = {
    summary: $.intro,
    status: $.fullflag == 0 ? '连载' : '完结',
    category: $.tags,
    words: $.public_size,
    update: timestampToTime($.u_time),
    lastChapter: $.v_u_chapter,
    catalog: `${baseUrl}/v1/book/catalog?book=${$.book}`
  }
  return JSON.stringify(book)
}

//转换更新时间 时间戳
function timestampToTime(timestamp) {
        var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1):date.getMonth()+1) + '-';
        var D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())+ ' ';
        var h = (date.getHours() < 10 ? '0'+date.getHours():date.getHours())+ ':';
        var m = (date.getMinutes() < 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
        var s = date.getSeconds() < 10 ? '0'+date.getSeconds():date.getSeconds();
        return Y+M+D+h+m+s;
}

//目录
const catalog = (url) => {
  let response = GET(url,{headers:
  ["platform: android","version: 3.8.8"]
  })
  let $ = JSON.parse(response)
  let array = []
  $.body.catalog.forEach((booklet) => {
    array.push({ name: booklet.v_volumn })
    booklet.chapters.forEach((chapter) => {
      array.push({
        name: chapter.v_chapter,
        url: `https://www.kujiang.com/api/v2/read?book=${url.query('book')}&chapter=${chapter.chapter}`
      })
    })
  })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let $ = JSON.parse(GET(url,{headers:
  ["platform: android","version: 3.8.8"]
  }))
    return $.data.content
}

var bookSource = JSON.stringify({
  name: "酷匠",
  url: "kujiang.com",
  version: 100
})
