//搜索
const search = (key) => {
    let data = `keyboard=${ENCODE(key,"gb2312")}&show=title&classid=0`
    let response = POST("http://dmxs.org/e/search/indexsearch.php",{data})
    let array = []
    let $ = HTML.parse(response)
    $('.books>.bk').forEach((child) => {
        let $ = HTML.parse(child)
        array.push({
            name: $('h3').text(),
            author: $('.autor').text().replace("作者： ",""),
            detail:"http://dmxs.org"+ $('a').attr('href'),
        })
        console.log(array)
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let book = {
        update: $('.date').text().match(/\d.+/)[0],
        lastchapter: $('.book_list>ul>li:last-child>a').text(),
        catalog: url
    }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let array = []
    $('.book_list>ul>li').forEach((booklet) => {
        let $ = HTML.parse(booklet)
        array.push({
            name: $("a").text(),
            url: `http://dmxs.org${$("a").attr("href")}`,
            vip: false
        })
    })
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response.replace(/€/g,""))
    return $(".read_chapterDetail")
}

var bookSource = JSON.stringify({
    name:"耽美小说",
    url: "dmxs.org",
    version: 102
})