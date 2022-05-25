const baseUrl = "https://www.yizhiqc.com"

const headers = ["visittype:mob"]

//搜索
const search = (key) => {
    let data = `keyWord=${encodeURI(key)}&startPage=1&isHotWorld=1`
    let response = POST(`${baseUrl}/api/stacks-search`, {
        data,
        headers
    })
    let array = []
    let $ = JSON.parse(response)
    console.log($.data.list)
    $.data.list.forEach((child) => {
        array.push({
            name: child.bookName,
            author: child.writerName,
            cover: child.bookImage,
            detail: child.bookId
        })
    })
    return JSON.stringify(array)
}

//转换更新时间 时间戳
function formatDate(timeStamp) {
    let diff = (Date.now() - timeStamp) / 1000
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

//详情
const detail = (url) => {
    let data = `bookid=${url}`
    let response = POST(`${baseUrl}/api/book-bookInfo`, {
        data,
        headers
    })
    let bookInfo = JSON.parse(response).data.bookListInfo
    let book = {
            summary: bookInfo.bookIntroduction,
            status: bookInfo.bookCheckStatus == 1 ? '连载' : '完结',
            category: bookInfo.classificationName,
            words: bookInfo.bookWorldCount,
            update: formatDate(bookInfo.lastUpdateTime),
            lastChapter: bookInfo.lastUpdateChapterName,
            catalog: `${baseUrl}/api/books-volumeChapterList/${bookInfo.bookId}`
        }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(url)
    let $ = JSON.parse(response)
    let array = []
    $.data.chapterInfo.forEach((volume, index) => {
        array.push({
            name: volume.volumeName
        })
        volume.resultList.forEach(chapter => {
            array.push({
                name: chapter.chapterTitle,
                url: chapter.chapterContent,
                vip: false
            })
        })
    })
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    return url.replace(/<LG>.+?<\/LG>/g, "\n")
}


//排行榜
const rank = (title, category, page) => {
    let data = `type=${title}&page=${page+1}`
    let response = POST(`${baseUrl}/api/ranking-book`, {
        data,
        headers
    })
    let $ = JSON.parse(response)
    let books = []
    console.log(category)
    $.data[category].list.forEach((child) => {
        books.push({
            name: child.bookName,
            author: child.writerName,
            cover: child.bookImage,
            detail: child.bookId
        })

    })
    return JSON.stringify({
        end: $.data[category].length === 0,
        books: books
    })
}

let categories=[{key:"total",value:"全部"},{key:"month",value:"月榜"},{key:"week",value:"周榜"}]
const ranks=[{title:{key:'1',value:'金票榜'}},{title:{key:'2',value:'倾城票'}},{title:{key:'3',value:'点击榜'}},{title:{key:'4',value:'新书榜'}},{title:{key:'5',value:'畅销榜'}},{title:{key:'6',value:'吐槽榜'}},{title:{key:'7',value:'更新榜'}},{title:{key:'8',value:'打赏榜'}}]
for (var i = 0; i < ranks.length; i++) {
    cate = categories
    if (i == 0) cate = categories.slice(0, 2)
    if (i == 3) cate = [{
        "key": "newBookRankingList",
        "value": "全部"
    }]
    ranks[i].categories = cate;
}


var bookSource = JSON.stringify({
    name: "一纸倾城",
    url: "yizhiqc.com",
    version: 102,
    ranks: ranks
})
