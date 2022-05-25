const baseUrl = 'https://inf.8kana.com'

//return [{name, author, cover, detail}]
const search = (key) => {
    let response = POST(`${baseUrl}/book/search`, {
        data: `Keyword=${encodeURI(key)}`
    })
    let $ = JSON.parse(response)
    let books = $.data.Books.map(book => ({
        name: book.BookName,
        author: book.AuthorName,
        cover: book.BookCover,
        detail: JSON.stringify({
            url: `${baseUrl}/Works/book`,
            bookId: book.BookId
        })
    }))
    return JSON.stringify(books)
}

//return {summary, status, category, words, update, lastChapter, catalog}
const detail = (url) => {
    let args = JSON.parse(url)
    let response = POST(args.url, {
        data: `BookId=${args.bookId}&Type=1`
    })
    let $ = JSON.parse(response).data
    let book = {
        summary: $.Info.Note,
        status: $.Info.SeriesStatus == 1 ? '连载' : '完结',
        category: $.Info.ClassName,
        words: $.Info.TotalWords,
        update: timestampToTime($.Info.LastModifyTime),
        lastChapter: $.Read.NewChapterName,
        catalog: JSON.stringify({
            url: `${baseUrl}/book/newcatalog`,
            bookId: args.bookId
        })
    }
    return JSON.stringify(book)
}

//转换更新时间 时间戳
function timestampToTime(timestamp) {
        var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1):date.getMonth()+1) + '-';
        var D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())+ ' ';
        var h = (date.getHours() < 10 ? '0'+date.getHours():date.getHours())+ ':';
        var m = (date.getMinutes() < 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
        var s = date.getSeconds() < 10 ? '0'+date.getSeconds():date.getSeconds();
        return Y+M+D+h+m+s;
}

//return [{name, url, vip}]
const catalog = (url) => {
    let args = JSON.parse(url)
    let response = POST(args.url, {
        data: `BookId=${args.bookId}`
    })
    let vlist = []
    let array = []
    let vidlist = []
    let list = JSON.parse(response).data.ChapterList
    JSON.parse(response).data.ChapterList.forEach((booklet) => {
        if (vidlist.indexOf(booklet.VolumeId) == -1) {
            vlist.push(booklet);
            vidlist.push(booklet.VolumeId)
        }
    })
    vlist.forEach((booklet) => {
        let vid = booklet.VolumeId
        array.push({
            name: booklet.VolumeTitle
        })
        list.forEach((chapter) => {
            if (vid == chapter.VolumeId) {
                array.push({
                    name: chapter.Title,
                    url: JSON.stringify({
                        url: `${baseUrl}/long/readbook`,
                        bookId: args.bookId,
                        ChapterId: chapter.ChapterId
                    }),
                    vip: chapter.IsVip == 1
                })
            }
        })
    })

    return JSON.stringify(array)
}

//return string
const chapter = (url) => {
    let args = JSON.parse(url)
    let response = POST(args.url, {data: `bookId=${args.bookId}&chapterId=${args.ChapterId}`,headers: [`user-token: ${localStorage.getItem('UserId')}/${localStorage.getItem('UserToken')}`]
  })
    let $ = JSON.parse(response)
    //未购买返回403和自动订阅地址
    if ($.msg == '付费章节，需要购买') throw JSON.stringify({
        code: 403,
        message: `https://m.8kana.com/read/${args.ChapterId}.html`
    })
    return $.data.chapters.sections.replace(/\[kana\]/g, '\n')
}

//return {url, nickname, recharge, balance[{name, coin}], sign}
const profile = () => {
    let response = GET(`${baseUrl}/User/userinfo`,{headers: [`user-token: ${localStorage.getItem('UserId')}/${localStorage.getItem('UserToken')}`]
  })
    let $ = JSON.parse(response)
    if ($.msg === "用户Id不能为空！") throw JSON.stringify({
        code: 401
    })
    return JSON.stringify({
        basic: [{
                name: "账号",
                value: $.data.UserNickname,
                url: `https://m.8kana.com/member`
            },
            {
                name: '余额',
                value: $.data.UserCoin,
                url: `https://m.8kana.com/recharge`
            },
            {
                name: '月票',
                value: $.data.MonthNum,
                url: `https://m.8kana.com/recharge`
            },
            {
                name: '推荐票',
                value: $.data.RecommendNum,
                url: `https://m.8kana.com/recharge`
            }
        ],
    extra: [
      {
         name: '书架',
         type: 'books',
         method: 'bookshelf'
      }
    ]
  })
}

/**
 * 我的书架
 * @param {页码} page 
 */
const bookshelf = (page) => {
  let response = GET(`${baseUrl}/Bookshelf/newIndex`,{headers: [`user-token: ${localStorage.getItem('UserId')}/${localStorage.getItem('UserToken')}`]
  })
  let $ = JSON.parse(response)
  let books = $.data.map(book => ({
    name: book.BookName,
    author: book.AuthorName,
    cover: book.BookCover,
    detail: JSON.stringify({
        url: `${baseUrl}/Works/book`,
        bookId: book.BookId
        })
  }))
  return JSON.stringify({books})
}

//ranks
const rank = (title, category, page) => {
    let response = POST(`${baseUrl}/book/channel`, {
        data: `Sex=1&Class0Id=${title}&VipType=&SeriesStatus=0&SearchType=1&Page=${page + 1}`
    })
    let $ = JSON.parse(response)
    let books = JSON.parse(response).data.books.map(book => ({
        name: book.BookName,
        author: book.AuthorName,
        cover: book.BookCover,
        detail: JSON.stringify({
            url: `${baseUrl}/Works/book`,
            bookId: book.BookId
        })
    }))
    return JSON.stringify({
      end: $.data.books.length === 0,
      books: books
    })
}

const ranks = [{
        title: {
            key: '3',
            value: '烧脑'
        }
    },
    {
        title: {
            key: '6',
            value: '神州'
        }
    },
    {
        title: {
            key: '1',
            value: '轻幻想'
        }
    },
    {
        title: {
            key: '2',
            value: '重幻想'
        }
    },
    {
        title: {
            key: '4',
            value: '轻小说'
        }
    }
]

const login = (args) => {
    if(!args) return "账号或者密码不能为空!"
    let data =`UserName=${args[0]}&Password=${args[1]}` 
    let response = POST(`${baseUrl}/Passport/login`,{data})
    let $ = JSON.parse(response)
    if($.code == 0) return "账号或密码错误"
    localStorage.setItem("UserId", $.data.UserId)
    localStorage.setItem("UserToken", $.data.UserToken)
}

var bookSource = JSON.stringify({
    name: '不可能的世界',
    url: '8kana.com',
    version: 106,
    authorization: JSON.stringify(['account','password']),
    cookies: ["8kana.com"],
    ranks: ranks
})
