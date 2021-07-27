require("crypto-js")
const baseUrl = "http://eyagu.com"

//搜索
const search = (key) => {
    let response = GET(`${baseUrl}/book/search?sn=${encodeURI(key)}`)
    let array = []
    let $ = HTML.parse(response)
    $('.book_item').forEach((child) => {
        let $ = HTML.parse(child)
        array.push({
            name: $('.book_name').text(),
            author: $('.book_author').text(),
            cover: $('img').attr('src'),
            detail: `${baseUrl}${$('.book_name').attr('href')}`,
        })
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let book = {
        summary: $('.introduce').text(),
        catalog: url
    }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let array = []
    $('.clear:nth-child(5)>div').forEach((booklet) => {
        let $ = HTML.parse(booklet)
        if ($("div").attr("style").match("color: #444444")) array.push({ name: $("div").text() })
        else array.push({
            name: $("a").text(),
            url: `${baseUrl}${$("a").attr("href")}`,
            vip: false
        })
    })
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let ctxt = $("input#a").attr("value")
    return decrypt(ctxt)
}

function decrypt(ctxt) {
    var aseKey = 'abcdefabacadaeaf';
    var key = CryptoJS.enc.Utf8.parse(aseKey);
    var decrypt = CryptoJS.AES.decrypt(ctxt, key, {
        iv: CryptoJS.enc.Utf8.parse(aseKey),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    var c = decrypt.toString(CryptoJS.enc.Utf8);
    return c;
}


var bookSource = JSON.stringify({
    name: "雅谷中文",
    url: "eyagu.com",
    version: 100
})