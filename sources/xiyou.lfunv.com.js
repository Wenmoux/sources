//抄自酷安@渊呀妹子大佬的阅读源 书耽
require("crypto-js")
account ="西柚78264469064"
login_token = "f37b91ca9d1348f6c307315433a71209"
const baseurl = "https://xiyou.lfunv.com"
function encode(word) {
    let key = CryptoJS.enc.Base64.parse("UP8XDHB/5Z29QGFovGSxyPwn9egkxEazAPz6Uoo80Zc=");
    let iv = CryptoJS.enc.Base64.parse("AAAAAAAAAAAAAAAAAAAAAA==");  
    str = CryptoJS.AES.encrypt(word, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })
    return str.toString()
}
function decode(word) {
    let key = CryptoJS.enc.Base64.parse("UP8XDHB/5Z29QGFovGSxyPwn9egkxEazAPz6Uoo80Zc=");
    let iv = CryptoJS.enc.Base64.parse("AAAAAAAAAAAAAAAAAAAAAA==");  
    str = CryptoJS.AES.decrypt(word, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })
    return str.toString(CryptoJS.enc.Utf8)
}
//搜索
const search = (key) => {
 let data="secret_content="+encodeURIComponent(encode(JSON.stringify({"app_signature_md5":"e7ad64b53de9d4d2dc02cc8d7e27bdb6","app_version":"1.1.6","channel":"6","order":"week_chapter_click","count":"15","page":0,"key":key,"login_token":login_token,"account":account})))
  let response = POST("https://xiyou.lfunv.com/bookcity/get_filter_search_book_list",{data})
  let array = []
  let $ = JSON.parse(decode(response))
  console.log($)
  $.data.book_list.forEach((child) => {
    array.push({
      name: child.book_name,
      author: child.author_name,
      cover: child.cover,
      detail: JSON.stringify({
      url: `${baseurl}/book/get_info_by_id`,
      bid: child.book_id
      })
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
  let args = JSON.parse(url)
  let data =  "secret_content="+encodeURIComponent(encode(JSON.stringify({"app_signature_md5":"f73576612783f8ed8b68cdf73a56be94","app_version":"1.16","channel":"default","book_id":args.bid,"login_token":login_token,account:account})))
  let response = POST(args.url,{data})  
  let $ = JSON.parse(decode(response)).data.book_info
  let book = {
    summary: $.description,
    status: $.up_status == 1 ? '完结' : '连载',
    category: $.tag.replace(/,/g," "),
    words: $.total_word_count,
    update: $.uptime,
    lastChapter: $.last_chapter_info.chapter_title,
    catalog: JSON.stringify({
       url: `${baseurl}/chapter/get_chapter_list_group_by_division`,
       data:  "secret_content="+encodeURIComponent(encode(JSON.stringify({"app_signature_md5":"f73576612783f8ed8b68cdf73a56be94","app_version":"1.16","channel":"default","last_update_time":"0","book_id":$.book_id,"login_token":login_token,"account":account})))
  })}
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let args = JSON.parse(url)
  let response = POST(args.url,{data:args.data})  
  let $ = JSON.parse(decode(response)) 
  let array = []
  let volumes = {}
  $.data.division_list.forEach(booklet=> {  
  volumes[booklet.division_id] = booklet.division_name
  } )
  $.data.chapter_list_group.forEach(booklet=> {
    array.push({name:volumes[booklet.division_id]})
    vid = booklet.division_id
  booklet.chapter_list.forEach(chapter =>
   array.push({
     name: chapter.chapter_title,
     url:JSON.stringify({
       url: `${baseurl}/chapter/get_chapter_info`,
       cid: chapter.chapter_id,
       data:  "secret_content="+encodeURIComponent(encode(JSON.stringify({"app_signature_md5":"f73576612783f8ed8b68cdf73a56be94","app_version":"1.16","channel":"default","chapter_id":chapter.chapter_id,"login_token":login_token,"account":account})))
       }),
     vip: chapter.is_paid==1  
     })
    )  
  })      
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
  let args = JSON.parse(url)
  let response = POST(args.url,{data:args.data})  
  let $ = JSON.parse(decode(response)).data.chapter_info
  return $.chapter_content.trim()
}



var bookSource = JSON.stringify({
  name: "西柚",
  url: "xiyou.lfunv.com",
  version: 100
})
