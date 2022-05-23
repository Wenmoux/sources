const baseUrl = "https://www.po18.tw"
const search = (key) => {
    let url = "https://www.po18.tw/search/index"
    let res = GET(url)
    tk = res.match(/_po18rf-tk001\" value=\"(.+?)\">/)[1]  
    data = `searchtype=all&name=${encodeURI(key)}&_po18rf-tk001=${tk}`
    let response = POST("https://www.po18.tw/search/index", {
        data
    })
    let array = []
    let $ = HTML.parse(response)
    $('.book').forEach((child) => {
        let $ = HTML.parse(child)
        array.push({
            name: $('.book_name>a').text(),
            author: $('.book_author').text(),
            cover: $('img').attr('src'),
            detail: `${baseUrl}${$('.book_name>a').attr('href')}`,
        })
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let book = {
        summary: $('.B_I_content').text(),
        status: /已完結/.test($('dd.statu').text()) ? "完结" : "连载",
        category: $(".tag").text(),
        lastChapter: $(".C_wrapbox>h4").text(),
        update: $(".date").text().replace(/公開 /, ""),
        words: $(".book_data").text().match(/總字數 (\d+)/)[1],
        catalog: url + "/articles"
    }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let array = []
    $('#w0>div').forEach((booklet) => {
        let $ = HTML.parse(booklet)
        array.push({
            name: $(".l_chaptname").text(),
            url: `${baseUrl}${$(".btn_L_blue").attr("href")}`,
            vip: /訂購/.test(booklet)
        })
    })
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    if (url === 'https://www.po18.tw') throw JSON.stringify({
        code: 403,
        message: "请先订阅"
    })
    url1 = url.replace("articles", "articlescontent")
    let response = GET(url1, {
        headers: [`referer: ${url}`]
    })
    let $ = HTML.parse(response)
    let content = ""
    $('p').forEach((child) => {
        content += child
    })
    return content
}


const profile = () => {
let res= GET('https://www.po18.tw/panel')
 
    let $ = HTML.parse(res)
 
       if (/登入/.test(res)) throw JSON.stringify({
        code: 401
    })
    return JSON.stringify({
        basic: [{
                name: '昵稱',
                value: $('.memberInfo>h3').text().replace("會員資料編輯", ""),
                url: 'https://www.po18.tw/panel'
            },
            {
                name: '可用餘額',
                value: $('.money').text().match(/\d+/)[0],
                url: 'https://www.po18.tw/bill'
            }
        ],
        extra: [{
            name: '書櫃',
            type: 'books',
            method: 'bookshelf'
        }]
    })
}
const bookshelf = () => {
    books = []
    let response = GET("https://www.po18.tw/panel/stock_manage/stocks")
    $ = HTML.parse(response)
    $('.check_table>tbody>.alt-row').forEach((book) => {
        $ = HTML.parse(book)
        books.push({
            name: $('a').text(),
            detail: `${baseUrl}${$('a').attr('href')}`,
        })
    })
    return JSON.stringify({
        books
    })
}

var bookSource = JSON.stringify({
    name: "po18臉紅心跳",
    url: "https://www.po18.tw",
    authorization: "https://members.po18.tw/apps/login.php",
    cookies: [".po18.tw"],
    version: 100
})
