require("crypto-js")
const Secret = "cCEc0PPno08rFDwP"
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
    let key =CryptoJS.enc.Utf8.parse( "20200618");
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
    let data = `consumerKey=FUZHU_ANDROID&timestamp=${new Date().getTime()}&uID=0&pn=0`
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
    let str =  `consumerKey=FUZHU_ANDROID&timestamp=${new Date().getTime()}&bID=${args.bid}&lmID=1000&uID=0`
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
            data: `consumerKey=FUZHU_ANDROID&timestamp=${new Date().getTime()}&bID=${$.BID}&isUpdate=0&uID=0`
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
                u: "http://a.lc1001.com/app/book/freechapter",
                url: `http://a.lc1001.com/app/book/freechapterbID=${args.bid}cID=${chapter.CID}consumerKey=FUZHU_ANDROID`,              
                bid : args.bid,
                cid:   chapter.CID          
                }),                
                vip: false
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
    let curl = args.u +`?consumerKey=FUZHU_ANDROID&timestamp=${time}&sign=${sign}&bID=${args.bid}&cID=${args.cid}&uID=${uid}&token=${token}&mType=OPPO-PCRT00&PACKINGCHANNEL=YINGYONGBAO&UNIQUETOKEN=AsOgbCfpeTuxFynzmTNtMpRXcgTHFFZajDxJ5Mje2ANY&SPREADTAG=D20210710_PXIAOMI`
    let response = GET(curl)
    let CTXT = JSON.parse(response).DATA.CTXT
    let TXT = decode(CTXT)
    return TXT

}



var bookSource = JSON.stringify({
    name: "腐竹小说",
    url: "lc1001.com",
    version: 100
})
