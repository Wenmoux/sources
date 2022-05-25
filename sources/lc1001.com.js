require("crypto-js")
const Secret = "XKrqBSeeEwgDy2pT"
let token = localStorage.getItem('token') ? localStorage.getItem('token') : "0"
let uid = localStorage.getItem('uid') ? localStorage.getItem('uid') : "0"
function getsign(url, method, data) {
str=""
if(data){
    var str = data.split("&").sort(function(a, b) {
        return a.localeCompare(b)
    }).join("")
    }
    str = method + url + str + Secret
    sign = CryptoJS.MD5(encodeURIComponent(str)).toString()
    return sign
}
function decode(word) {
    let key =CryptoJS.enc.Utf8.parse( "1701019k");
    let iv = CryptoJS.enc.Base64.parse("AQIDBAUGBwg=");    
    str = CryptoJS.DES.decrypt(word, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })
   return str.toString(CryptoJS.enc.Utf8)    
}
//搜索
const search = (key) => {
    let url = "http://a.lc1001.com/app/query/keybooks"
    let method = "POST"
    let data = `consumerKey=LCREAD_ANDROID&timestamp=${new Date().getTime()}&uID=0&pn=0`
    let sign = getsign(url, method, data)
    let response = POST(url + "?kw=" + encodeURI(key) + "&" + data + "&sign=" + sign, {
        data: "."
    })
    let $ = JSON.parse(response)
    let books = $.DATA.KEYLIST.map(book => ({
        name: book.KEYNAME,
        author: book.AUTHORNAME,
        cover: book.COVERURL,
        detail: JSON.stringify({
            url: "http://a.lc1001.com/app/info/bookindex",
            bid: book.KEYID
        })
    }))
    return JSON.stringify(books)
}


//详情
const detail = (url) => {
    let args = JSON.parse(url)
    let str =  `consumerKey=LCREAD_ANDROID&timestamp=${new Date().getTime()}&bID=${args.bid}&lmID=1000&uID=0`
    let sign = getsign(args.url, "GET", str)
    let data = str + "&sign=" + sign
    let response = POST(args.url, {
        data
    })
    let $ = JSON.parse(response).DATA
    let book = {
        summary: $.CONTENT,
        status: $.STATE == 1 ? "完结" : "连载",
        category: $.BTNAME,
        words: $.WORDNUM,
        update: formatDate($.INTUPTIME),
        lastChapter: $.NEWCHAPTER,
        catalog: JSON.stringify({
            url: "http://a.lc1001.com/app/info/bookcata",
            bid: $.BID,
            data: `consumerKey=LCREAD_ANDROID&timestamp=${new Date().getTime()}&bID=${$.BID}&isUpdate=0&uID=0`
        })
    }
    return JSON.stringify(book)
}

//转换更新时间 时间戳
function formatDate(timeStamp) {
    let diff = (new Date().getTime() - timeStamp) / 1000
    //   diff = Math.floor(diff)
    if (diff < 60) {
        return '刚刚'
    } else if (diff < 3600) {
        return `${parseInt(diff / 60)}分钟前`
    } else if (diff < 86400) {
        return `${parseInt(diff / 3600)}小时前`
    } else {
        let date = new Date(timeStamp * 1000 / 1000)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }
}

//目录
const catalog = (url) => {
    let args = JSON.parse(url)
    let sign = getsign(args.url, "GET", args.data)
    let data = args.data + "&sign=" + sign
    let response = POST(args.url, {
        data
    })
    let $ = JSON.parse(response)
    let array = []
    //
    $.DATA.BOOKCATA.forEach((booklet) => {
        array.push({
            name: booklet.VNAME
        })
        booklet.CHAPTERS.forEach((chapter) => {
            array.push({
                name: chapter.CNAME,
                url: JSON.stringify({
                u: chapter.ISVC == 0?"http://a.lc1001.com/app/book/pubchapter":"http://a.lc1001.com/app/book/vipchapter",
                url: `http://a.lc1001.com${chapter.ISVC == 0?"/app/book/pubchapter":"/app/book/vipchapter"}bID=${args.bid}cID=${chapter.CID}consumerKey=LCREAD_ANDROID`,              
                bid : args.bid,
                cid:   chapter.CID          
                }),                
                vip: chapter.ISVC != 0
            })
        })
    })
    return JSON.stringify(array)
}

