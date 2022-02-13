let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const axios = require("axios")
//  助力抽奖通用
async function jhy(id) {
    prize = `\n[活动id${id}]`
    let logindata = await get("zhuli", `login&comm_id=${id}`, true)
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

// 2.15 系列活动通用 
async function slm() {
    console.log("\n--------寅春爆爆庙会开始--------\n")
    aid = "2022xinnian/m"
    slmdata = await get(aid, "login", true)
    await get(aid, "giftCode&shareCode=4cae9d15aa53c")
    await Promise.all([
        get(aid, "gofuli&resure=1"),
        get(aid, "share"),
        get(aid, "xinshou&resure=1"),
        get(aid, "gozhongcao&resure=1")
    ]);
    if (slmdata.config.day_guang != 2) {
        await get(aid, "guangczzl")
        await get(aid, "guang&resure=1")
    }
    let res = await axios.get(
        "https://huodong3.3839.com/n/hykb/2022xinnian/m/index.php"
    );
    str = res.data.match(/prize1_lingqu_(\d+)/g);
    for (id of str) {
        await get(aid, "playgame&gameid=" + id.split("_")[2])
    }
    for (id of str) {
        await get(aid, "lingqushiwan&gameid=" + id.split("_")[2])
    }
    let info = await get(aid, "login")
    if (info.key == "ok") {
        msg = `庙会：福气值 ${info.config.tizhong}  🧨 ${info.config.maoqiu} \n`
        result += msg
        console.log(msg)
    }
    console.log("\n--------寅春爆爆庙会结束--------\n")
}

//获取任务id
async function lottery(a, c, b) {
    let info = await get(`${a}/m`, `login&comm_id=${b}&isyuyue=0`, true)
    if (info && info.config && info.config.is_end == 0) {
        let res = await axios.get(
            `https://huodong3.3839.com/n/hykb/${a}/m/?comm_id=${b}`
        );
        str = res.data.match(/daily_btn_(\d+)/g);
        //  console.log(res.data)
        await lottery2(a, c, b, str)
    } else {
        console.log(`活动 ${c}已结束`)
    }
}
/*
快爆粉丝福利80080
    await lottery("lottery", "60030-王牌勋章", 5)
    await lottery("lottery", "25525-补给箱", 4)
    await lottery("lottery", "79979-宝石", 3)
    await lottery("lottery","0",22)
*/
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
        let info = await get(`${a}/m`, `login&comm_id=${b}&isyuyue=0`, true)
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
async function cfm() {
    prize = "\n穿越火线: "
    a = "cfm/m"
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
        if (re.prizename) {
            prize += re.prizename
        } else {
            prize += "无-" //未中奖
        }
    }
    result += prize
    console.log(result)
}



//勋章区
async function getxz() {
    //您好2022
    await get("yearend2021", "ac=send&content=%E6%96%B0%E5%B9%B4%E5%BF%AB%E4%B9%90%E5%91%80biubiubiu%0A%E7%A5%9D%E5%A4%A7%E5%AE%B6%E5%B9%B4%E5%B9%B4%E6%97%A0%E7%A2%8D%2C%E5%B2%81%E5%B2%81%E6%97%A0%E5%BF%A7%E3%80%82%E5%9B%9B%E5%AD%A3%E5%86%97%E9%95%BF%2C%E4%B8%87%E4%BA%8B%E9%A1%BA%E6%84%8F%E3%80%82&status=0")
    //戏灯影 虎虎生威
    await get("2022sfshare", "share")
    await get("2022sfshare", "postComment&content=%E6%96%B0%E5%B9%B4%E5%BF%AB%E4%B9%90")
    for (f = 0; f < 6; f++) {
        await get("2022sfshare", "openaward&pid=" + f)
    }
}



async function task1() {
    console.log("临时任务开始")
    let ids = await axios.get("https://ghproxy.com/https://raw.githubusercontent.com/Wenmoux/sources/master/other/id.json");
    for (id of ids.data) {
        result += await jhy(id) + "\n"
    }
    let ids2 = await axios.get("https://ghproxy.com/https://raw.githubusercontent.com/Wenmoux/sources/master/other/id2.json");
    for (id of ids2.data) {
        await ddd(id)
    }
 //   await slm()
    await glist(3)
  //  await getxz()
}