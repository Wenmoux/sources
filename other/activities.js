let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const axios = require("axios")
//  助力抽奖通用
async function jhy(id) {
    prize = `\n[活动id${id}]`
    let logindata = await get("zhuli", `login&comm_id=${id}`,true)
    if (logindata.loginStatus == 100 && logindata.key == "ok") {
        uid = logindata.config.uid
        for (i = 0; i < 3; i++) {
            await get("zhuli", `zhuli&uid=${uid}&comm_id=${id}`)
            let res = await get("zhuli", `choujiang&isdown=1&comm_id=${id}`)
            if (res.prize) {
                prize += res.prize + "-"
            } else {
                prize += "未中奖-"
            }
            await sleep(1000)
        }
    }
    return prize
}

// 


//获取任务id
async function lottery(a, c, b) {
    let info = await get(`${a}/m`, `login&comm_id=${b}&isyuyue=0`,true) 
    if(info&&info.config&&info.config.is_end==0){ 
    let res = await axios.get(
        `https://huodong3.3839.com/n/hykb/${a}/m/?comm_id=${b}`
    );
    str = res.data.match(/daily_btn_(\d+)/g);
    //  console.log(res.data)
    await lottery2(a, c, b, str)
  }else{
  console.log(`活动 ${c}已结束`)
  } 
}
//快爆粉丝福利80080
async function lottery2(a, c, b, str) {
    for (i of str) {
        i = i.split("_")[2]
        await get(`${a}/m`, `DailyAppJump&comm_id=${b}&isyuyue=0&id=${i}`)
        await get(`${a}/m`, `DailyAppLing&comm_id=${b}&isyuyue=0&id=${i}`)
        await get(`${a}/m`, `chouqu&comm_id=${b}&isyuyue=0&id=${i}`)
        await get(`${a}/m`, `BaoXiangLing&comm_id=${b}&isyuyue=0&id=${i}`)
    }
    if (c != 0) {
        ct = c.split("-")
        let info = await get(`${a}/m`, `login&comm_id=${b}&isyuyue=0`,true)
        let msg = `${ct[0]}：${ct[1]} ${info.config.daoju} 抽奖次数 ${info.config.played} \n`
        result += msg
    }
}

//游戏单第7期 7.9-8.1
async function glist(id) {
    for (typeid of ["qq", "wx", "weibo"]) {
        await get("glist", `share&typeid=${typeid}&comm_id=${id}`)
        await sleep(1000)
    }
    await get("glist", `receiveBmh&comm_id=${id}`)
}

async function ddd(id) {
    await get("yuyue2020/m", `yuyuedown&comm_id=${id}&isyuyue=0&testkey=4399NoneDeviceId`)
    await get("yuyue2020/m", `yuyue&comm_id=${id}&isyuyue=0&testkey=4399NoneDeviceId`)
    await get("yuyue2020/m", `invite&comm_id=${id}&isyuyue=0&isfx=1&isdown=1&isdownonly=1&testkey=4399NoneDeviceId`)
    await get("yuyue2020/m", `playgame&comm_id=${id}&isyuyue=0&isfx=1&isdown=1&isdownonly=1&testkey=4399NoneDeviceId`)
    await get("yuyue2020/m", `choujiang&comm_id=${id}&isyuyue=0&isdown=1&isdownonly=1&testkey=4399NoneDeviceId`)
    await get("yuyue2020/m", `mycode&comm_id=${id}&isyuyue=0&testkey=4399NoneDeviceId`)
}

//by 饺子 
async function cfm(){
  prize="\n穿越火线: "
  a= "cfm/m"
  await get(a, "login&comm_id=1&isyuyue=0")
  await get(a, "DailyQiandao&comm_id=1&isyuyue=0&id=1")
  await get(a, "DailyGamePlay&comm_id=1&isyuyue=0&id=2")
  await get(a, "DailyGameLing&comm_id=1&isyuyue=0&id=2")
  await get(a, "DailyAppJump&comm_id=1&isyuyue=0&id=3")
  await get(a, "DailyAppLing&comm_id=1&isyuyue=0&id=3")
  await get(a, "DailyAppJump&comm_id=1&isyuyue=0&id=4")
  await get(a, "DailyAppLing&comm_id=1&isyuyue=0&id=4")
  for (i = 1; i < 3; i++) {
     await get(a, "DailyInviteJump&comm_id=1&isyuyue=0&id=5")
     await get(a, "DailyShareback&mode=qq&comm_id=1&isyuyue=0&id=5")
     await get(a, "DailyInviteLing&comm_id=1&isyuyue=0&id=5")
 
   let re = await get(a, "chouqu&comm_id=1&isyuyue=0")
   if(re.prizename){
            prize +=re.prizename
         }else{
           prize +="无-" //未中奖
        }
   }
   result += prize
   console.log(result)
}

async function task1() {
    console.log(`临时任务列表：
1：粉丝福利80080,25525,630630,79979都可以去首页搜索对应数字绑定qq`)
    await lottery("lottery", "60030-王牌勋章", 5)
    await lottery("lottery", "25525-补给箱", 4)
    await lottery("lottery", "79979-宝石", 3)
    await lottery("lottery","0",22)
    let ids = await axios.get("https://cdn.jsdelivr.net/gh/Wenmoux/sources/other/id.json");
    for (id of ids.data) {
        result += await jhy(id) +"\n"
    }
    let ids2 = await axios.get("https://cdn.jsdelivr.net/gh/Wenmoux/sources/other/id2.json");
    for (id of ids2.data) {
       await ddd(id)
    }
}
