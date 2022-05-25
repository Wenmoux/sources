//return [{name, author, cover, detail}]
let token = localStorage.getItem('token') ? localStorage.getItem('token') : " "
let uid = localStorage.getItem('uid') ? localStorage.getItem('uid') : "0"
const search = (key) => {
    console.log(token)
    let response = GET(`https://api.hanwujinian.net/api.php/api/search_app/searchResult?limit=20&offset=0&search=${encodeURI(key)}&type=0&uid=0`)
    let $ = JSON.parse(response)
    let books = $.data.book.map(book => ({
        name: book.bookname,
        author: book.author,
        cover: book.pic,
        detail: book.bookid
    }))
    return JSON.stringify(books)
}
//详情
const detail = (url) => {
    let response = GET(`https://www.hanwujinian.com/riku/minibook/articleinfo.php?network=wifi&bookid=${url}&uid=0`)
    let $ = JSON.parse(response)
    let tags=""
    if(Array.isArray($.label)){
    tags =  $.label.join(" ")    
    }else if(   Object.prototype.toString.call($.label) === '[object Object]' ){    
   let str=[],  i=0
    Object.keys($.label).forEach(key => { str[i++]=key
  })
  tags=  str.map(tag =>($.label[tag])).join(' ')
    }
    let book = {
        summary: $.intro,
        status: $.isend ? "完结" : "连载",
        category: tags,
        words: $.presize,
        update: $.pubtime,
        lastChapter: $.lastchapter,
        catalog: `https://wap.hanwujinian.com/api.php/api/book_app/chapterListWithUserStatus?lastupdate=0&bookId=${$.articleid}&uid=${uid}`
    }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(url, {
        headers: [`token: ${token}`]
    })
    let $ = JSON.parse(response)
    let array = []
    $.data.chapterlist.forEach((book) => {
        if(book.chapterType ==1) array.push({name: book.chapterName  })
        else array.push({
            name: book.chapterName,
            url: `https://api.hanwujinian.net/api.php/api/book_app/read?aid=${book.bookId}&cid=${book.chapterId}&uid=${uid}`,
            vip: book.isVip
        })
        
    })
    return JSON.stringify(array)
}

//return string
const chapter = (url) => {
    let response = GET(url, {
        headers: [`token: ${token}`]
    })
    let $ = JSON.parse(response)
    if ($.data.isvip == 1 && $.data.isbuy != 1) throw JSON.stringify({
        code: 403,
        message: `https://wap.hanwujinian.com/read/${url.query("aid")}/${url.query("cid")}`
    })
    return $.data.content
}

const profile = () => {
    let response = GET(`https://api.hanwujinian.net/api.php/api/user_app/index?token=${token}&uid=${uid}`)
    let $ = JSON.parse(response)
    return JSON.stringify({
        basic: [{
                name: "账号",
                value: $.userName,
                url: 'http://wap.hanwujinian.net/users.php'
            },
            {
                name: '虫币',
                value: $.egold,
                url: 'http://wap.hanwujinian.net/modules/pay/choosepay.php'
            },
            {
                name: '月票',
                value: $.vipvote
            },
            {
                name: '推荐票',
                value: $.vote
            },
            {
                name: '阅读币',
                value: $.luckeyMoney
            },
            {
                name: '纪年点',
                value: $.points
            }
        ],

    })
}
const ranks = [{
        title: {
            key: 'sale',
            value: '热销榜'
        }
    },
    {
        title: {
            key: 'goodnum',
            value: '收藏榜'
        }
    },
    {
        title: {
            key: 'visit',
            value: '访问榜'
        }
    },
    {
        title: {
            key: 'vipvote',
            value: '月票榜'
        }
    },
    {
        title: {
            key: 'vote',
            value: '推荐榜'
        }
    }
]
let categories = [{
        key: "day",
        value: "日榜"
    },
    {
        key: "week",
        value: "周榜"
    },
    {
        key: "month",
        value: "月榜"
    },
    {
        key: "all",
        value: "总榜"
    }


]
for (var i = 0; i < ranks.length; i++) {
    ranks[i].categories = categories;
}

const rank = (title, category, page) => {
    let response = GET(`https://www.novel.hanwujinian.com/riku/hwjn_module/read/bookorderlist.php?rgroup=1&sortname=${category}${title}&token=&type=details`)
    let $ = JSON.parse(response)
    let books = []
    $.forEach((item) => {
        books.push({
            name: item.articlename,
            author: item.author,
            cover: item.image,
            detail: item.aid
        })
    })
    return JSON.stringify({
        end: page == 1,
        books
    })
}

const login = (args) => {
    if (!args) return "账号或者密码不能为空"
    let data = `action=login&ajax_request=1&ajaxapp=1&password=${args[1]}&username=${args[0]}`
    let response = POST("https://www.novel.hanwujinian.com/app/index/login.php", {
        data
    })
    let $ = JSON.parse(response)
    if ($.status == 0) return $.msg
    localStorage.setItem('token', $.tp_token)
    localStorage.setItem('uid', "" + $.uid)
}

var bookSource = JSON.stringify({
    name: "寒武纪年",
    url: "hanwujinian.com",
    version: 103,
    authorization: JSON.stringify(['account', 'password']),
    cookies: [".hanwujinian.com"],
    ranks: ranks
})
