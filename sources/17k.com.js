//搜索
const search = (key) => {
    let response = GET(`http://api.ali.17k.com/v2/book/search?sort_type=0&app_key=4037465544&_access_version=2&cps=0&channel=2&_versions=1070&merchant=17KH5&page=1&client_type=1&_filter_data=1&class=0&key=${encodeURI(key)}`)
    let array = []
    let $ = JSON.parse(response)
    $.data.forEach((item) => {
        if (item.book_name) {
            array.push({
                name: item.book_name,
                author: item.author_name,
                cover: item.cover,
                detail: `http://api.17k.com/book/${item.book_id}/split1/merge?iltc=1&cpsOpid=0&_filterData=1&device_id=&channel=0&_versions=1160&merchant=17Kyyb&platform=2&manufacturer=Xiaomi&clientType=1&appKey=4037465544&model=&cpsSource=0&brand=Redmi&youthModel=0`,
            })
        }
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(url)
    let $ = JSON.parse(response).data[0].bookTop
    let book = {
        summary: $.introduction,
        status: $.bookStatus.name,
        category: $.bookCategory.name,
        words: $.countInfo.updateWordCount,
        update: formatDate($.lastUpdateChapter.updateTime),
        lastChapter: $.lastUpdateChapter.name,
        catalog: `http://api.17k.com/v2/book/${$.countInfo.bookId}/volumes?app_key=4037465544&price_extend=1&_versions=1070&client_type=2&_filter_data=1&channel=2&merchant=17Khwyysd&_access_version=2&cps=0&book_id=${$.countInfo.bookId}`
    }
    return JSON.stringify(book)
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

//目录
const catalog = (url) => {
    let response = GET(url)
    let $ = JSON.parse(response)
    let array = []
    let bid = $.data.book_id
    $.data.volumes.forEach((booklet) => {
        array.push({
            name: booklet.volume_name
        })
        booklet.chapters.forEach((chapter) => {
            array.push({
                name: chapter.name,
                url: `https://www.17k.com/ck/book/${bid}/chapter/${chapter.chapter_id}?subAllPrice=1&appKey=2406394919&bid=${bid}&cid=${chapter.chapter_id}`,
                vip: chapter.vip == "Y"
            })
        })
    })
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let response = GET(url)
    //同步阅读记录
    //  /* 
    // if(PERMISSION('addReadBook')){
    addReadBook(url.query('bid'), url.query('cid'))
    //   } 
    // */  
    let $ = JSON.parse(response)
    //VIP章节
    if ($.data.isVIP.id == 1) {
        //未购买返回403和自动订阅地址
        if ($.data.userReadInfo.free != 1) throw JSON.stringify({
            code: 403,
            message: `https://h5.17k.com/chapter/${url.query('bid')}/${url.query('cid')}.html`
        })
    }
    return $.data.content[0].text
}

//个人中心
const profile = () => {
    let response = GET("http://api.17k.com/user/mine/merge?access_token=1&accountInfo=1&bindInfo=1&benefitsType=1&cpsOpid=0&_filterData=1&device_id=&channel=0&_versions=1230&merchant=17Khwyysd&platform=2&manufacturer=Xiaomi&clientType=1&width=1080&appKey=4037465544&cpsSource=0&youthModel=0&height=2175")
    let $ = JSON.parse(response).data
    return JSON.stringify({
        basic: [{
                name: "账号",
                value: $.nickname,
                url: 'https://user.17k.com/h5/info/'
            },
            {
                name: 'VIP',
                value: $.vipLevel,
            },
            {
                name: 'k币',
                value: $.accountInfo.balance,
                url: 'https://pay.17k.com/h5/'
            },
            {
                name: '代金券',
                value: $.accountInfo.totalBalance,
                url: "https://user.17k.com/h5/coupons/"
            },
            {
                name: '推荐票',
                value: $.cardInfo.recommendTicketCount
            }
        ],
        extra: [{
                name: '每日任务',
                type: 'permission',
                method: 'autotask',
                times: 'day'
            },
            {
                name: '书架',
                type: 'books',
                method: 'bookshelf'
            }
        ]
    })
}
const autotask = () => {
    POST("https://h5.17k.com/userSigninH5/saveUserSigninH5.html", {
        data: "w"
    })
    //每日任务奖励
    for (id of [4, 4, 5, 6, 8]) {
        let url = "http://api.17k.com/user/task/receive-prize"
        let data = `taskId=${id}&cpsOpid=0&_filterData=1&device_id=&channel=0&_versions=1110&merchant=17Kyyb&platform=2&manufacturer=&clientType=1&appKey=4037465544&model=&cpsSource=0&brand=`
        POST(url, {
            data
        })
    }
    let response = GET("http://api.17k.com/sign/user/info?access_token=1&clientType=1&cpsOpid=0&_filterData=1&channel=0&_versions=1070&merchant=17Kyyb&appKey=4037465544&cpsSource=0&platform=2")
    return JSON.parse(response).status.msg == "succ"
}

const bookshelf = () => {
    let response = GET(`https://user.17k.com/ck/author/shelf?platform=4&appKey=1351550300`)
    let books = JSON.parse(response).data.map(book => ({
        name: book.bookName,
        author: book.authorPenName,
        cover: book.coverImg,
        detail: `http://api.17k.com/book/${book.bookId}/split1/merge?iltc=1&cpsOpid=0&_filterData=1&device_id=&channel=0&_versions=1160&merchant=17Kyyb&platform=2&manufacturer=Xiaomi&clientType=1&appKey=4037465544&model=&cpsSource=0&brand=Redmi&youthModel=0`
    }))
    return JSON.stringify({
        books
    })
}

const addReadBook = (bid, cid) => {
    //懒得判断了
    POST("https://h5.17k.com/ck/book/addReadBook", `bookId=${bid}&bookmarkChapterId=${cid}&appKey=1351550300`)
}

const ranks = [{
    title: {
        key: 2,
        value: '畅销榜'
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 15,
        value: "礼物榜"
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 3,
        value: "红包榜",
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 9,
        value: "新书榜"
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 10,
        value: "人气榜"
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 11,
        value: "完本榜"
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 5,
        value: "热评榜"
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 6,
        value: "更新榜"
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 12,
        value: "荣誉榜"
    },
    categories: [{
        key: "2",
        value: "女生"
    }, {
        key: "3",
        value: "女生"
    }]
}, {
    title: {
        key: 13,
        value: "出版书榜"
    },
    categories: [{
        key: "1",
        value: "周"
    }, {
        key: "2",
        value: "月"
    }, {
        key: "3",
        value: "总"
    }]
}, {
    title: {
        key: 7,
        value: "推荐票榜"
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 8,
        value: "包月书榜"
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}, {
    title: {
        key: 14,
        value: "免费书榜"
    },
    categories: [{
        key: "2&orderTime=1",
        value: "男生·周"
    }, {
        key: "2&orderTime=2",
        value: "男生·月"
    }, {
        key: "2&orderTime=3",
        value: "男生·总"
    }, {
        key: "3&orderTime=1",
        value: "女生·周"
    }, {
        key: "3&orderTime=2",
        value: "女生·月"
    }, {
        key: "3&orderTime=3",
        value: "女生·总"
    }]
}]

const rank = (title, category, page) => {
    let response = GET(`http://api.17k.com/book/rank/client?classId=${category}&orderBy=1&page=${page+1}&type=${title}&clientType=1&cpsOpid=0&_filterData=1&channel=0&_versions=1070&merchant=17Kyyb&appKey=4037465544&cpsSource=0&platform=2`)
    let $ = JSON.parse(response)
    let books = []
    $.data.forEach((item) => {
        books.push({
            name: item.bookName,
            author: item.authorPenName,
            cover: item.coverImg,
            detail: `http://api.17k.com/book/${item.id}/split1/merge?iltc=1&cpsOpid=0&_filterData=1&device_id=&channel=0&_versions=1160&merchant=17Kyyb&platform=2&manufacturer=Xiaomi&clientType=1&appKey=4037465544&model=&cpsSource=0&brand=Redmi&youthModel=0`,
        })
    })
    return JSON.stringify({
        end: page + 1 == $.totalPage,
        books
    })
}

var bookSource = JSON.stringify({
    name: "17k小说",
    url: "17k.com",
    version: 102,
    authorization: "https://passport.17k.com/login",
    cookies: [".17k.com"],
    ranks: ranks
})
