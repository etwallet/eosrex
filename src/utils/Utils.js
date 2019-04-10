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

    static sliceEos(val){
      try {
        return val.replace("EOS", "").replace(" ", "");
      } catch (error) {
        return '0.0000';
      }
    }
}