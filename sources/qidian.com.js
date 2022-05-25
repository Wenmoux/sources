const baseUrl = "https://m.qidian.com"

//搜索
const search = (key) => {
  let response = GET(`https://qqapp.qidian.com/ajax/search/list?kw=${encodeURI(key)}`)
  let array = []
  let $ = JSON.parse(response)
  $.data.bookInfo.records.forEach((child) => {
    array.push({
      name: child.bName,
      author: child.bAuth,
      cover: `https://bookcover.yuewen.com/qdbimg/349573/${child.bid}/180`,
      detail: `https://qqapp.qidian.com/ajax/book/info?bookId=${child.bid}`,
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response).data.bookInfo
  let book = {
    summary: $.desc.replaceAll('<br>','\n'),
    status: $.bookStatus,
    category: $.bookLabels.map((item)=>{ return item.tag}).join(" ")||$.chanName,
    words: $.wordsCnt,
    update: $.updTime,
    lastChapter: $.updChapterName,
    catalog: `https://qqapp.qidian.com/ajax/book/category?bookId=${$.bookId}`
  }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response)
  let array = []
  $.data.vs.forEach((booklet) => {
    array.push({ name: booklet.vN })
    booklet.cs.forEach((chapter) => {
      array.push({
        name: chapter.cN,
        url: `https://qqapp.qidian.com/ajax/chapter/getInfo?debug=1&bookId=${url.query('bookId')}&chapterId=${chapter.id}`,
        vip: chapter.sS == 0
      })
    })
  })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response).data.chapterInfo
  //VIP章节
  if ($.vipStatus == 1) {
    //未购买返回403和自动订阅地址
    if ($.isBuy == 0) throw JSON.stringify({
      code: 403,
      message: `${baseUrl}/book/${url.query('bookId')}/${url.query('chapterId')}`
    })
  }
  return $.content.trim()
}

//个人中心
const profile = () => {
  let response = GET(`${baseUrl}/user`)
  let $ = HTML.parse(response)
  return JSON.stringify({
    basic: [
      {
        name: '账号',
        value: $('div.center-header > p').text(),
        url: 'https://m.qidian.com/user'
      },
      {
        name: '起点币',
        value: $('ul.btn-group > li:last-child > a > output').text(),
        url: 'https://pay.yuewen.com/h5/index?appId=13&areaId=31&returnUrl=http%3A%2F%2Fm.qidian.com%2Fuser%3Ffrom%3Dpay'
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
  let response = GET(`${baseUrl}/meajax/MBookShelf/List?_csrfToken=${COOKIE('_csrfToken')}&pageNum=${page + 1}&pageSize=20&sort=2&gid=-100&gname=`)
  let $ = JSON.parse(response).data
  let books = $.list.map(book => ({
    name: book.bName,
    author: book.bAuth,
    cover: `https://bookcover.yuewen.com/qdbimg/349573/${book.bid}/300`,
    detail: `https://qqapp.qidian.com/ajax/book/info?bookId=${book.bid}`
  }))
  return JSON.stringify({
    end: $.page.totalPage === page + 1,
    books: books
  })
}


//排行榜
const rank = (title, category, page) => {
  let response = GET(`https://www.qidian.com/${title}/chn${category}/page${page + 1}`)
  let $ = HTML.parse(response)
  let pager = $('#page-container')
  let array = []
  $('.book-img-text > ul > li').forEach((child) => {
    let $ = HTML.parse(child)
    array.push({
      name: $('h2').text(),
      author: $('p.author > a.name').text(),
      cover: `https:${$('.book-img-box > a >  img').attr('src')}`,
      detail: `https://qqapp.qidian.com/ajax/book/info?bookId=${$('.book-img-box > a').attr('data-bid')}`,
    })
  })
  return JSON.stringify({
    end: pager.attr('data-page') === pager.attr('data-pagemax'),
    books: array
  })
}

const ranks = [
  {
    title: {
      key: 'rank/yuepiao',
      value: '起点月票榜'
    },
    categories: [
      { key: "-1", value: "全部" },
      { key: "21", value: "玄幻" },
      { key: "1", value: "奇幻" },
      { key: "2", value: "武侠" },
      { key: "22", value: "仙侠" },
      { key: "4", value: "都市" },
      { key: "5", value: "历史" },
      { key: "6", value: "军事" },
      { key: "7", value: "游戏" },
      { key: "8", value: "体育" },
      { key: "9", value: "科幻" },
      { key: "10", value: "悬疑" },
      { key: "12", value: "轻小说" },
      { key: "0", value: "VIP新作" }
    ]
  },
  {
    title: {
      key: 'rank/hotsales',
      value: '24小时热销榜'
    },
    categories: [
      { key: "-1", value: "全部" },
      { key: "21", value: "玄幻" },
      { key: "1", value: "奇幻" },
      { key: "2", value: "武侠" },
      { key: "22", value: "仙侠" },
      { key: "4", value: "都市" },
      { key: "5", value: "历史" },
      { key: "6", value: "军事" },
      { key: "7", value: "游戏" },
      { key: "8", value: "体育" },
      { key: "9", value: "科幻" },
      { key: "10", value: "悬疑" },
      { key: "12", value: "轻小说" }
    ]
  },
  {
    title: {
      key: 'rank/readIndex',
      value: '阅读指数榜'
    },
    categories: [
      { key: "-1", value: "全部" },
      { key: "21", value: "玄幻" },
      { key: "1", value: "奇幻" },
      { key: "2", value: "武侠" },
      { key: "22", value: "仙侠" },
      { key: "4", value: "都市" },
      { key: "5", value: "历史" },
      { key: "6", value: "军事" },
      { key: "7", value: "游戏" },
      { key: "8", value: "体育" },
      { key: "9", value: "科幻" },
      { key: "10", value: "悬疑" },
      { key: "12", value: "轻小说" }
    ]
  },
  {
    title: {
      key: 'rank/signnewbook',
      value: '签约作者新书榜'
    },
    categories: [
      { key: "-1", value: "全部" },
      { key: "21", value: "玄幻" },
      { key: "1", value: "奇幻" },
      { key: "2", value: "武侠" },
      { key: "22", value: "仙侠" },
      { key: "4", value: "都市" },
      { key: "5", value: "历史" },
      { key: "6", value: "军事" },
      { key: "7", value: "游戏" },
      { key: "8", value: "体育" },
      { key: "9", value: "科幻" },
      { key: "10", value: "悬疑" },
      { key: "12", value: "轻小说" }
    ]
  },
  {
    title: {
      key: 'mm/rank/yuepiao',
      value: '起点月票榜 · 女生'
    },
    categories: [
      { key: "-1", value: "全部" },
      { key: "21", value: "古言" },
      { key: "22", value: "现言" },
      { key: "23", value: "幻言" },
      { key: "0", value: "VIP新作" }
    ]
  },
  {
    title: {
      key: 'mm/rank/hotsales',
      value: '24小时热销榜 · 女生'
    },
    categories: [
      { key: "-1", value: "全部" }
    ]
  },
  {
    title: {
      key: 'mm/rank/readIndex',
      value: '阅读指数榜 · 女生'
    },
    categories: [
      { key: "-1", value: "全部" },
      { key: "80", value: "古代言情" },
      { key: "81", value: "仙侠奇缘" },
      { key: "82", value: "现代言情" },
      { key: "83", value: "浪漫青春" },
      { key: "84", value: "玄幻言情" },
      { key: "85", value: "悬疑推理" },
      { key: "86", value: "科幻空间" },
      { key: "88", value: "游戏竞技" }
    ]
  },
  {
    title: {
      key: 'mm/rank/signnewbook',
      value: '签约作者新书榜 · 女生'
    },
    categories: [
      { key: "-1", value: "全部" },
      { key: "80", value: "古代言情" },
      { key: "81", value: "仙侠奇缘" },
      { key: "82", value: "现代言情" },
      { key: "83", value: "浪漫青春" },
      { key: "84", value: "玄幻言情" },
      { key: "85", value: "悬疑推理" },
      { key: "86", value: "科幻空间" },
      { key: "88", value: "游戏竞技" }
    ]
  }
]

var bookSource = JSON.stringify({
  name: "起点中文网",
  url: "qidian.com",
  version: 112,
  authorization: "https://passport.yuewen.com/yuewen.html?areaid=1&appid=13&source=m",
  cookies: [".qidian.com", ".yuewen.com"],
  ranks: ranks
})
