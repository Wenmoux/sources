const baseUrl = 'http://m.ebtang.com/m'

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
    let response = GET(`${baseUrl}/book/search?searchName=${encodeURI(key)}&visit=1`)
    let $ = HTML.parse(response)
    let books = $('#bookList > li').map(book => ({
        name: book.attr('d-name').replace(/<[^>]+>/g, ""),
        author: book.attr('d-nick'),
        cover: book.attr('d-cover'),
        detail: `${baseUrl}/book/${book.attr('d-id')}?visit=1`
    }))
    return JSON.stringify(books)
}

/**
 * 详情
 * @params {string} url
 * @returns {[{summary, status, category, words, update, lastChapter, catalog}]}
 */
const detail = (url) => {
    let $ = HTML.parse(GET(url))('#bookDetail')
    let book = {
        summary: $.attr('d-info'),
        status: $.attr('d-finish') === '0' ? '连载' : '完结',
        category: $.attr('d-sort'),
        words: $.attr('d-words'),
        update: $.attr('d-lasttime'),
        lastChapter: $.attr('d-lasttitle'),
        catalog: `${baseUrl}/book/${$.attr('d-id')}/directory`
    }
    return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
    let $ = HTML.parse(GET(url))
    let bookId = $('#bookDetail').attr('d-id')
    let chapters = $('.chapter').map(chapter => ({
        name: chapter.attr('d-title'),
        url: `${baseUrl}/book/readbook/${bookId}/${chapter.ChapterId}`,
        vip: chapter.attr('d-vip') !== "0"
    }))
    return JSON.stringify(chapters)
}

/**
 * 章节
 * @params {string} url
 * @returns {string}
 */
const chapter = (url) => {
    let $ = JSON.parse(GET(url))
    //未购买返回403和自动订阅地址
    // if ($('.readFeesBtn_VIP')) throw JSON.stringify({
    //     code: 403,
    //     message: url
    // })
    return $.bookChapter.content
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
    let response = GET('http://m.ebtang.com/user/notify/number')
    if (response === "") return
    let $ = JSON.parse(response)
    response = GET(`${baseUrl}/user/index/${$.userId}`)
    return JSON.stringify({
        basic: [
            {
                name: '账号',
                value: HTML.parse(response)('#userNick').attr('value'),
                url: `${baseUrl}/user/index/${$.userId}`
            },
            {
                name: '糖豆',
                value: $.balanceValue,
                url: `${baseUrl}/recharge`
            },
            {
                name: '书券',
                value: $.tokenValue,
                url: `${baseUrl}/recharge`
            },
            {
                name: '金票',
                value: $.goldenValue,
                url: `${baseUrl}/recharge`
            }
        ],
        extra: [
            {
                name: '书架',
                type: 'books',
                method: 'bookshelf'
            },
            {
                name: '订阅',
                type: 'books',
                method: 'rss'
            }
        ]
    })
}

/**
 * 书架
 * @param {页码} page 
 * @returns 
 */
const bookshelf = (page) => {
    let response = GET('http://m.ebtang.com/user/notify/number')
    if (response === "") return JSON.stringify({})
    response = GET(`${baseUrl}/user/shelfJson?userId=${JSON.parse(response).userId}&page=${page + 1}&rows=50&randomString=${(new Date()).valueOf()}`)
    return myBooks(page, response)
}

/**
 * 订阅
 * @param {页码} page 
 * @returns 
 */
const rss = (page) => {
    let response = GET('http://m.ebtang.com/user/notify/number')
    if (response === "") return JSON.stringify({})
    response = GET(`${baseUrl}/user/rssJson?userId=${JSON.parse(response).userId}&page=${page + 1}&rows=50&randomString=${(new Date()).valueOf()}`)
    return myBooks(page, response)
}

/**
 * 图书列表
 * @param {响应} response 
 * @returns 
 */
const myBooks = (page, response) => {
    let $ = JSON.parse(response)
    return JSON.stringify({
        end: $.pagination.totalPage === page + 1,
        books: $.userBookList.map(book => ({
            name: book.bookName,
            author: book.authorNick,
            cover: book.bigCoverImage,
            detail: `${baseUrl}/book/${book.bookId}?visit=1`
        }))
    })
}

var bookSource = JSON.stringify({
    name: "雁北堂",
    url: "m.ebtang.com",
    version: 101,
    authorization: "http://m.ebtang.com/m/user/login",
    cookies: ["ebtang.com"]
})
