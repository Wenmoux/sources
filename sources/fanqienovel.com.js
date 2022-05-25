//分割数组
function spArr(arr, num) {
  let newArr = []
  for (let i = 0; i < arr.length;) {
    newArr.push(arr.slice(i, i += num));
  }
  return newArr
}

//搜索
const search = (key) => {
  let response = GET(`https://api5-normal-lq.fqnovel.com/reading/bookapi/search/page/v/?offset=0&query=${encodeURI(key)}&iid=466614321180296&aid=1967`)
  let res = JSON.parse(response).data
  var $ = res.filter(function(item) {
    return item.book_data[0].book_type == 0
});
    let array = []
    $.forEach((child) => {
      array.push({
        name: child.book_data[0].book_name,
        author: child.book_data[0].author,
        cover: child.book_data[0].thumb_url.replace(".heic",".png"),
        detail: `https://api5-normal-lq.fqnovel.com/reading/bookapi/detail/v/?book_id=${child.book_data[0].book_id}&iid=466614321180296&aid=1967&version_code=290`,
      })
    })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response).data
  let book = {
    summary: $.abstract,
    status: $.creation_status == 1 ? '连载' : '完结',
    category: $.tags.replace(","," "),
    words: $.word_number,
    update: timestampToTime($.last_chapter_update_time),
    lastChapter: $.last_chapter_title,
    catalog: $.book_id
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

//目录
const catalog = (url) => {
  let array = []
  let v = []
  let res = JSON.parse(GET(`https://fanqienovel.com/api/reader/directory/detail?bookId=${url}`))
  let item_list = spArr(res.data.allItemIds,100)
  let page = item_list.length
  for(i=0;i<page;i++) {
    let response = GET(`https://api5-normal-lq.fqnovel.com/reading/bookapi/directory/all_infos/v/?item_ids=${item_list[i]}&iid=2718442795830583&aid=1967&version_code=290`)
    let data = JSON.parse(response).data
    data.forEach((x) => {
      if (JSON.stringify(v).indexOf(x.volume_name) == -1) {
        array.push({
          name:x.volume_name
       	})
       	v.push(x.volume_name)
      }
      array.push({
      	  name: x.title,
        url: `https://novel.snssdk.com/api/novel/book/reader/full/v1/?group_id=${x.group_id}&item_id=${x.item_id}`
      })
    })
  }
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
  let $ = JSON.parse(GET(url))
  return $.data.content.replace(/<div.+<\/div>/,"")
}

var bookSource = JSON.stringify({
  name: "番茄小说",
  url: "fanqienovel.com",
  version: 106
})
