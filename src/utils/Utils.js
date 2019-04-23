/**
 *
 * Copyright 2016-present reading
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

export default class  Utils {

    static async sendActionToModel(context,action) {
        let pthis = context;
      var p = new Promise(function (resolve, reject) {
        action.callback=(ret) => {   
          // 只要回调 有调用 就返回 不管是返回对  
             resolve(ret);
        }
        pthis.props.dispatch(action);
      });
      return p;
    }

    static async dispatchActiionData(context, action) {
        if(!action.hasOwnProperty("type"))
        {
          console.error("action hava not type");
          return;
        }
        if(action.hasOwnProperty("callback"))
        {
          console.error("callback action is not allowed");
        }
        return await Utils.sendActionToModel(context,action); 
    }

    static sliceUnit(val){
      try {
        var e = val.split(" ");
        return e[0];
      } catch (error) {
        return '0.0000';
      }
    }

    static chkEosQuantity(obj) {
      obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
      obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
      obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
      obj = obj
        .replace(".", "$#$")
        .replace(/\./g, "")
        .replace("$#$", ".");
      obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
      // var max = 9999999999.9999;  // 100亿 -1
      // var min = 0.0000;
      // var value = 0.0000;
      // var floatbalance;
      // try {
      //   value = parseFloat(obj);
      //   floatbalance = parseFloat(this.state.balance);
      // } catch (error) {
      //   value = 0.0000;
      //   floatbalance = 0.0000;
      // }
      // if(value < min|| value > max){
      //   EasyToast.show(Translate.getT("输入错误"));
      //   obj = "";
      // }
      // if (value > floatbalance) {
      //     EasyToast.show(Translate.getT('账户余额不足,请重输'));
      //     obj = "";
      // }
      return obj;
  }
}