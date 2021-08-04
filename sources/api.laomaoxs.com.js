require('crypto-js')
const baseURI= "https://api.laomaoxs.com"
function decode(word) {
    let key = CryptoJS.enc.Utf8.parse("b23c159r9t88hl2q");
    let iv =CryptoJS.enc.Utf8.parse("8yeywyJ45esysW8M") ;   
    str = CryptoJS.AES.decrypt(word, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })
   return str.toString(CryptoJS.enc.Utf8)    
}

//搜索
const search = (key) => {
    let response = GET(`${baseURI}/Search/index?key=${encodeURI(key)}&page=1`)
    let array = []
    let dres  = JSON.parse(decode(response))   
    dres.data.forEach((item) => {
            array.push({
                name: item.book_title,
                author: item.book_author,
                cover: `${baseURI}/novel/img/${parseInt(item.book_id/1000)}/${item.book_id}/${item.book_id}.jpg`,
                detail: `${baseURI}/novel/txt/${parseInt(item.book_id/1000)}/${item.book_id}/index.html`
            })    
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = decode(GET(url))
    let $ = JSON.parse(response).data
    let book = {
        status: $.book_status == 1 ? "连载" : "完结",
        update: formatDate($.update_time*1000),
        lastChapter: $.chapter_list[$.chapter_list.length-1],
        catalog: url
    }
    return JSON.stringify(book)
}
//转换更新时间 时间戳
function formatDate(timeStamp) {
    let diff = (Date.now() - timeStamp) 
    if (diff < 60) {
        return '刚刚'
    } else if (diff < 3600) {
        return `${parseInt(diff / 60)}分钟前`
    } else if (diff < 86400) {
        return `${parseInt(diff / 3600)}小时前`
    } else {
        let date = new Date(timeStamp)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }
}

//目录
const catalog = (url) => {
    let response = decode(GET(url))
    let $ = JSON.parse(response).data
    let array = []
    let list = $.chapter_list
         for(i=0;i<list.length;i++){
              array.push({
                name:list[i] ,
                url: `${baseURI}/novel/txt/${parseInt($.book_id/1000)}/${$.book_id}/${i+1}.html`,
                vip: false
            })}

        console.log(array)
   
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    return JSON.parse(decode(GET(url))).data
}
var bookSource = JSON.stringify({
    name: "老猫小说",
    url: "api.laomaoxs.com",
    version: 100
})