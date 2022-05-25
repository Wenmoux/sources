const baseUrl = "https://m.tadu.com"

const apiUrl = "http://211.151.212.66"

const headerPrefix = ["X-Client: version=6.6.68.1673", "COOKIE:sessionid=cc3bedf27c3148e28274e4887e1e3a3a"]

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let response = GET(`${apiUrl}/ci/search/result?searchcontent=${encodeURI(key)}&page=1&type=3&readLike=0&searchType=3`, {headers: headerPrefix})
  let array = []
  let $ = JSON.parse(response)
  $.data.bookList.forEach((child) => {
    array.push({
      name: child.name,
      author: child.author,
      cover: child.picUrl,
      detail: `${apiUrl}/ci/book/info?bookId=${child.bookId}`,
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
  let response = GET(url, {headers: headerPrefix})
  let $ = JSON.parse(response)
  let book = {
    summary: $.data.bookInfo.intro,
    status: $.data.bookInfo.isSerial ? "连载中" : "已完结",
    category: $.data.bookInfo.categoryName,
    words: $.data.bookInfo.numOfChars.replace('字', ''),
    update: $.data.bookInfo.newPartUpdateDate,
    lastChapter: $.data.bookInfo.newPartTitle,
    catalog: `${apiUrl}/ci/qingmeng/book/directory/list?book_id=${$.data.bookInfo.id}&sort=asc`
  }
  return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
  let response = GET(url, {headers: headerPrefix})
  let $ = JSON.parse(response)
  let array = []
  $.data.chapters.forEach((chapter) => {
    array.push({
      name: chapter.chapterName,
      url: `http://media3.tadu.com/${chapter.chapterUrl.replace(".tdz",".txt")}`
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
  return response.trim()
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  let response = GET(`https://m.tadu.com/auth/user/personalCenter`)
  let $ = HTML.parse(response)
  if ($('section.third').length != 0) throw JSON.stringify({
    code: 401
  })
  return JSON.stringify({
    basic: [
      {
        name: '账号',
        value: $('div.logged > h1').text(),
        url: 'https://m.tadu.com/auth/user/personalCenter'
      },
      {
        name: '塔豆',
        value: $('div.con_top.clearfix > p > span').text(),
        url: 'http://m.tadu.com/auth/charge/alipay'
      },
      {
        name: '塔券',
        value: $('div.con_column.con_taquan > a > p > span').text(),
        url: 'http://m.tadu.com/auth/charge/alipay'
      },
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
  let response = GET(`http://m.tadu.com/auth/my-bookshelf`)
  let $ = HTML.parse(response)
  let books = []
  $('section.book_list.rank-list').forEach((book) => {
    let $ = HTML.parse(book)
    let bookId = $('a').attr('href').match(/(?<=book\/)(.+?)(?=\/)/)[0]
    books.push({
      name: $('h2.text_over').text(),
      author: $('span.auther').text(),
      cover: $('a > img').attr('data-src'),
      detail: `${apiUrl}/ci/book/info?bookId=${bookId}`,
    })
  })
  return JSON.stringify({
      end: true,
      books: books
  })
}

/**
 * 排行榜
 */
const rank = (title, category, page) => {
  let response = GET(`${apiUrl}/ci/categories/secondCategorys/?categoryid=${category}&page=${page + 1}&thirdcategory=0&activitytype=0&bookstatus=0&sorttype=0&chars=0&publishDate=&readingAge=1&bookType=0`, {headers: headerPrefix})
  let books = []
  let $ = JSON.parse(response)
  $.data.bookList.forEach((child) => {
    books.push({
      name: child.title,
      author: child.authors,
      cover: child.coverImage,
      detail: `${apiUrl}/ci/book/info?bookId=${child.bookId}`,
    })
  })
  return JSON.stringify({
    end: $.data.page == $.data.sumPage,
    books: books
  })
}

const ranks = [
  {
    title: {
      key: '0',
      value: '男频'
    },
    categories: [
      { "key": "99", "value": "东方玄幻" }, { "key": "103", "value": "现代都市" }, { "key": "135", "value": "脑洞创意" },
      { "key": "108", "value": "历史架空" }, { "key": "113", "value": "军事战争" }, { "key": "112", "value": "游戏竞技" },
      { "key": "109", "value": "武侠仙侠" }, { "key": "111", "value": "科幻末世" }, { "key": "128", "value": "灵异玄幻" },
      { "key": "107", "value": "西方奇幻" }, { "key": "281", "value": "短篇小说" }
    ]
  },
  {
    title: {
      key: '1',
      value: '女频'
    },
    categories: [
      { "key": "129", "value": "古代言情" }, { "key": "133", "value": "幻想言情" }, { "key": "104", "value": "现代言情" },
      { "key": "105", "value": "浪漫青春" }, { "key": "288", "value": "悬疑小说" }, { "key": "291", "value": "短篇小说" }
    ]
  },
  {
    title: {
      key: '2',
      value: '出版'
    },
    categories: [
      { "key": "81", "value": "现代都市" }, { "key": "83", "value": "青春文学" }, { "key": "85", "value": "悬疑灵异" },
      { "key": "88", "value": "励志成功" }, { "key": "115", "value": "官场沉浮" }, { "key": "92", "value": "职场商战" },
      { "key": "86", "value": "铁血军事" }, { "key": "84", "value": "历史风云" }, { "key": "102", "value": "影视娱乐" },
      { "key": "32", "value": "经管理财" }, { "key": "121", "value": "教育教辅" }, { "key": "82", "value": "纪实传记" },
      { "key": "4", "value": "奇幻科幻" }, { "key": "87", "value": "生活休闲" }, { "key": "10", "value": "武侠仙侠" },
      { "key": "89", "value": "童话寓言" }, { "key": "3", "value": "社科科普" }, { "key": "90", "value": "外国名著" },
      { "key": "91", "value": "古典名著" }, { "key": "93", "value": "当代文学" }, { "key": "138", "value": "两性伦理" },
      { "key": "139", "value": "言情小说" }
    ]
  },
  {
    title: {
      key: '3',
      value: '二次元'
    },
    categories: [
      { "key": "271", "value": "异能 • 幻想" }, { "key": "272", "value": "校园 • 青春" }, { "key": "273", "value": "动漫 • 同人" },
      { "key": "274", "value": "日常 • 变身" }, { "key": "275", "value": "剑与魔法" }
    ]
  }
]

var bookSource = JSON.stringify({
  name: "塔读文学",
  url: "tadu.com",
  version: 105,
  authorization: "https://m.tadu.com/auth/user/personalCenter",
  cookies: ["tadu.com", "m.tadu.com"],
  ranks: ranks
})
