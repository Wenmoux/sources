/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
    let response = GET(`https://api.yousuu.com/api/search?type=title&value=${encodeURI(key)}&from=search`)
    let books = JSON.parse(response).data.books.map(book => ({
        name: book.title,
        author: book.author,
        cover: book.cover,
        detail: `https://www.yousuu.com/book/${book.bookId}`
    }))
    return JSON.stringify(books)
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
        summary: response.match(/(?<=introduction:\")(.+?)(?=\",)/)[0].trim(),
        status: $('.status').text().match(/(?<=·)(.+)/)[0].trim(),
        category: $('.el-tag')[0] ? $('.el-tag')[0].text() : "",
        words: $('.book-word-count').text().match(/(?<=本书字数：)(.+?)(?=字)/)[0].trim()
    }
    return JSON.stringify(book)
}

var bookSource = JSON.stringify({
    name: "优书网",
    url: "yousuu.com",
    version: 101
})