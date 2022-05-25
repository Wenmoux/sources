require('crypto-js')

const baseUrl = 'https://app.hbooker.com'

const token = {
  app_version: '2.8.008',
  device_token: 'ciweimao_a01b7e3e8c0a73bf',
}

const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')

/**
 * 解密
 * @param {String} data 加密数据
 * @param {String} key 解密密钥
 * @returns {String} 解密后的内容
 */
const decrypt = function (data, key) {
  key = CryptoJS.SHA256(key ? key : 'zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn')
  var decrypted = CryptoJS.AES.decrypt(data, key, {
    mode: CryptoJS.mode.CBC,
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * 包装的请求体
 * 只封装了 GET 请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Boolean|Undefined} full 可选，是否传回完整响应体
 * @returns {Object} 解密后的内容对象
 */
const CGET = function (url, data, full) {
  url = baseUrl + url
  url += url.includes('?') ? '&' : '?'
  data = Object.assign(
    data ? data : {},
    token,
    url == '/signup/login' ?
      {} :
      {
        login_token: localStorage.getItem('loginToken'),
        account: localStorage.getItem('account'),
      }
  )
  for (let key in data) {
    url += `${key}=${data[key]}&`
  }
  url = url.slice(0, -1)
  let res = GET(url, {
    headers: [
      'User-Agent: Android com.kuangxiangciweimao.novel 2.8.008, Google, Pixel5',
    ],
  })
  res = JSON.parse(decrypt(res))
  return full ? res : res.data
}

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let res = CGET('/bookcity/get_filter_search_book_list', {
    count: 30,
    key: key,
  })
  let arr = res.book_list.map((e) => {
    return {
      name: e.book_name,
      author: e.author_name,
      cover: e.cover,
      detail: `/book/get_info_by_id?book_id=${e.book_id}`,
    }
  })
  return JSON.stringify(arr)
}

/**
 * 详情
 * @params {string} url
 * @returns {[{summary, status, category, words, update, lastChapter, catalog}]}
 */
const detail = (url) => {
  let res = CGET(url)
  let binfo = res.book_info
  let book = {
    summary: binfo.description,
    status: binfo.up_status == '1' ? '完结' : '连载',
    category: binfo.tag.split(",").slice(0,3).join(' '),
    words: binfo.total_word_count,
    update: binfo.uptime,
    lastChapter: binfo.last_chapter_info.chapter_title,
    catalog: `/book/get_division_list?book_id=${binfo.book_id}`,
  }
  return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
  let dres = CGET(url)
  let dlist = dres.division_list
  let arr = []
  dlist.forEach((d) => {
    arr.push({
      name: d.division_name,
    })
    let cres = CGET('/chapter/get_updated_chapter_by_division_id', {
      division_id: d.division_id,
    })
    let clist = cres.chapter_list
    //过滤未审核章节
    var result = clist.filter(function(item) {
	return item.is_valid == 1
});
    result.forEach((c) => {
      arr.push({
        name: c.chapter_title,
        url: c.chapter_id,
        vip: c.auth_access != '1' ? true : false,
      })
    })
  })
  return JSON.stringify(arr)
}

/**
 * 章节
 * @params {string} url
 * @returns {string}
 */
const chapter = (cid) => {
  let kres = CGET('/chapter/get_chapter_cmd', {
    chapter_id: cid,
  })
  let key = kres.command
  let cres = CGET('/chapter/get_cpt_ifm', {
    chapter_command: key,
    chapter_id: cid,
  })
  let txt = cres.chapter_info.txt_content
  txt = decrypt(txt, key)
  txt = txt.trim()
  ps = cres.chapter_info.author_say
  //未购买返回 403 和自动订阅地址
  if (cres.chapter_info.auth_access == 0) throw JSON.stringify({
    code: 403,
    message: `https://wap.ciweimao.com/chapter/${cid}`
  })
  return txt + "\r\n" + ps
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  let res = CGET('/reader/get_my_info')
  return JSON.stringify({
    basic: [{
      name: '账号',
      value: res.reader_info.reader_name,
    },
    {
      name: '猫饼干',
      value: res.prop_info.rest_hlb-res.prop_info.rest_gift_hlb,
      url: 'https://wap.ciweimao.com/recharge/index',
    },
    {
      name: '欢乐币',
      value: res.prop_info.rest_gift_hlb,
      url: 'https://wap.ciweimao.com/recharge/index',
    },
    {
      name: '推荐票',
      value: res.prop_info.rest_recommend,
    },
    {
      name: '月票',
      value: res.prop_info.rest_yp,
    },
    {
      name: '刀片',
      value: res.prop_info.rest_total_blade,
    },
    ],
    extra: [{
      name: '自动签到',
      type: 'permission',
      method: 'sign',
      times: 'day',
    },
    {
      name: '书架',
      type: 'books',
      method: 'bookshelf'
    }
    ],
  })
}

//书架
const bookshelf = () => {
  let shelves = CGET('/bookshelf/get_shelf_list', {})
  let books = []
  shelves.shelf_list.forEach((shelf) => {
    let bres = CGET('/bookshelf/get_shelf_book_list_new', {
      count: 99999,
      shelf_id: shelf.shelf_id,
      page: 0
    })
    bres.book_list.forEach((book) => {
      books.push({
        name: book.book_info.book_name,
        author: book.book_info.author_name,
        cover: book.book_info.cover,
        detail: `/book/get_info_by_id?book_id=${book.book_info.book_id}`

      })
    })
  })
  return JSON.stringify({
    books
  })
}

const sign = () => {
  let rres = CGET('/task/get_sign_record')
  let d = new Date()
  let date =
    d.getFullYear() +
    '-' +
    (d.getMonth() + 1).toString().padStart(2, '0') +
    '-' +
    d.getDate().toString().padStart(2, '0')
  let robj = rres.sign_record_list.find((r) => r.date == date)
  if (robj.is_signed != '0') return true
  CGET('/reader/get_task_bonus_with_sign_recommend', {
    task_type: 1,
  })
  return true
}

const ranks = [{
  title: {
    key: 'no_vip_click',
    value: '点击榜',
  },
  categories: [{
    key: 'week',
    value: '周榜'
  },
  {
    key: 'month',
    value: '月榜'
  },
  ],
},
{
  title: {
    key: 'fans_value',
    value: '畅销榜',
  },
  categories: [{
    key: 'week',
    value: '24 时'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'yp',
    value: '月票榜',
  },
  categories: [{
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'yp_new',
    value: '新书榜',
  },
},
{
  title: {
    key: 'favor',
    value: '收藏榜',
  },
  categories: [{
    key: 'week',
    value: '三日'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'recommend',
    value: '推荐榜',
  },
  categories: [{
    key: 'week',
    value: '周榜'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'blade',
    value: '刀片榜',
  },
  categories: [{
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'word_count',
    value: '更新榜',
  },
  categories: [{
    key: 'week',
    value: '周榜'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'tsukkomi',
    value: '吐槽榜',
  },
  categories: [{
    key: 'week',
    value: '周榜'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'complet',
    value: '完本榜',
  },
  categories: [{
    key: 'month',
    value: '月榜'
  }],
},
{
  title: {
    key: 'track_read',
    value: '追读榜',
  },
  categories: [{
    key: 'week',
    value: '三日'
  }],
},
]

const rank = (title, category, page) => {
  let array = []
  let res = CGET('/bookcity/get_rank_book_list', {
    order: title,
    time_type: category,
    category_index: 0,
    count: 20,
    page: page,
  })
  res.book_list.forEach((r) => {
    array.push({
      name: r.book_name,
      author: r.author_name,
      cover: r.cover,
      detail: `/book/get_info_by_id?book_id=${r.book_id}`,
    })
  })
  return JSON.stringify({
    end: res.book_list.length < 20,
    books: array,
  })
}

const login = (args) => {
  if (!args) return '参数不能为空'
  let res = CGET(
    '/signup/login', {
    login_name: args[0],
    passwd: args[1],
  },
    true
  )
  if (res.tip) return res.tip
  let loginToken = res.data.login_token
  let account = res.data.reader_info.account
  localStorage.setItem('loginToken', loginToken)
  localStorage.setItem('account', account)
  return ''
}

var bookSource = JSON.stringify({
  name: '刺猬猫阅读',
  url: 'hbooker.com',
  version: 110,
  authorization: JSON.stringify(['account', 'password']),
  cookies: ['hbooker.com'],
  ranks: ranks
})
