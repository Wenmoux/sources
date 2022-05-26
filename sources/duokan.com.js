require("crypto-js")
//搜索

const search = (key) => {
    let response = GET(`https://www.duokan.com/store/v0/lib/query/onebox?start=0&count=10&s=${encodeURI(key)}&source=2%2C5%2C7&_t=1616840245&_c=3963`)
    let array = []
    let $ = JSON.parse(response)
    $.items.forEach((child) => {
        array.push({
            name: child.title,
            author: child.role[0][1],
            cover: child.cover,
            detail: `https://www.duokan.com/hs/v0/android/fiction/book/${child.source_id}`
        })
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url)
    let $ = JSON.parse(response).item
    let book = {
        update: $.updated,
        lastChapter: $.latest,
        summary: $.summary,
        category: $.tags.join(" "),
        words: $.word_count,
        catalog: `https://www.duokan.com/store/v0/fiction/detail/${$.fiction_id}?chapter_id=0&_t=&_c=&fid=${$.fiction_id}`
    }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(url)
    let $ = JSON.parse(response)
    let array = []
    $.item.toc.forEach((chapter, index) => {
        array.push({
            name: chapter.title,
            url: `https://www.duokan.com/drm/v0/fiction/link?chapter_id=${chapter.seq_id}&format=jsonp&withid=1&fiction_id=${url.query("fid")}&_t=&_c=`,
            vip: chapter.free?false:true
        })
    })
    return JSON.stringify(array)
}

const chapter = (url) => {
    let $ = JSON.parse(GET(url))
    SET_COOKIE('user_id')
    content = ""
    if ($.url) enC = GET($.url).match(/'(.+?)'/)[1]
    else throw JSON.stringify({
        code: 403,
        message: `https://www.duokan.com/store/v0/payment/fiction/create?fiction_id=${url.query("fiction_id")}&price=&payment_name=BC&chapter_id=${url.query("chapter_id")}&ch=Y0X66A&_t=&_c=`
    })
    decodeC = CryptoJS.enc.Base64.parse(enC).toString(CryptoJS.enc.Utf8)
    list = JSON.parse(decodeC).p
    for (i = 0; i < list.length; i++) {
        content += list[i] + "\n"
    }
    return content
}

function getc() {
    did = COOKIE("device_id")
    t = parseInt(new Date().getTime() / 1000);
    list = (did + "&" + t).split("");
    for (c = 0, i = 0; i < list.length; i++) {
        c = (c * 131 + list[i].charCodeAt()) % 65536;
    }
    a = `_t=${t}&_c=${c}`;
    return a;
}

const profile = () => {
    bean = 0
    let res = JSON.parse(POST('https://www.duokan.com/store/v0/award/coin/list', {
        data: `sandbox=0&${getc()}&withid=1`
    }))
    if (res.result == 0) {
        for (reward of res.data.award) bean += reward.coin
    } else throw JSON.stringify({
        code: 401
    })
    return JSON.stringify({
        basic: [{
                name: '账号',
                value: COOKIE("nick_name"),
                url: 'https://www.duokan.com/m/'
            },
            {
                name: '书豆',
                value: bean,
                url: 'https://www.duokan.com/m/'
            }
        ]
    })
}

var bookSource = JSON.stringify({
    name: "多看阅读",
    url: "www.duokan.com",
    authorization: "https://www.duokan.com/www/sdk-h5/?ch=Y0X66A&chapter_id=510&page=user_center&_t=_r%3A",
    cookie: [".duokan.com"],
    version: 101
})