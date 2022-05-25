const baseUrl = "https://client4xcx.faloo.com"

//搜索
const search = (key) => {
  let response = POST(`https://client4xcx.faloo.com/V4.1/xml4android_listPage.aspx`,{data:`k=${encodeURI(key)}`})
  let array = []
  let $ = JSON.parse(response)
  $.data.forEach((child) => {
    array.push({
      name: child.name,
      author: child.author,
      cover: child.cover,
      detail: child.id,
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
  let response = POST(`https://client4xcx.faloo.com/V4.1/Xml4Android_relevantPage.aspx`,{data:`id=${url}`})
  let $ = JSON.parse(response)
  let book = {
    summary: $.data.intro,
    status: $.data.finish == 0 ? '连载' : '完结',
    category: $.data.tags.map((item)=>{ return item.name}).join(" "),
    words: $.data.count,
    update: $.data.update,
    lastChapter: $.data.nn_name,
    catalog: $.data.id
  }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let response = POST(`https://client4xcx.faloo.com/V4.1/Xml4android_novel_listPage.aspx`,{data:`id=${url}`})
  let $ = JSON.parse(response)
  let array = []
  $.data.vols.forEach((booklet) => {
    array.push({ name: booklet.name })
    booklet.chapters.forEach((chapter) => {
      array.push({
        name: chapter.name,
        url: `id=${url}&n=${chapter.id}`,
        vip: chapter.vip == 1
      })
    })
  })
  return JSON.stringify(array)
}

function image_do3(num, o, id, n, en, t, k, u, time, fontsize, fontcolor, chaptertype, font_family_type, backgroundtype) {
  var type = 1;
  var domain = "https://read.faloo.com/";  
  var backgroundtype = 1;
  var path = "Page4VipImage.aspx?num=" + num + "&o=" + o + "&id=" + id + "&n=" + n + "&ct=" + chaptertype + "&en=" + en + "&t=" + t + "&font_size=" + fontsize + "&font_color=" + fontcolor + "&backgroundtype=" + backgroundtype + "&FontFamilyType=" + font_family_type + "&u=" + u + "&time=" + time + "&k=" + k;
  var url = domain + path + "&ran=" + new Date().getTime();
  url = encodeURI(url);
  return url
}

//章节
const chapter = (url) => {
  let $ = JSON.parse(POST(`https://client4xcx.faloo.com/V4.1/Xml4Android_ContentPage.aspx`,{data:`${url}`}))
  if($.code == 200) return $.data.content.trim()
  if($.msg == "VIP章节请下载飞卢小说App观看。") {
    let res = GET(`https://wap.faloo.com/${url.replace("id=","").replace("&n=","_")}.html`)
    let $1 = HTML.parse(res)
    if ($1('div.nodeContent').text() == "您还没有登录 请登录后在继续阅读本部小说！ 立即登录 注册账号"||$1('div.nodeContent').text() == "您还没有订阅本章节（VIP章节） 体验懒人阅读模式 我要体验 解读：随看随订，省去反复订阅的烦恼，感受极佳阅读体验。 设置自动订阅最新章节(免费) 马上设置 解读：系统将第一时间为您订阅最新发布的章节 请订阅 订阅本章"||$1('div.nodeContent').text() == "非VIP会员,不能阅读作者最新更新的VIP章节。"||$1('div.nodeContent').text() == "您的账户余额不足 请充值！ 立即充值") throw JSON.stringify({
      code: 403,
      message: `https://wap.faloo.com/${url.replace("id=","").replace("&n=","_")}.html`
    })
    let code = res.match(/image_do3\(.+?\)/)[0]
    let imageurl = eval(code)
    return `<img src="${imageurl}" />`
  }        
}


//个人中心
const profile = () => {
  let response = GET(`https://u.faloo.com`)
  let $ = HTML.parse(response)
  return JSON.stringify({
    basic: [
      {
        name: '账号',
        value: $('.logo > span > img').attr('alt'),
        url: 'https://u.faloo.com'
      },
      {
        name: 'VIP点',
        value: $('ul > li:nth-child(7) > div.sInfo > div > i').text(),
        url: 'https://pay.faloo.com/'
      },
      {
        name: '点券',
        value: $('ul > li:nth-child(8) > div.sInfo > div > i').text(),
        url: 'https://pay.faloo.com/'
      },	  
      {
        name: '月票',
        value: $('ul > li:nth-child(5) > div.sInfo > div > i').text(),
        url: 'https://pay.faloo.com/'
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
  let response = GET(`https://u.faloo.com/UserFavoriate.aspx`)
  let array = []
  let $ = HTML.parse(response)
  $('.recentCollectContent > ul > li').forEach((child) => {
    let $ = HTML.parse(child)
    array.push({
      name: $('.bookName').text(),
      author: $('.spanAuthor').text(),
      cover: $('.collectBookPic > a > img').attr('src'),
      detail: $('.bookName').attr('href').replace("http://b.faloo.com/","").replace('.html',""),
    })
  })
  return JSON.stringify({
    books: array
  })
}

//排行榜
const rank = (title, category, page) => {
  let response = POST(`${baseUrl}/V4.1/xml4android_listPage.aspx`,{data:`c=${title}&a=0&page=${page}`})
  let $ = JSON.parse(response)
  let books = []
  $.data.forEach((child) => {
    books.push({
      name: child.name,
      author: child.author,
      cover: child.cover,
      detail: child.id
    })
  })
  return JSON.stringify({
    end:  $.data === null,
    books: books
  })
}


const ranks = [
    {
        title: {
            key: '97',
            value: '轻小说'
        }
    },
    {
        title: {
            key: '1',
            value: '玄幻奇幻'
        }
    },
    {
        title: {
            key: '6',
            value: '武侠仙侠'
        }
    },
    {
        title: {
            key: '44',
            value: '同人小说'
        }
    },
    {
        title: {
            key: '4',
            value: '都市言情'
        }
    },
    {
        title: {
            key: '7',
            value: '青春校园'
        }
    },
    {
        title: {
            key: '3',
            value: '军事历史'
        }
    },
    {
        title: {
            key: '2',
            value: '科幻网游'
        }
    },
    {
        title: {
            key: '5',
            value: '恐怖灵异'
        }
    },
    {
        title: {
            key: '54',
            value: '女生小说'
        }
    }
]

var bookSource = JSON.stringify({
  name: "飞卢",
  url: "faloo.com",
  version: 106,  
  authorization: `https://u.faloo.com/regist/Login.aspx`,
  cookies: ["faloo.com"],
  ranks: ranks
})
