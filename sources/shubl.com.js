require("crypto-js")

let login_token=localStorage.getItem("token")?localStorage.getItem("token"):"2545b2d4237eefbc78a11ed3a95cae61"

let account =localStorage.getItem("account")?localStorage.getItem("account"):"萌友121078118744"

function encode(word) {
    let key = CryptoJS.enc.Base64.parse("nvlrM3RT6n0iYj4I/zbGqisUGGMpy3UT84cNphYONC8=");
    let iv = CryptoJS.enc.Base64.parse("AAAAAAAAAAAAAAAAAAAAAA==");  
    str = CryptoJS.AES.encrypt(word, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })
    return str.toString()
}
function decode(word) {
    let key = CryptoJS.enc.Base64.parse("nvlrM3RT6n0iYj4I/zbGqisUGGMpy3UT84cNphYONC8=");
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
 let data="secret_content="+encodeURIComponent(encode(JSON.stringify({"app_signature_md5":"f73576612783f8ed8b68cdf73a56be94","app_version":"2.1.6","channel":"default","order":"week_click","count":"15","category_type":"1","page":0,"key":key,"login_token":"d21bbcae2da566e0d3c8d7dc02793563","account":"萌友841068377319"})))
  let response = POST("https://app.shubl.com/bookcity/get_filter_search_book_list",{data})
  let array = []
  let $ = JSON.parse(decode(response))
  $.data.book_list.forEach((child) => {
    array.push({
      name: child.book_name,
      author: child.author_name,
      cover: child.cover,
      detail: JSON.stringify({
      url: "https://app.shubl.com/book/get_info_by_id",
      bid: child.book_id
      })
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
  let args = JSON.parse(url)
  let data =  "secret_content="+encodeURIComponent(encode(JSON.stringify({"app_signature_md5":"f73576612783f8ed8b68cdf73a56be94","app_version":"2.1.6","channel":"default","book_id":args.bid,"login_token":login_token,account:account})))
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
       url: "https://app.shubl.com/chapter/get_chapter_list_group_by_division",
       data:  "secret_content="+encodeURIComponent(encode(JSON.stringify({"app_signature_md5":"f73576612783f8ed8b68cdf73a56be94","app_version":"2.1.6","channel":"default","last_update_time":"0","book_id":$.book_id,"login_token":login_token,"account":account})))
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
       url: "https://app.shubl.com/chapter/get_chapter_info",
       cid: chapter.chapter_id,
       data:  "secret_content="+encodeURIComponent(encode(JSON.stringify({"app_signature_md5":"f73576612783f8ed8b68cdf73a56be94","app_version":"2.1.6","channel":"default","chapter_id":chapter.chapter_id,"login_token":login_token,"account":account})))
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
    //未购买返回403和自动订阅地址(
    if ($.is_paid == 1 && $.auth_access == 0) throw JSON.stringify({
        code: 403,
        message: `https://m.shubl.com/chapter/book_chapter_detail/${args.cid}`
    })
  return $.txt_content + "\n  作者有话说：\n  "+$.author_say
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  if (login_token == "2545b2d4237eefbc78a11ed3a95cae61") throw JSON.stringify({
        code: 401
    })
    let headers = ["User-Agent: DanNovel/2.1.1"]
    let url = "https://app.shubl.com/reader/get_my_info"
    let data =  "secret_content="+encodeURIComponent(encode(JSON.stringify({"account": account,"login_token": login_token,"app_version": "2.1.1"})))
    let res = POST(url,{data,headers})
    let $ = JSON.parse(decode(res))
    return JSON.stringify({
        basic: [
            {
                name: '账号',
                value: $.data.reader_info.reader_name,
                url: 'https://m.shubl.com/reader/get_my_info'
            },
            {
                name: '阅读币',
                value: $.data.prop_info.rest_hlb,
                url: 'https://m.shubl.com/recharge/index',
            },
            {
                name: '月票',
                value: $.data.prop_info.rest_yp,
                url: 'https://m.shubl.com/recharge/index',
            },            
            {
                name: '推荐票',
                value: $.data.prop_info.rest_recommend,
                url: 'https://m.shubl.com/recharge/index',
            },            
            
        ],
    extra: [
      {
              name: '自动签到',
              type: 'permission',
              method: 'sign',
              times: 'day'
      }
    ]
  })
}


function sign(){
let url = "https://app.shubl.com/reader/get_daily_task_bonus"
let data =  "secret_content="+encodeURIComponent(encode(JSON.stringify({"app_version": "2.1.1","account": account,"task_type": "1","login_token": login_token})))
let headers = ["User-Agent: DanNovel/2.1.1"]
  POST(url,{data,headers})
  let res = POST(url,{data,headers})
  return JSON.parse(decode(res)).tip == "您已签到"
}

//排行榜
const rank = (title, category, page) => {
  let url = "https://app.shubl.com/bookcity/get_rank_book_list"
  let data = "secret_content="+encodeURIComponent(encode(JSON.stringify({"account": account,"app_version": "2.1.1","order": title,"count": 100,"time_type": category,"category_type": "20","login_token": login_token,"page": page})))
  let response = POST(url,{data})  
  let $ = JSON.parse(decode(response))
  let books = []
  $.data.book_list.forEach((child) => {
    books.push({
      name: child.book_name,
      author: child.author_name,
      cover: child.cover,
      detail: JSON.stringify({
        url: "https://app.shubl.com/book/get_info_by_id",
        bid: child.book_id
       })
      })
    })
  return JSON.stringify({
    end: page != 0,
    books: books
  })
}


const ranks = [
    {
        title: {
            key: 'favor',
            value: '收藏榜'
        }
    },
    {
        title: {
            key: 'click',
            value: '点击榜'
        }
    },
    {
        title: {
            key: 'blade',
            value: '催更榜'
        }
    },
    {
        title: {
            key: 'fans_value',
            value: '畅销榜'
        }
    },
    {
        title: {
            key: 'word_count',
            value: '更新榜'
        }
    },
    {
        title: {
            key: 'yp',
            value: '月票榜'
        }
    },
    {
        title: {
            key: 'recommend',
            value: '推荐榜'
        }
    },
    {
        title: {
            key: 'yp_new',
            value: '新书榜'
        }
    }          
]
let categories = [{"key": "week","value": "周榜"}, {"key": "month","value": "月榜"}, {"key": "total","value": "总榜"}]
for (var i = 0; i < ranks.length; i++) {
    ranks[i].categories = categories;
}

const login = (args) => {
    if(args.length!=2&&!args) return "账号或者密码不能为空"
    let data = "secret_content="+encodeURIComponent(encode(JSON.stringify( {"login_name":args[0],"passwd":args[1],"app_signature_md5":"f73576612783f8ed8b68cdf73a56be94","app_version":"2.1.6","channel":"default"})))    
    let response = POST("https://app.shubl.com/signup/login",{data})   
    let $ = JSON.parse(decode(response))
    if($.code == 210003 || $.code == 210002) return "账号或密码不正确~"
    localStorage.setItem("token", $.data.login_token)
    localStorage.setItem("account", $.data.reader_info.account)
}

var bookSource = JSON.stringify({
  name: "书耽",
  url: "shubl.com",
  version: 101,
  authorization: JSON.stringify(['account','password']),
  cookies: ["shubl.com"],
  ranks: ranks
})