// 正文
const chapter = (url) => {
    let args = JSON.parse(url)
    let time = new Date().getTime()
    let urls = args.url +`timestamp=${time}uID=${uid}`
    let sign = getsign(urls ,"GET")
    let curl = args.u +`?consumerKey=LCREAD_ANDROID&timestamp=${time}&sign=${sign}&bID=${args.bid}&cID=${args.cid}&uID=${uid}&token=${token}&mType=OPPO-PCRT00&PACKINGCHANNEL=YINGYONGBAO`
    let response = GET(curl)
   console.log(response.DATA)
    let CTXT = JSON.parse(response).DATA.CTXT
    let TXT = decode(CTXT)
    return TXT

}

//个人中心
const profile = () => {
    let url = "http://a.lc1001.com/app/user/myInfo"
    let method = "GET"
    let data = `consumerKey=LCREAD_ANDROID&timestamp=${new Date().getTime()}&uID=${uid}`
    let sign = getsign(url, method, data)
    let curl = `${url}?${data}&sign=${sign}&token=${token}`
    let response = GET(curl)
    let $ = JSON.parse(response).DATA
    return JSON.stringify({
        basic: [{
                name: "账号",
                value: $.UNAME,
                url: "http://my.lc1001.com/book/bookhouse?u=&pn=0&from=null"
            },
            {
                name: '铜板',
                value: $.RESTNUM,
                url: 'http://www.lcread.com/epay/cashin_interface_index.html'

            },
            {
                name: '福利币',
                value: $.RESTFLQ,
                url: 'http://www.lcread.com/epay/cashin_interface_index.html'
            }
        ]
    })
}

const ranks=[{title:{key:20,value:"女生"}},{title:{key:10,value:"男生"}},{title:{key:50,value:"耽美同人"}}]
const categories=[{"key":"fsb-0","value":"封神榜"},{"key":"zsb-1","value":"钻石榜"},{"key":"qgb-2","value":"勤更榜"},{"key":"tjb-3","value":"推荐榜"},{"key":"rqb-4","value":"人气榜"},{"key":"scb-5","value":"收藏榜"},{"key":"wdb-6","value":"字数榜"},{"key":"xsb-7","value":"新书榜"}]

for (var i = 0; i < ranks.length; i++) {
    ranks[i].categories = categories;
}

//排行
const rank = (title, category, page) => {
    let cate = category.split("-")
    let data = `prefer=${title}&rank=${cate[0]}&pn=${page+1}0&aType=50&from=`
    let response = POST("http://h5.lc1001.com/top/s", {
        data
    })
    let $ = JSON.parse(response)
    let books = []
    $.TOPLIST[cate[1]].BOOKS.forEach((item) => {
        books.push({
            name: item.BOOKNAME,
            author: item.AUTHORNAME,
            cover: `http://pic.lc1001.com/pic/cover/${item.BOOKID.substring(0, item.BOOKID.length - 3)}/${item.BOOKID}_120.gif`,
            detail: JSON.stringify({
                url: "http://a.lc1001.com/app/info/bookindex",
                bid: item.BOOKID
            })
        })
    })
    return JSON.stringify({
        end: page + 1 == 5,
        books
    })
}
const login = (args) => {
    if(args.length!=2&&!args) return "账号或者密码不能为空"
    let data = `pcd=${args[0]}&pwd=${args[1]}`
     let response = POST("http://h5.lc1001.com/h5/login",{data})   
    let $ = JSON.parse(response)
    if($.result != "true" ) return "账号或密码不正确~"
    localStorage.setItem("uid", $.uID)
    localStorage.setItem("token", $.token)
}

var bookSource = JSON.stringify({
    name: "连城读书",
    url: "lc1001.com",
    version: 103,
    authorization: JSON.stringify(['account', 'password']),
    cookies: [".lc1001.com", ".lcread.com"],
    ranks: ranks
})
