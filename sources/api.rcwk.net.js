const baseurl = "https://api.rcwk.net"
//搜索
const search = (key) => {
    let response = GET(`${baseurl}/037/search.php?page_index=1&keyword=${encodeURI(key)}&page_size=15`)
    let array = []
    let $ = JSON.parse(response)
    $.Data.DataList.map(book => {
        array.push({
            name: book.book_name,
            author: book.book_name,
            detail: `${baseurl}/037/book.php?aid=${book.book_id}`,
        })
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url)
    let $ = JSON.parse(response)
    let book = {
        status: $.Data.book.is_finish ? "完结" : "连载",
        update: $.Data.book.create_time,
        lastchapter: $.Data.book.last_chaptername,
        catalog: `${baseurl}/037/chapters.php?page_index=&aid=${$.Data.book.book_id}&order=asc&page_size=9999999`
    }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(url)
    let $ = JSON.parse(response)
    let array = []
    $.Data.map(chapter => {
        array.push({
            name: chapter.chapter_name,
            url: `${baseurl}/037/chapter.php?query_direction=current&aid=${url.query("aid")}&cid=${chapter.chapter_index}`,
            vip: false
        })
    })

    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let response = GET(url)
    let $ = JSON.parse(response)
    return $.Data.chapter_content
}

var bookSource = JSON.stringify({
    name: "大河小说",
    url: "api.rcwk.net",
    version: 100
})