//搜索
const search = (key) => {
    let response = GET(`https://www.shuqi.com/search?keyword=${encodeURI(key)}&page=1`)
    let $ = HTML.parse(response)
    let array = []
    array.push({
        name: $('.bname').text(),
        author: $('.bauthor').text().match(/(.+)(?=著)/)[0],
        cover: $('.view>a>img').attr('src'),
        detail: "https://www.shuqi.com" + $('.view>a').attr('href')
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let book = {
        summary: $('.bookDesc').text(),
        status: $('.lastchapter.clear>li:nth-child(3)').text(),
        category: $('.tags').text(),
        words: $('.lastchapter.clear>li:nth-child(2)').text().replace(/字/, ""),
        update: $('.lastchapter.clear>li:nth-child(4)').text().match(/(.+)(?=更新)/)[0],
        lastChapter: $('.lastchapter:not(.clear)>a').text(),
        catalog: url.replace("cover", "reader")
    }
    return JSON.stringify(book)
}


//目录
const catalog = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let info = JSON.parse($("i.js-dataChapters").text())
    let array = []
    info.chapterList.forEach((booklet) => {
        array.push({
            name: booklet.volumeName
        })
        booklet.volumeList.forEach((chapter) => {
            array.push({
                name: chapter.chapterName,
                url: `${chapter.isFreeRead?"https://c13.shuqireader.com/pcapi/chapter/contentfree/":"https://content.shuqireader.com/pcapi/chapter/contentcharge/"}${chapter.contUrlSuffix}&isbuy=${chapter.isBuy}&vip=${chapter.isFreeRead}&bid=${info.bookId}&cid=${chapter.chapterId}&userToken=${COOKIE("usertoken")}`,
                vip: !chapter.isFreeRead
            })
        })
    })
    console.log(COOKIE("usertoken"))
    return JSON.stringify(array)
}

function _decodeCont(t) {

    return t = function(t) {

            return t.split("").map(function(t) {

                var e, i;

                return t.match(/[A-Za-z]/) ? (e = Math.floor(t.charCodeAt(0) / 97),

                    i = (t.toLowerCase().charCodeAt(0) - 83) % 26 || 26,

                    String.fromCharCode(i + (0 == e ? 64 : 96))) : t

            }).join("")

        }(t),

        function(t) {

            var e, i, a, n, r, c, o, s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                d = "",

                l = 0;

            for (t = t.replace(/[^A-Za-z0-9\+\/\=]/g, ""); l < t.length;)

                n = s.indexOf(t.charAt(l++)),

                r = s.indexOf(t.charAt(l++)),

                c = s.indexOf(t.charAt(l++)),

                o = s.indexOf(t.charAt(l++)),

                e = n << 2 | r >> 4,

                i = (15 & r) << 4 | c >> 2,

                a = (3 & c) << 6 | o,

                d += String.fromCharCode(e),

                64 != c && (d += String.fromCharCode(i)),

                64 != o && (d += String.fromCharCode(a));

            return function(t) {

                for (var e, i = "", a = 0, n = 0, r = 0; a < t.length;)

                    n = t.charCodeAt(a),

                    n < 128 ? (i += String.fromCharCode(n),

                        a++) : n > 191 && n < 224 ? (r = t.charCodeAt(a + 1),

                        i += String.fromCharCode((31 & n) << 6 | 63 & r),

                        a += 2) : (r = t.charCodeAt(a + 1),

                        e = t.charCodeAt(a + 2),

                        i += String.fromCharCode((15 & n) << 12 | (63 & r) << 6 | 63 & e),

                        a += 3);

                return i

            }(d)

        }(t)

}

//章节
const chapter = (url) => {
    let response = GET(url, {
        header: [`referer:https://www.shuqi.com/reader?bid=${url.query("bid")}&cid=${url.query("cid")}`]
    })
    //VIP章节未购买返回403和自动订阅地址
    if (url.query("isbuy") === "false" && url.query("vip") === "false") throw JSON.stringify({
        code: 403,
        message: `https://www.shuqi.com/reader?bid=${url.query("bid")}&cid=${url.query("cid")}`
    })
    //VIP章节已购买
    let ChapterContent = JSON.parse(response).ChapterContent ? _decodeCont(JSON.parse(response).ChapterContent) : "..."
    return ChapterContent
}

const rank = (title, category, page) => {
    let response = GET(`https://www.shuqi.com/ranklist?rank=${category+title}&page=${page+1}`)
    let $ = HTML.parse(response)
    let books = []
    let pageC = $(".cp-wp-page:last-child>a").attr("href").match(/page=(\d+)/)[1]

    $(".ranklist-ul>li").forEach((chapter) => {
        let $ = HTML.parse(chapter)
        books.push({
            name: $("h3").text(),
            author: $(".ranklist-autor").text(),
            cover: $("img").attr("src"),
            detail: "https://www.shuqi.com" + $(".ranklinst-bk>a").attr("href")
        })
    })
    return JSON.stringify({
        end: page + 1 === pageC,
        books
    })
}
let key = ["Click-点击", "Store-收藏", "Order-订阅", "hot-人气", "New-新书", "End-完结", "Update-更新"]
let ranks = []
key.map(list => {
    let data = list.split("-")
    categories = (data[0] != "Update") ? [{
        key: "all",
        value: "总"
    }, {
        key: "boy",
        value: "男"
    }, {
        key: "girl",
        value: "女"
    }] : [{
        key: "boy",
        value: "男"
    }, {
        key: "girl",
        value: "女"
    }]
    ranks.push({
        title: {
            key: data[0],
            value: data[1]
        },
        categories
    })
})

//个人中心
const profile = () => {
    let response = GET("https://www.shuqi.com/api/getuserinfo?imei=")
    let $ = JSON.parse(response).data
    return JSON.stringify({
        basic: [{
                name: "账号",
                value: $.nickName,
                url: "https://www.shuqi.com/ucenter"
            },
            {
                name: '书豆',
                value: $.sdou,
                url: 'https://www.shuqi.com/recharge'
            }
        ]
    })
}

var bookSource = JSON.stringify({
    name: "书旗小说",
    url: "shuqi.com",
    version: 102,
    authorization: "https://write.shuqi.com/login?modal=1",
    cookies: [".shuqi.com"],
    ranks: ranks
})
