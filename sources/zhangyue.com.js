//搜索
const search = (key) => {
    let response = GET(`http://m.zhangyue.com/search?keyWord=${encodeURI(key)}`)
    let $ = HTML.parse(response)
    let array = []
    let list = $('.section_b>a')
    if (Array.isArray(list)) {
        list.forEach((child) => {
            let $ = HTML.parse(child)
            console.log(child)
            getdetail($, array)
        })
    } else {
        getdetail($, array)
    }
    return JSON.stringify(array)
}

function getdetail($, array) {
    if (!$('a .name').text().match("\\[漫画\\]")) {
        array.push({
            name: $('.name').text().replace("[精品]", ""),
            author: $('.author').text(),
            cover: $('img').attr('data-src'),
            detail: $("a").attr("href")
        })
    }
    return array

}
//详情
const detail = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let status = (/完结/).test($('.lastline').text()) ? "完结" : ((/连载/).test($(".lastline").text()) ? "连载" : "完结")
    let book = {
        summary: $('.brief_intro>p').text().replace("内容简介：", ""),
        status: status,
        category: $('.tagbtn').text()+" "+$("dd.ellipsis:not(.author)").text().match(/(.+?) |/)[1],
        words: (/字/).test($('.lastline').text()) ? $('.lastline').text().match(/(.+)字/)[1] : "0",
        update: status == "连载" ? ($('.time') ? $('.time').text().match(/(.+?)更新/)[1] : "") : "",
        lastChapter: status == "连载" ? ($('.time') ? $('.catalog_new >a:nth-child(1)').text().match(/(?<=更新).+/)[0] : "") : "已完结",
        catalog: url.match(/\d+/)[0]
    }
    return JSON.stringify(book)
}


//目录
const catalog = (url) => {
    let array = []
    pageCount = 999
    for (i = 1; i <= pageCount; i++) {
        let response = GET(`https://m.zhangyue.com/chapter/${url}?isAjax=1&currentPage=${i}`)
        let $ = HTML.parse(JSON.parse(response).html.replace(/\\\"/g, "\""))
        pageCount = JSON.parse(response).body.page_total
        $("li").forEach((booklet) => {
            let $ = HTML.parse(booklet)
            array.push({
                name: $("a").text().replace("免费",""),
                url: $("a").attr("href"),
                vip: !($(".type").text() == "免费")
            })

        })
    }

    return JSON.stringify(array)
}



//章节
const chapter = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)

    //VIP章节未购买返回403和自动订阅地址
    if ($(".tit").text() == "试读已结束，购买阅读更多精彩章节") throw JSON.stringify({
        code: 403,
        message: url
    })
    let ChapterContent = $(".h5_mainbody,.read_c").remove("span,h1,h4")
    return ChapterContent
}

const rank = (title, category, page) => {
    let response = GET(`https://m.zhangyue.com/rank/listMore/${category}?currentPage=${page+1}`)
    let $ = HTML.parse(JSON.parse(response).html.replace(/\\\"/g, "\""))
    let books = []
    $("li").forEach((chapter) => {
        let $ = HTML.parse(chapter)
        books.push({
            name: $("dt").text().replace("[精品]", ""),
            author: $("dd.author").text(),
            cover: $("img").attr("data-src"),
            detail: $("a").attr("href")
        })
    })
    return JSON.stringify({
        end: JSON.parse(response).html.length == 0,
        books
    })
}

const ranks = [{
    title: {
        key: 1,
        value: '男生排行榜'
    },
    categories: [{
        key: "19258",
        value: "热销榜"
    }, {
        key: "19265",
        value: "完结榜"
    }, {
        key: "19272",
        value: "免费榜"
    }]
}, {
    title: {
        key: 2,
        value: "女生榜"
    },
    categories: [{
        key: "19261",
        value: "热销榜"
    }, {
        key: "19264",
        value: "完结榜"
    }, {
        key: "19269",
        value: "免费榜"
    }]
}, {
    title: {
        key: 3,
        value: "出版排行榜",
    },
    categories: [{
        key: "14374",
        value: "主编推荐榜"
    }, {
        key: "19268",
        value: "掌阅畅销榜"
    }, {
        key: "18474",
        value: "特价折扣榜"
    }]
}]

//个人中心
const profile = () => {
    let response = GET("https://m.zhangyue.com/user")
    let $ = HTML.parse(response)
    let vip = $(".con[data-js]>span.txt").text().replace("到期", "")
    return JSON.stringify({
        basic: [{
                name: "账号",
                value: $(".name").text().replace("VIP", ""),
                url: "https://m.zhangyue.com/user",
            },
            {
                name: '阅饼',
                value: $(".red").text().match(/(\d+)阅饼/)[1],
                url: $('.charge').attr('onclick').match(/'(.+)'/)[1],
            },
            {
                name: '代金券',
                value: $(".red").text().match(/(\d+)代金券/)[1],
                url: $('.charge').attr('onclick').match(/'(.+)'/)[1],
            },
            {
                name: 'VIP',
                value: vip.length==0?"无":vip,
                url: $(".con[data-js]").attr("data-url")
            }
        ]
    })
}

var bookSource = JSON.stringify({
    name: "掌阅小说",
    url: "zhangyue.com",
    version: 104,
    authorization: "https://m.zhangyue.com/login",
    cookies: [".zhangyue.com"],
    ranks: ranks
})
