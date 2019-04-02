import Constants from '../utils/Constants'

const requestO = (url,method, body, timeout=30000) => {
  const request1 = new Promise((resolve, reject) => {
    fetch(url,{
      method: method,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        // "uid":Constants.uid|'',
        // "token":Constants.token,
        // "version":Constants.version,
        // "os":Constants.os,
        // "osVersion":Constants.osVersion,
        // "model":Constants.model,
        // "deviceId":Constants.deviceId
      },
      body:JSON.stringify(body)
    }).then((response) => {
      return response.json();
    }).then((responseData) => {
      resolve(responseData);
    }).catch((error) => {
      reject(error);
    });
  });

// 定义一个延时函数
  const timeoutRequest = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, 'Request timed out');
  });

// 竞时函数，谁先完成调用谁
  return Promise.race([request1, timeoutRequest]).then(res => {
    return res
  }, m => {
    throw new Error(m);
  });
};

const request = (url,method,body, timeout = 30000)=>{
  if(Constants.isNetWorkOffline){
    return { code: 500, msg: '网络繁忙，请稍后再试' };
  }
  return getRootaddr().then(res=>{
    let okUrl = url
    let rootaddr = res
    if(okUrl.indexOf("/")==0){
      okUrl = rootaddr+url
    }
    return requestO(okUrl, method, body, timeout)
  }).catch(e=>{
    console.log(e);
    return { code: 500, msg: '网络繁忙，请稍后再试' };
  })
};

const getRootaddr = ()=>{
  return requestO(Constants.gateurl, 'post',{}).then(res => {
    Constants.rootaddr = res.url
    return Constants.rootaddr;
  }).catch(e=>{
    console.log(e);
    Constants.rootaddr = Constants.defaultrootaddr
    return Constants.rootaddr;
  })
}

export default {
  request,
  requestO,
  getRootaddr
};
