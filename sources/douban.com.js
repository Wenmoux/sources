/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
    let response = GET(`https://www.douban.com/search?cat=1001&q=${encodeURI(key)}`)
    let $ = HTML.parse(response)
    let books = []
    $('.result-list > .result').forEach(book => {
        $ = HTML.parse(book)
        books.push({
            name: trimBookName($('h3 > a').text()),
            author: trimAuthor($('.subject-cast').text()),
            cover: $('img').attr('src'),
            detail: $('h3 > a').attr('href')
        })
    })
    return JSON.stringify(books)
}

/**
 * 格式化
 * @param {作者}} author 
 * @returns 
 */
const trimAuthor = (author) => {
    try {
        return author.match(/(.+?)(?=\/)/)[0]
        .replace(' 著', '')
        .replace(/\[.*]/, '')
        .replace(/（.+）/, '')
        .replace(/\(.*\)/, '')
        .replace('•', '·')
        .trim()
    } catch (error) {
        return author
    }
}

const trimBookName = (bookName) => {
    return bookName.replace(/（.+）$/, '').trim()
}

/**
 * 详情
 * @params {string} url
 * @returns {[{summary, status, category, words, update, lastChapter, catalog}]}
 */
const detail = (url) => {
    let $ = HTML.parse(GET(url))
    let book = {
        summary: $('.intro:not(:has(.a_show_full))')[0]?.text() ?? '',
        status: '完结',
        category: $('#db-tags-section > .indent').text(),
        words: $('#info').text().match(/(?<=页数:)(.+?)(?= )/)?.shift()?.trim() ?? '',
        update: $('#info').text().match(/(?<=出版年:)(.+?)(?= )/)?.shift()?.trim() ?? '',
    }
    return JSON.stringify(book)
}

/**
 * 排行榜
 * @param {页码} page 
 * @returns 
 */
const rank = (title, category, page) => {
    let response = GET(`https://book.douban.com/${title}?start=${page * 25}`)
    let $ = HTML.parse(response)
    let books = []
    $('table').forEach(book => {
        $ = HTML.parse(book)
        books.push({
            name: trimBookName($('.pl2').text()),
            author: trimAuthor($('td > .pl').text()),
            cover: $('.nbg > img').attr('src'),
            detail: $('.nbg').attr('href')
        })
    })
    return JSON.stringify({
        end: page * 25 === 9 * 25,
        books: books
    })
}

const ranks = [
    {
        title: {
            key: 'top250',
            value: 'Top 250'
        }
    }
]

var bookSource = JSON.stringify({
    name: "豆瓣读书",
    url: "douban.com",
    version: 103,
    ranks: ranks
})