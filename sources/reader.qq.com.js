function sp(data) {
  if(data.slice(-3)[0] == 0) {
    da = data.slice(-2)
  } else da = data.slice(-3)
  return da
}

//搜索
const search = (key) => {
  let response = GET(`https://newopensearch.reader.qq.com/wechat?start=0&end=19&keyword=${key}`)
  let $ = JSON.parse(response)
  let array = []
  $.booklist.forEach((child) => {
    array.push({
      name: child.title,
      author: child.author,
      cover: `http://wfqqreader-1252317822.image.myqcloud.com/cover/${sp(child.bid)}/${child.bid}/b_${child.bid}.jpg`,
      detail: `https://wxmini.reader.qq.com/custom/query/bookdetail?bid=${child.bid}`,
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response).data.book
  let book = {
    summary: $.intro,
    status: $.finished == 0 ? '连载' : '完结',
    category: $.category2Name,
    words: $.totalWords,
    update: $.updatetime,
    lastChapter: $.lastChapterName,
    catalog: `https://wxmini.reader.qq.com/book/query/chapterlist?bid=${$.bid}`
  }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response)
  let array = []
  $.data.forEach((chapter) => {
    array.push({
      name: chapter.chapterName,
      url: `https://wxmini.reader.qq.com/book/query/chapter/txt?bid=${url.query('bid')}&cid=${chapter.cid}`,
      vip: chapter.free == 0
    })
  })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response).data
  //未购买返回403和自动订阅地址
  if ($.auth == 0&&$.authType == -1) throw JSON.stringify({
    code: 403,
    message: `https://ubook.reader.qq.com/book-read/${url.query('bid')}/${url.query('cid')}`
    })
  return $.chapterContent
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  let response = GET('https://wxmini.reader.qq.com/user/homepage')
  let $ = JSON.parse(response).data
    return JSON.stringify({
      basic: [
        {
          name: '账号',
          value: $.nickname,
          url: 'https://ubook.reader.qq.com/myself.html'
        },
        {
          name: '书币',
          value: $.balance,
          url: 'https://ubook.reader.qq.com/chongzhi.html',
        }
      ],
      extra: [
        {
          name: '书架',
          type: 'books',
          method: 'bookshelf'
        }
      ]
    })
}

/**
 * 我的书架
 * @param {页码} page 
 */
const bookshelf = (page) => {
  let response = GET(`https://bookshelf.reader.qq.com/cloud/update?__FORXCX=2&clientversion=${Math.round(new Date())}&tid=0&count=0`)
  let $ = JSON.parse(response)
  let books = $.books.map(book => ({
    name: book.title,
    author: book.author,
    cover: `http://wfqqreader-1252317822.image.myqcloud.com/cover/${sp(book.bookid.toString())}/${book.bookid}/b_${book.bookid}.jpg`,
    detail: `https://wxmini.reader.qq.com/custom/query/bookdetail?bid=${book.bookid}`
  }))
  return JSON.stringify({books})
}

//排行榜
const rank = (title, category, page) => {
  let response = GET(`https://wxmini.reader.qq.com/fox/search/subcategory?c2=${category}&order=0&c3=&tag=&free=-1&end=-1&textSize=-1&pageNo=${page+1}&pageSize=20`)
  let $ = JSON.parse(response)
  let books = []
  $.data.dataList.forEach((child) => {
    books.push({
      name: child.title,
      author: child.author,
      cover: child.cover,
      detail: `https://wxmini.reader.qq.com/custom/query/bookdetail?bid=${child.bid}`,
    })
  })
  return JSON.stringify({
    end: $.data.dataList.length == 0,
    books: books
  })
}


const ranks = [
  {
    title: {
      key: '1',
      value: '男生'
    },
    categories: [
      { key: "20001", value: "玄幻" },
      { key: "20005", value: "奇幻" },
      { key: "20010", value: "武侠" },
      { key: "20014", value: "仙侠" },
      { key: "20019", value: "都市" },
      { key: "20065", value: "现实" },
      { key: "20028", value: "历史" },
      { key: "20032", value: "军事" },
      { key: "20050", value: "游戏" },
      { key: "20054", value: "体育" },
      { key: "20042", value: "科幻" },
      { key: "20037", value: "悬疑" },
      { key: "20076", value: "短篇" },
      { key: "20059", value: "轻小说" }
    ]
  },
  {
    title: {
      key: '2',
      value: '女生'
    },
    categories: [
      { key: "30083", value: "短篇" },
      { key: "30055", value: "轻小说" },
      { key: "30013", value: "古代言情" },
      { key: "30020", value: "现代言情" },
      { key: "30001", value: "玄幻言情" },
      { key: "30008", value: "仙侠奇缘" },
      { key: "30031", value: "浪漫青春" },
      { key: "30050", value: "游戏竞技" },
      { key: "30042", value: "科幻空间" },
      { key: "30036", value: "悬疑侦探" },
      { key: "30120", value: "现实生活" }
    ]
  }
]

var bookSource = JSON.stringify({
  name: "QQ阅读",
  url: "reader.qq.com",
  version: 100,
  authorization: 'https://passport.yuewen.com/login.html?appid=1450000221&areaid=1&logintype=4&tabshow=1100&auto=0&ticket=1&returnurl=https://ubook.reader.qq.com/loginSuccess?returnUrl=https://ubook.reader.qq.com/',
  cookies: [".qq.com"],
  ranks: ranks
})
