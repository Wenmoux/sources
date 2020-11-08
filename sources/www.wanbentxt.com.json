{
    "name": "完本神站",
    "url": "www.xinwanben.com",
    "version": 106,
    "search": {
        "url": "https://www.wanbentxt.net/api/api.php@post->skey=${key}&action=search&page=1",
         "charset": "utf-8",
        "list": "$..data[*]",
        "name": "$.articlename",
        "author": "$.author",
        "summary": "$.intro",
        "cover": "$.images",
        "detail": "https://www.xinwanben.com/${$.articleid}/"
    },
    "detail": {
        "name": "h1",
        "author": ".writer > a",
        "summary": "tr:nth-child(3) > td:nth-child(2)",
        "cover": ".detailTopLeft>img",
        "status": ".detailTopLeft > span",
        "update": ".chapter > div > span@match->.+(?= 更新至)",
        "lastChapter": ".chapter > div > span > a",
        "catalog": ""
    },
    "catalog": {
        "list": ".chapter > ul > li",
        "name": "a",
        "chapter": "a"
    },
    "chapter": {
        "content":".readerCon",
    "page": ".readPage>a:nth-child(3):matches(下一页)",
    "purify": ["一秒记住.*?coM",
        "提示.*?看的书！",
        "-->>本章未完.*?阅读",
        "【完本神站】(.+)永不丢失！",
        "支持.*?好友！",
        "手机直接访问:m.xinwanben.com",
        "记不住网址，可以百度搜索:【完本神站】",
        "章节错误，长时间未更新，请留言，我们会尽快处理！"
    ]
    }
}
