const baseUrl = "https://www.po18.tw"
const search = (key) => {
    let url = "https://www.po18.tw"
    let res = GET(url)
    tk = res.match(/_po18rf-tk001\" value=\"(.+?)\">/)[1]     
    data = `searchtype=all&name=${encodeURI(key)}&_po18rf-tk001=${tk}`
    setCookie("_po18rf-tk001",getCookie("_po18rf-tk001"))
    let response = POST("https://www.po18.tw/search/index", {
        data,
    headers:[  'content-type:application/x-www-form-urlencoded','User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36']})
    let array = []    
    let $ = HTML.parse(response)
    $('.book').forEach((child) => {
        let $ = HTML.parse(child)
        array.push({
            name: $('.book_name>a').text(),
            author: $('.book_author').text(),
            summary:$(".intro").text(),
            cover: $('img').attr('src'),
            detail: `${baseUrl}${$('.book_name>a').attr('href')}`,
        })
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    tags =$(".book_intro_tags>a")
    tagss=[]
    for( tag of tags){tagss.push(tag.text())}
    let book = {
        summary: $('.B_I_content').text(),
        status: /已完結/.test($('dd.statu').text()) ? "完结" : "连载",
        category: $(".tag").text(),
        lastChapter: $(".C_wrapbox>h4").text(),
        update: $(".C_wrapbox>.date").text().replace(/公開 /, ""),
        cover:$(".book-cover>img").attr("src"),
        tags:tagss,
        words:$(".table_book_data").text().match(/總字數 (\d+)/)[1],
        catalog: url + "/articles"
    }
    console.log(book.tags)
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(url)
    let $ = HTML.parse(response)
    let array = []
    $('#w0>div').forEach((booklet) => {
        let $ = HTML.parse(booklet)
        array.push({
            name: $(".l_chaptname").text(),
            url: `${baseUrl}${$(".btn_L_blue").attr("href")}`,
            vip: /訂購/.test(booklet)
        })
    })
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    if (url === 'https://www.po18.tw') throw JSON.stringify({
        code: 403,
        message: "请先订阅"
    })
    url1 = url.replace("articles", "articlescontent")
    let response = GET(url1, {
        headers: [`referer: ${url}`]
    })
    let $ = HTML.parse(response)
    let content = ""
    $('p').forEach((child) => {
        content += child
    })
    return content
}


const profile = () => {
let res= GET('https://www.po18.tw/panel') 
    let $ = HTML.parse(res) 
       if (/登入/.test(res)) throw JSON.stringify({
        code: 401
    })
    return JSON.stringify({
        basic: [{
                name: '昵稱',
                value: $('.memberInfo>h3').text().replace("會員資料編輯", ""),
                url: 'https://www.po18.tw/panel'
            },
            {
                name: '可用餘額',
                value: $('.money').text().match(/\d+/)[0],
                url: 'https://www.po18.tw/bill'
            }
        ],
        extra: [{
            name: '書櫃',
            type: 'books',
            method: 'bookshelf'
        }]
    })
}
const ranks = [
   {
        title: {
            key: 'sex',
            value: '人氣榜'
        },
        categories: [{
                key: "sex&type=weekly",
                value: "週"
            },{
               key:"sex&type=monthly" ,
               value:"月"
            },
            {
            key:"sex&type=total" ,
            value:"總"   
            }
            
        ]
    },
    {
        title: {
            key: 'pearl',
            value: '珍珠榜'
        },
        categories: [{
                key: "pearl&type=weekly",
                value: "週"
            },{
               key:"pearl&type=monthly" ,
               value:"月"
            },
            {
            key:"pearl&type=total" ,
            value:"總"   
            }
            
        ]
    }  ,
    {
        title: {
            key: 'sex',
            value: '訂購榜'
        },
        categories: [{
                key: "bestsale&type=weekly",
                value: "週"
            },{
               key:"bestsale&type=monthly" ,
               value:"月"
            },
            {
            key:"bestsale&type=total" ,
            value:"總"   
            }
            
        ]
    } ,
    {
        title: {
            key: 'sex',
            value: '收藏榜'
        },
        categories: [{
                key: "stocked&type=weekly",
                value: "週"
            },{
               key:"stocked&type=monthly" ,
               value:"月"
            },
            {
            key:"stocked&type=total" ,
            value:"總"   
            }
            
        ]
    } ,
    {
        title: {
            key: 'sex',
            value: '留言榜'
        },
        categories: [{
                key: "mostcomments&type=weekly",
                value: "週"
            },{
               key:"mostcomments&type=monthly" ,
               value:"月"
            },
            {
            key:"mostcomments&type=total" ,
            value:"總"   
            }
            
        ]
    } ,
    {
        title: {
            key: 'me',
            value: '书柜'
        },
        categories: [{
                key: "buyed_lists",
                value: "買過的書"
            },{
               key:"stocks" ,
               value:"收藏的書"
                
            }
            
        ]
    }
    
]

const rank = (title,category,page) => {
    books = []
    if(title ==="me"){
    let response = GET(`https://www.po18.tw/panel/stock_manage/${category}`)
    $ = HTML2.parse(response)
    
    $('tbody>.alt-row').forEach((book) => {
        books.push({
            name: book.select('a').text(),
            detail: `${baseUrl}${book.select('a').attr('href')}`,
            author:book.select(".T_author").text(),

            cover:"https://imgfzone.tooopen.com/20201106/tooopen_v11011311323157.jpg"
        })
    })
    }else{
        let urltk = "https://www.po18.tw"
    let restk = GET(urltk)
    tk = restk.match(/_po18rf-tk001\" value=\"(.+?)\">/)[1] 
   let url ="https://www.po18.tw/rank/more" 
   let data=`_po18rf-tk001=${tk}&kind=${category}`   
    let response = POST(url, {
        data,
    headers:[  'content-type:application/x-www-form-urlencoded','User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36']})
    let array = []    
    let $ = HTML.parse(response)
    $('.row').forEach((child) => {
        let $ = HTML.parse(child)
        console.log(child)
        books.push({
            name: $('.r2>a').text(),
            author: $('.r4>a').text(),
         //   summary:$(".intro").text(),
        //    cover: $('img').attr('src'),
            detail: `${baseUrl}${$('.r2>a').attr('href')}`,
        })
    })
    console.log(books)    
    }
    return JSON.stringify({
        books:books,
        end: page ==0
    })
}

var bookSource = JSON.stringify({
    name: "po18臉紅心跳",
    url: "www.po18.tw",
    authorization: "https://members.po18.tw/apps/login.php",
    cookies: [".po18.tw"],
    version: 101,
    ranks:rank
})
