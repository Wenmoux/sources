require('crypto-js')

const baseUrl = 'https://app.duread8.com'

const login_token = localStorage.getItem('login_token')

const account = localStorage.getItem('account')

const encrypt = function (data) {
  let key = CryptoJS.enc.Hex.parse('10FF7D32393905CE632272E729F52045A3A8D286665003454439B27F4E6E4F1F')
  let iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')
  encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

const decrypt = function (data) {
  let key = CryptoJS.enc.Hex.parse('10FF7D32393905CE632272E729F52045A3A8D286665003454439B27F4E6E4F1F')
  let iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')
  decrypted = CryptoJS.AES.decrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let data = `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
    key: key,
    login_token: login_token,
    account: account
  })))}`
  let res = JSON.parse(decrypt(POST(`${baseUrl}/bookcity/get_filter_search_book_list`,{data})))
  let array = []
  res.data.book_list.forEach(($) => {
    array.push({
      name: $.book_name,
      author: $.author_name,
      cover: $.cover,
      detail: JSON.stringify({
        url: `${baseUrl}/book/get_info_by_id`,
        data: `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
          book_id:$.book_id,
          login_token: login_token,
          account: account
        })))}`
      })
    })
  })
  return JSON.stringify(array)
}

/**
 * 详情
 * @params {string} url
 * @returns {[{summary, status, category, words, update, lastChapter, catalog}]}
 */
const detail = (url) => {
  let args = JSON.parse(url)
  let $ = JSON.parse(decrypt(POST(args.url, {data: args.data}))).data.book_info
  let book = {
    summary: $.description,
    status: $.up_status == 1 ? '完结':'连载',
    category: $.tag.replace(/,/g, ' '),
    words: $.total_word_count,
    update: $.uptime,
    lastChapter: $.last_chapter_info.chapter_title,
    catalog: JSON.stringify({
      url: `${baseUrl}/chapter/get_chapter_list_group_by_division`,
      data: `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
        book_id:$.book_id,
        login_token: login_token,
        account: account
      })))}`
    })
  }
  return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
  let args = JSON.parse(url)
  let array = []
  let res = JSON.parse(decrypt(POST(args.url, {data: args.data}))).data
  let v = {}
  res.division_list.forEach((booklet) => { 
  v[booklet.division_id] = booklet.division_name
  })
  res.chapter_list_group.forEach((booklet) => {
    array.push({name:v[booklet.division_id]})
    booklet.chapter_list.forEach((chapter) => {
      array.push({
        name: chapter.chapter_title,
        url:JSON.stringify({
          url: `${baseUrl}/chapter/get_chapter_info`,
          data: `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
            chapter_id: chapter.chapter_id,
            login_token: login_token,
            account: account
          })))}`
        }),
        vip: chapter.is_paid == 1
      })
    })
  })
  return JSON.stringify(array)
}

/**
 * 章节
 * @params {string} url
 * @returns {string}
 */
const chapter = (url) => {
  let args = JSON.parse(url)
  let $ = JSON.parse(decrypt(POST(args.url, {data: args.data}))).data.chapter_info
  //未购买返回403和自动订阅地址
  if ($.auth_access == 0) throw JSON.stringify({
    code: 403,
    message: `https://m.duread8.com/chapter/book_chapter_detail/${$.chapter_id}`
  })
  return $.txt_content.trim()
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  let data = `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
    login_token: login_token,
    account: account
  })))}`
  let $ = JSON.parse(decrypt(POST(`${baseUrl}/reader/get_my_info`,{data}))).data
  return JSON.stringify({
    basic: [
    {
      name: '账号',
      value: $.reader_info.reader_name,
      url: 'https://m.duread8.com/reader/get_my_info'
    },
    {
      name: '书币',
      value: $.prop_info.rest_hlb,
      url: 'https://m.duread8.com/recharge/index',
    },
    {
      name: '赠币',
      value: $.prop_info.rest_gift_hlb,
      url: 'https://m.duread8.com/recharge/index',
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
  let da = `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
    login_token: login_token,
    account: account
  })))}`
  let res = JSON.parse(decrypt(POST(`${baseUrl}/bookshelf/get_shelf_list`,{data:da}))).data
  let books = []
  res.shelf_list.forEach((shelf) => {
    let data = `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
      shelf_id: shelf.shelf_id,
      login_token: login_token,
      account: account
    })))}`
    let $ = JSON.parse(decrypt(POST(`${baseUrl}/bookshelf/get_shelf_book_list`,{data})))
    $.data.book_list.forEach((book) => {
      books.push({
        name: book.book_info.book_name,
        author: book.book_info.author_name,
        cover: book.book_info.cover,
        detail: JSON.stringify({
          url: `${baseUrl}/book/get_info_by_id`,
            data: `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
              book_id: book.book_info.book_id,
              login_token: login_token,
              account: account
            })))}`
        })
      })
    })
  })
  return JSON.stringify({books})
}

//排行榜
const rank = (title, category, page) => {
  let data = `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
    count: "15",
    page: page,
    category_index: title,
    order: "week_click",
    login_token: login_token,
    account: account
  })))}`
  let $ = JSON.parse(decrypt(POST(`${baseUrl}/bookcity/get_filter_search_book_list`,{data})))
  let books = []
  $.data.book_list.forEach((child) => {
    books.push({
      name: child.book_name,
      author: child.author_name,
      cover: child.cover,
      detail: JSON.stringify({
        url: `${baseUrl}/book/get_info_by_id`,
        data: `secret_content=${encodeURIComponent(encrypt(JSON.stringify({
          book_id:child.book_id,
          login_token: login_token,
          account: account
         })))}`
      })
    })
  })
  return JSON.stringify({
    end:  $.data.book_list.length === 0,
    books: books
  })
}


const ranks = [
    {
        title: {
            key: '1',
            value: '西幻传说'
        }
    },
    {
        title: {
            key: '2',
            value: '武侠仙侠'
        }
    },
    {
        title: {
            key: '3',
            value: '游戏动漫'
        }
    },
    {
        title: {
            key: '4',
            value: '科幻时空'
        }
    },
    {
        title: {
            key: '5',
            value: '都市逸闻'
        }
    },
    {
        title: {
            key: '6',
            value: '军事历史'
        }
    },
    {
        title: {
            key: '7',
            value: '诡异悬疑'
        }
    }
]

const login = (args) => {
  if(!args) return "账号或者密码不能为空"
  let data =`secret_content=${encodeURIComponent(encrypt(JSON.stringify({
    login_name: args[0],
    passwd: args[1]
  })))}`
  let $ = JSON.parse(decrypt(POST(`https://app.duread8.com/signup/login`,{data})))
  if($.code != 100000) return $.tip
  localStorage.setItem("login_token", $.data.login_token)
  localStorage.setItem("account", $.data.reader_info.account)
}

var bookSource = JSON.stringify({
  name: "独阅读",
  url: "duread8.com",
  version: 101,
  authorization: JSON.stringify(['account','password']),
  cookies: ["duread8.com"],
  ranks: ranks
})
