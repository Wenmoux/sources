//搜索
const search = (key) => {
    let response = GET(`https://m.xiaojiaren.com/search/?searchkey=${encodeURI(key)}`)
    let array = []
    let $ = HTML.parse(response)
    $('.partlist-info>dl').forEach((child) => {
        let $ = HTML.parse(child)
        array.push({
            name: $('dt>em').text(),
            author: $('p').text().split("：")[1],
            cover: $('img').attr('src'),
            detail: $('a').attr('href').replace(/m\.xiao/, "www.xiao"),
        })

    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url, {
        headers: ["User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.92 Safari/537.36"]
    })
    let $ = HTML.parse(response)
    let book = {
        summary: $('meta[property=og:description]').attr("content"),
        catalog: url
    }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(url, {
        headers: ["User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.92 Safari/537.36"]
    })
    let $ = HTML.parse(response)
    let array = []
    $('.con>dl>dd').forEach((booklet) => {
        let $ = HTML.parse(booklet)
        array.push({
            name: $("a").text(),
            url: $("a").attr("href"),
            vip: false
        })
    })
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    return $(".content")
}




var bookSource = JSON.stringify({
    name: "笑佳人",
    url: "xiaojiaren.com",
    version: 100
})
