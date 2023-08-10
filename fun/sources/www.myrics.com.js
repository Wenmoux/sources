
const search = (key) => {
        setCookie("django_language","zh-hans") //注释这行就是繁体
    data = JSON.stringify({"page_limit":12,"text":key,"category":[1,2,3,5],"genres":[],"status":0,"word":0,"time":"","sort":"desc","sort_type":0,"page":1})
    let response = POST("https://www.myrics.com/search/search",{data})
    let $ = JSON.parse(response)
    let books = $.data.list.map(book => ({
        name: book.novel_title,
        author: book.pen_name,
        cover: book.image,
        summary:book.short_summary,
        detail: book.id
    }))
    return JSON.stringify(books)
}
//详情
const detail = (url) => {
    let url1 =`https://www.myrics.com/novels/${url}`
    let res = GET(url1)
    
    let $1 =HTML.parse(res)
    let token = $1('meta[name=csrf-token]').attr("content")
    let response = POST(`https://www.myrics.com/authors/api_novel_detailed/${url}`,{data:"   ",headers:[`X-Csrftoken:${token}`,'content-type:application/json',`referer:${url1}`]})
    let $ = JSON.parse(response).data
    let book = {
        summary: $.long_summary,
        status: $.finish_type,
        category: $.category,
        tags:$.geners,
        words: $.word_count,
        catalog: url,
    }
    return JSON.stringify(book)
}
 
//目录
const catalog = (url) => {
    page =1
        let array = []
    totalpage =2
    while(page<=totalpage){
    data= {
        "page_limit":12,
        "id":url,
        "sort":"asc",
        "page":page++
       }
        let response = POST(`https://www.myrics.com/novels/menu`,{data:JSON.stringify(data),headers:[`X-Csrftoken:${getCookie("X-Csrftoken")}`,'content-type:application/json',`referer:https://www.myrics.com/novels/${url}`]})
    let $ = JSON.parse(response).data
    totalpage =$.total_page
    $.list.forEach((book) => {
        array.push({
            name: book.title,
            url:"https://www.myrics.com/chapters/"+ book.id,
            vip: book.coin!="0",
            update:book.updated_at
        })
        
    })
    }
    
    return JSON.stringify(array)
}
 
//return string
const chapter = (url) => {
    
    setCookie("django_language","zh-hans") //注释这行就是繁体
    let response = GET(url,{headers:[`referer:${url}`,"User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"]})
    let $ = HTML.parse(response)
    console.log(response)
    
    return $("h1+.wysiwyg")
}
 

const ranks = [{
        title: {
            key: 'coin',
            value: '米币榜'
        }
    },
    {
        title: {
            key: 'subscribe',
            value: '订阅榜'
        }
    },
    {
        title: {
            key: 'ending',
            value: '完结榜'
        }
    }
]
let categories = [
    {
        key: "0",
        value: "日"
    },    
    {
        key: "1",
        value: "月"
    },
    {
        key: "2",
        value: "年"
    }
 
 
]
for (var i = 0; i < ranks.length; i++) {
    ranks[i].categories = categories;
}
 
const rank = (title, category, page) => {
    let url=`https://www.myrics.com/home/api_${title}_rank/16`
    let data={
        "page_limit":100,
        "index":category,
        "is_index":true,
        "page":1}
    let response = POST(url,{"data":JSON.stringify(data)})
    console.log(response)
    let $ = JSON.parse(response)
    let books = []
    $.data.list.forEach((item) => {
        books.push({
            name: item.novel_title,
            author: item.pen_name,
            cover: item.thumbnail,
            summary:item.short_summary,
            detail: item.id
        })
    })
    
    
    return JSON.stringify({
        end: page == 0,
        books
    })
}
 

var bookSource = JSON.stringify({
    name: "米国度",
    url: "www.myrics.com",
    version: 100,
    authorization: "https://www.myrics.com/login",
    cookies: [".myrics.com"],
    ranks: ranks
})
