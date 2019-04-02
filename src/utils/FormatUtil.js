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
export const formatDateString = (timestamp) => {
  if (timestamp === undefined) {
    return '';
  }
  const date = new Date(parseInt(timestamp) * 1000);
  const year = date.getFullYear();
  const month = parseInt(date.getMonth()) + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

export const formatStringWithHtml = (originString) => {
  if (originString === undefined) {
    return '';
  }
  const newString = originString
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return newString;
};

export const formatterNumber = (number) =>{
  return (number || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
}
export const formatterUnit = (number) =>{
  if(number>100000000){
    let f = number/100000000;
    let value = Math.floor(f * 100) / 100;
    return value+"亿"
  }else if(number>10000){
    let f = number/10000;
    let value = Math.floor(f * 100) / 100;
    return value+"万"
  }else{
    return number;
  }
}

export const formatEosQua = (amount, precision = 4) =>{
  var e = amount.split(" ");
  // if(e.length > 1 && e[1] == "IQ"){
  //   precision = 3;
  // }
  // if(e.length > 1 && e[1] == "QB"){
  //   return amount; // QB精度为1，这里不做精度转换
  // }
  if(precision == 0){
    return amount;
  }
  r=e[0].split(".");
  if(r.length>1){
    if(r[1].length <= precision){
      var n=precision-r[1].length;
      amount=e[0];
      for(var i=0;i<n;i++){
        amount+="0";
      }
    }else{
      r[1] = r[1].substr(0, precision);
      amount = r[0] + "." + r[1];
    }

    amount=amount+" "+e[1];
  }else{
    var zeroSection = '';
    for(var i = 0; i < precision; i++){
      zeroSection += '0'; 
    }
    amount=e[0]+"."+ zeroSection + " " + e[1];
  }
  return amount;
}