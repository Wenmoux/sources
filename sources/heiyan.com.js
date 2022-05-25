const baseUrl = "https://w1.heiyan.com"

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let response = GET(`http://search.heiyan.com/web/search?queryString=${encodeURI(key)}&highlight=false`)
  let array = []
  let $ = JSON.parse(response)
  $.data.content.forEach((child) => {
    array.push({
      name: child.name,
      author: child.authorname,
      cover: `https://b.heiyanimg.com/book/${child.id}.jpg`,
      detail: `${baseUrl}/book/${child.id}`,
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
    summary: $('meta[property=og:description]').attr('content'),
    status: $('meta[property=og:novel:status]').attr('content'),
    category: $('meta[property=og:novel:category]').attr('content'),
    words: $('div.info > div:nth-child(3)').match('(?<=)(.+?)(?=字)')[0],
    update: $('meta[property=og:novel:update_time]').attr('content'),
    lastChapter: $('meta[property=og:novel:latest_chapter_name]').attr('content'),
    catalog: $('div.more-index > a').attr('href').replace('w1.', 'www.')
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
  $('ul.float-list > li').forEach((chapter) => {
    let $ = HTML.parse(chapter)
    let isvip = $('a.isvip').length != 0
    let bookId = url.match('(?<=chapter\/)(.+?)(?=$)')[0]
    let chapterId = $('a').attr('href').match(`(?<=${bookId}\/)(.+?)(?=$)`)[0]
    array.push({
      name: $('a').text(),
      url: `https://a.heiyan.com/m/ajax/chapter/content/${chapterId}` + `?isvip=${isvip}&bookId=${bookId}&chapterId=${chapterId}`,
      vip: isvip
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
  //VIP章节
  if (url.query('isvip') == 'true') {
    let response = GET(url)
    let $ = JSON.parse(response)

    //未购买返回403和自动订阅地址
    if ($.nopay || $.nologin) throw JSON.stringify({
      code: 403,
      message: `https://w1.heiyan.com/book/${url.query('bookId')}`
    })
    
    return $.chapter.htmlContent
  }
  
  let response = GET(`https://w1.heiyan.com/book/${url.query('bookId')}/${url.query('chapterId')}`)
  let $ = HTML.parse(response)
  return $('.page-content')
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  let response = GET('https://a.heiyan.com/m/ajax/user/info')
  let $ = JSON.parse(response)
  if ($.isMe == undefined) throw JSON.stringify({
    code: 401
  })
  return JSON.stringify({
    basic: [
      {
        name: '账号',
        value: $.userVO.name,
        url: 'https://accounts.heiyan.com/m/people/'
      },
      {
        name: '岩币',
        value: $.balance,
        url: 'https://pay.heiyan.com/m/accounts/pay'
      },
      {
        name: '钻石',
        value: $.shell,
        url: 'https://pay.heiyan.com/m/accounts/pay'
      },
      {
        name: '赠币',
        value: $.coin,
        url: 'https://pay.heiyan.com/m/accounts/pay'
      }
    ],
  })
}


/**
 * 排行榜
 */
const rank = (title, category, page) => {
  let response = GET(`https://search.heiyan.com/m/all?order=${title}&sort=${category}&page=${page + 1}&words=-1&free=&finish=&solicitingid=0`)
  let books = []
  let $ = JSON.parse(response)
  $.data.content.forEach((child) => {
    books.push({
      name: child.name,
      author: child.authorname,
      cover: `https://b.heiyanimg.com/book/${child.id}.jpg`,
      detail: `${baseUrl}/book/${child.id}`,
    })
  })
  return JSON.stringify({
    end: $.data.empty,
    books: books
  })
}

const catagoryAll = [
  { key: "-1", value: "全部" }, { key: "3", value: "历史" }, { key: "5", value: "军事" },
  { key: "6", value: "玄幻" }, { key: "14", value: "奇幻" }, { key: "7", value: "仙侠" },
  { key: "8", value: "武侠" }, { key: "10", value: "科幻" }, { key: "9", value: "游戏" },
  { key: "25", value: "现代" }, { key: "36", value: "古言" }, { key: "54", value: "现实" }
]

const ranks = [
  {
    title: {
      key: '1',
      value: '周人气'
    },
    categories: catagoryAll
  },
  {
    title: {
      key: '2',
      value: '月人气'
    },
    categories: catagoryAll
  },
  {
    title: {
      key: '3',
      value: '总人气'
    },
    categories: catagoryAll
  },
  {
    title: {
      key: '4',
      value: '推荐榜'
    },
    categories: catagoryAll
  },
  {
    title: {
      key: '6',
      value: '字数榜'
    },
    categories: catagoryAll
  },
  {
    title: {
      key: '0',
      value: '总书库'
    },
    categories: catagoryAll
  }
]

var bookSource = JSON.stringify({
  name: "黑岩网",
  url: "heiyan.com",
  version: 105,
  authorization: "https://w1.heiyan.com/accounts/login?backUrl=https://accounts.heiyan.com/m/people/",
  cookies: ["heiyan.com"],
  ranks: ranks
})
