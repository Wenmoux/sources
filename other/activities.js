     async function zhuli() {
         await get("2021zhuli", "login")
         for (i of new Array(5)) {
             await get("2021zhuli", "share")
         } //分享
         for (i of [1, 2, 3, 4, 5]) {
             await get("2021zhuli", `checklingqu&num=${i}`)
             await get("2021zhuli", `lingqu&num=${i}`)
         }
         await get("friend", "LingXinrenFuli")
         await get("yearend", "login")
         await get("yearend", "send&content=新年快乐&status=0")
     }




     //快爆粉丝福利80080
     async function lottery2(a, b, c) {
         await get(`${a}/m`, `login&comm_id=${b}&isyuyue=0`)
         for (i of c) {
             await get(`${a}/m`, `DailyAppJump&comm_id=${b}&isyuyue=0&id=${i}`)
             await get(`${a}/m`, `DailyAppLing&comm_id=${b}&isyuyue=0&id=${i}`)
             await get(`${a}/m`, `chouqu&comm_id=${b}&isyuyue=0&id=${i}`)
             await get(`${a}/m`, `BaoXiangLing&comm_id=${b}&isyuyue=0&id=${i}`)
         }
         for (lid of [3, 4, 5]) {
             await get(`lottery/m`, `duihuanprize&comm_id=${lid}&isyuyue=0&dhid=6`)
             await get(`lottery/m`, `duihuanprize&comm_id=${lid}&isyuyue=0&dhid=5`)
         }

     }
     //四周年活动
     async function szn() {
         await get("4zhounian/m", "login")
         await get("4zhounian/m", "normalShare") //分享
         await get("4zhounian/m", "share") /
         await get("4zhounian/m", "chaundi&liuyan=666&resource=qq") //留言
         await get("4zhounian/m", "duihuantouxian&resure=1&dhid=9") //领取头衔
         for (id of [1, 2, 3, 4, 5, 6]) {
             await get("4zhounian/m", "step&id=" + id + "&refer=0")
             //   consle.log(refer)
             await get("4zhounian/m", "step&id=" + id + "&refer=1")


         }

     }

     async function task1() {
         await zhuli()
         console.log("粉丝福利任务开始,记得去app中首页分别搜索80080 25525 630630 79979进行qq号绑定哦！！")
         await lottery2("lottery2", 2, [1, 2, 3, 6, 7, 8])
         await lottery2("lottery", 5, [1, 2, 3, 4, 6, 7])
         await lottery2("lottery", 4, [1, 2, 4, 5, 6, 8])
         await lottery2("lottery", 3, [1, 2, 3, 6, 7, 8, 14])
         result += "粉丝福利任务开始,记得去app中首页分别搜索80080 25525 630630 79979进行qq号绑定哦！！"         
         console.log("四周年活动开始,请去活动里绑定qq哦,社区-四周年-活动1")
         await szn()
     }