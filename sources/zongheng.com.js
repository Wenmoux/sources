/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
    let response = GET(`http://search.zongheng.com/s?keyword=${encodeURI(key)}`)
    let $ = HTML.parse(response)
    let books = []
    $('.search-result-list').forEach(book => {
        $ = HTML.parse(book)
        books.push({
            name: $('h2 > a').text(),
            author: $('.bookinfo > a:first-child').text(),
            cover: $('img').attr('src'),
            detail: $('h2 > a').attr('href')
        })
    })
    return JSON.stringify(books)
}

/**
 * 详情
 * @params {string} url
 * @returns {[{summary, status, category, words, update, lastChapter, catalog}]}
 */
const detail = (url) => {
    let $ = HTML.parse(GET(url))
    let book = {
        summary: $('.book-dec > p').text(),
        status: $('a.state').text() === '连载中' ? '连载' : '完结',
        category: $('.book-label > span').text(),
        words: $('.nums > span:eq(0) > i').text(),
        update: $('.time').text().match(/(?<=· ).+(?= · )/)[0].trim(),
        lastChapter: $('.book-new-chapter > .tit > a').text(),
        catalog: $('.all-catalog').attr('href')
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
    let chapters = []
    $('.volume-list > div').forEach(booklet => {
        $ = HTML.parse(booklet)
        chapters.push({ name: $('.volume').text().match(/(?<=])(.+?)(?=共[0-9])/)[0].trim() })
        $('li').forEach(chapter => {
            $ = HTML.parse(chapter)
            chapters.push({
                name: $('a').text(),
                url: $('a').attr('href'),
                vip: chapter.includes('vip')
            })
        })
    })
    return JSON.stringify(chapters)
}


/**
 * 章节
 * @params {string} url
 * @returns {string}
 */
const chapter = (url) => {
    let $ = HTML.parse(GET(url))
    //未购买返回403和自动订阅地址
    if ($('#reader-order-box')[0]) throw JSON.stringify({
        code: 403,
        message: url
    })
    return $('.content')
}


/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
    let $ = HTML.parse(GET('https://m.zongheng.com/h5/home'))
    if ($('.user_name').text() === '未登录') throw JSON.stringify({
        code: 401
    })
    return JSON.stringify({
        basic: [
            {
                name: '账号',
                value: $('.user_name').text(),
                url: 'https://m.zongheng.com/h5/home'
            },
            {
                name: '纵横币',
                value: $('.user_account > p:eq(0) > span:eq(1)').text(),
                url: 'http://pay.zongheng.com/wap/cashier?returnUrl=https%3A%2F%2Fm.zongheng.com%2Fh5%2Fshelf%3Fh5%3D1&platform=5',
            },
            {
                name: '月票',
                value: $('.user_account > p:eq(2) > span:eq(1)').text()
            },
            {
                name: '推荐票',
                value: $('.user_account > p:eq(1) > span:eq(1)').text()
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
    let response = GET(`https://m.zongheng.com/h5/ajax/shelf/list?h5=1&pageNum=${page + 1}&t=${(new Date()).valueOf()}`)
    let $ = JSON.parse(response)
    if ($.ajaxResult?.code !== 1) return JSON.stringify({ books: [] })
    let books = $.shelflist.map(book => ({
        name: book.bookName,
        author: book.authorName,
        cover: `http://static.zongheng.com/upload${book.coverUrl}`,
        detail: `http://book.zongheng.com/book/${book.bookId}.html`
    }))
    return JSON.stringify({
        end: true,
        books: books
    })
}

//排行榜
const rank = (title, category, page) => {
    let response = GET(`http://www.zongheng.com/rank/details.html?rt=${title}&d=1&p=${page + 1}`)
    let $ = HTML.parse(response)
    let pager = $('.rank_d_pagesize')
    let books = []
    $('.rank_d_list').forEach((book) => {
        $ = HTML.parse(book)
        books.push({
            name: $('.rank_d_b_name').text(),
            author: $('.rank_d_b_cate').attr('title'),
            cover: $('img').attr('src'),
            detail: $('.rank_d_book_img > a').attr('href'),
        })
    })
    return JSON.stringify({
        end: pager.attr('page') === pager.attr('count'),
        books: books
    })
}

const ranks = [
    {
        title: {
            key: '1',
            value: '月票榜'
        }
    },
    {
        title: {
            key: '3',
            value: '畅销榜'
        }
    },
    {
        title: {
            key: '4',
            value: '新书榜'
        }
    },
    {
        title: {
            key: '5',
            value: '点击榜'
        }
    },
    {
        title: {
            key: '6',
            value: '推荐榜'
        }
    },
    {
        title: {
            key: '7',
            value: '捧场榜'
        }
    },
    {
        title: {
            key: '8',
            value: '完结榜'
        }
    }
]

var bookSource = JSON.stringify({
    name: "纵横中文网",
    url: "zongheng.com",
    version: 103,
    authorization: "https://passport.zongheng.com/",
    cookies: ["zongheng.com"],
    ranks: ranks
})
