//搜索
const search = (key) => {
  let data = `keyword=${key}`
  let response = POST("http://api.midukanshu.com/fiction/search/search",{data})
  let array = []
  let $ = JSON.parse(response)
  $.data.forEach((child) => {
    array.push({
      name: child.title,
      author: child.author,
      cover: child.cover,
      detail: JSON.stringify({
          url: "https://api.midukanshu.com/fiction/book/getDetail",
          bid: child.book_id
      })    
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let args = JSON.parse(url)
    let data = "book_id="+args.bid
    let response = POST(args.url,{data})
    let $ = JSON.parse(response).data
    let book = {
      update: $.updateStatus.replace("更新于",""),
      catalog: `https://book.midukanshu.com/book/chapter_list/100/${$.book_id}.txt`
    }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response)
  let array = []
  $.forEach((chapter,index) => {    
       array.push({
        name: chapter.title,
        url: `https://book.midukanshu.com/book/chapter/segment/master/${chapter.bookId}_${chapter.chapterId}.txt?md5=${chapter.content_md5}`,
        vip: false
      })         
    })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let $ = JSON.parse(GET(url))
    let cArr = $.map( (item, index) => {return item.content})
  return cArr.join("\n")
}


var bookSource = JSON.stringify({
  name: "米读看书",
  url: "api.midukanshu.com",
  version: 100
})
