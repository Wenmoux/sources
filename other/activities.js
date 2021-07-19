let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


//  助力抽奖通用
async function jhy(id) {
       prize = `\n[活动id${id}]`
    let logindata = await get("zhuli", `login&comm_id=${id}`)
    if (logindata.loginStatus == 100 && logindata.key == "ok") {
        uid = logindata.config.uid

        for (i = 0; i < 3; i++) {
            await get("zhuli", `zhuli&uid=${uid}&comm_id=${id}`)
            let res = await get("zhuli", `choujiang&isdown=1&comm_id=${id}`)
            if(res.prize){
            prize +=res.prize+"-"
            }else{
           prize +="未中奖-" 
            }
            await sleep(1000)
        }
    }
    return prize
}


//获取任务id
async function lottery(a,c,b){
let res = await $http.get(
       `https://huodong3.3839.com/n/hykb/${a}/m/?comm_id=${b}`
   );
   str=res.data.match(/daily_btn_(\d+)/g);
 //  console.log(res.data)
await lottery2(a,c,b,str)
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
    if(c!=0){
    let info = await get(`${a}/m`, `login&comm_id=${b}&isyuyue=0`)
    let msg = `\n${c}：${info.config.daoju} 抽奖次数：${info.config.played}`
    result += msg
    }
}

async function ddd(id) {
    await get("yuyue2020/m",`yuyuedown&comm_id=${id}&isyuyue=1&testkey=4399NoneDeviceId`)
    await get("yuyue2020/m",`yuyue&comm_id=${id}&isyuyue=1&testkey=4399NoneDeviceId`)
    await get("yuyue2020/m", `invite&comm_id=${id}&isyuyue=1&isfx=1&testkey=4399NoneDeviceId`)
    await get("yuyue2020/m", `choujiang&comm_id=${id}&isyuyue=1&isdown=1&isdownonly=1&testkey=4399NoneDeviceId`)
    await get("yuyue2020/m", `mycode&comm_id=${id}&isyuyue=1&testkey=4399NoneDeviceId`)
}
async function slm() {
    console.log("\n--------夏日福利史莱姆养成计划开始(搜索2021666)--------\n")
    aid = "2021slm/m"
    await get(aid, "login")
    await Promise.all([ 
         get(aid, "gofuli&resure=1"), 
         get(aid, "share"),
         get(aid, "xinshou&resure=1"),
	 get(aid, "guangczzl")
	]);         
    await get(aid,"guang&resure=1")
    await get(aid, "gozhongcao&resure=1")
    let res = await $http.get(
        "https://huodong3.3839.com/n/hykb/2021slm/m/index.php"
    );
    str = res.data.match(/prize1_lingqu_(\d+)/g);
    for (id of str) {
        await get(aid, "playgame&gameid=" + id.split("_")[2])
    }
   // await sleep(60000)
    for (id of str) {
        await get(aid, "lingqushiwan&gameid=" + id.split("_")[2])
    }
    let info = await get(aid, "login")
    if (info.key == "ok") {
        msg = `\n【史莱姆】：魔法值[${info.config.tizhong}]  露珠[${info.config.maoqiu}]`
        result += msg
        console.log(msg)
    }
    console.log("\n--------夏日福利 史莱姆养成计划结束--------\n")
}

async function task1() {
    console.log(`临时任务列表：
1：粉丝福利12344,80080,25525,630630,79979都可以去首页搜索对应数字绑定qq`)
    await lottery("lottery", "[630630]王牌勋章", 5)
    await lottery("lottery", "[25525]补给箱", 4)
    await lottery("lottery", "[79979]宝石", 3)
    await lottery("lottery2", "0", 2)
   /*
await lottery("lottery","[988950]回声海螺",12)
    var ids = await $http.get("https://cdn.jsdelivr.net/gh/Wenmoux/sources/other/id.json");
    for (id of ids.data) {
        result += await jhy(id)
    }
*/
    await slm()
   
}
