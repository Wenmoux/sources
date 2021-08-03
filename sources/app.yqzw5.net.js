//搜索
const baseurl = "https://app.yqzw5.net/json/api_"
const search = (key) => {
  let response = GET(`${baseurl}search.php?searchkey=${encodeURI(key)}`)
  let array = []
  let $ = JSON.parse(response)
  $.result_rows.forEach((child) => {
    array.push({
      name: child.articlename,
      author: child.author,
      cover: child.img_url,
      detail: `${baseurl}info.php?aid=${child.articleid}`
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url)
    let $ = JSON.parse(response)
    let book = {
        update: $.lastupdate_fmt,
        lastChapter: $.lastchapter,
        catalog: `${baseurl}indexlist.php?aid=${$.articleid}`
    }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response)
  let array = []
  $.chapterrows.forEach((chapter,index) => {    
       array.push({
        name: chapter.chaptername,
        url: `${baseurl}read.php?aid=${url.query("aid")}&cid=${chapter.chapterid}`,
        vip: false
      })         
    })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let $ = JSON.parse(GET(url))
    return $.content
}


var bookSource = JSON.stringify({
  name: "第九中文网",
  url: "app.yqzw5.net",
  version: 100
})
