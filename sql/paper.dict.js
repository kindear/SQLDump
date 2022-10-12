const mysql = require("mysql");
const axios = require("axios");
// 导出数据库 -- 需要修改
const exportTable = "nepu_paper_dict";
// 输入导入地址 -- 需要修改
const importUrl = "http://localhost:8080/nepu/paper/dict";
// 这是读取连接
const exportConnection = mysql.createConnection({
  host: "47.102.117.22", //连接的数据库地址。（默认:localhost）
  user: "nepu-test", //mysql的连接用户名
  password: "963852", // 对应用户的密码
  database: "nepu-test", //所需要连接的数据库的名称（可选）
});

exportConnection.connect();

// 导出数据
let exportTask = new Promise(function (resolve, reject) {
  exportConnection.query(
    "SELECT * from " + exportTable,
    function (error, results, fields) {
      resolve(results);
    }
  );
});

let exportData = [];


// 导入任务

// 配置插入数据列表
let importData = [];

// 请求后台地址并导入数据
async function reqInsertData(list, index) {
  if (index == list.length) {
    return true;
  }
  let exportObj = list[index];
  // 这部分需要修改
  let importObj = {
    code:exportObj.code,
    paperLevel:exportObj.paper_level,
    paperType:exportObj.paper_type,
    workloadMax:exportObj.workload_max,
    workloadMin:exportObj.workload_min
  };
  console.log(importObj)
  let reqRes = await axios({
    url: importUrl,
    method: "post",
    data: importObj,
  });
  //console.log(reqRes);
  //console.log(reqRes.data.code)
  if(reqRes.data.code != 200){
    console.log('第[%s]条执行失败,错误原因为[%s]',index+1,reqRes.data.msg);
  }else{
    console.log('第[%s]条执行成功',index+1);
    reqInsertData(list,index+1);
  }
}


exportTask.then(res=>{
    // 关闭连接
    exportConnection.end();
    exportData = res;
    //console.log(res)
    reqInsertData(res,0);
})


