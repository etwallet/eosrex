import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import Dynamic from 'dva/dynamic';
import { LocaleProvider } from 'antd-mobile';
import { addLocaleData, IntlProvider } from 'react-intl';
import store from 'storejs';

let lan = store.get("language");
if(!lan){
  let language = navigator.language;
  if(language){
    lan = language.split('-')[0];
  }else{
    lan="en";
  }
}
switch(lan){
  case 'en':
    require("./locales/en-US");
    break;
  case 'zh':
    require("./locales/zh-CN");
    break;
  default:
    require("./locales/en-US");
    break;
}
const appLocale = window.appLocale;
addLocaleData(appLocale.data);

export default function RouterConfig({history,app}) {
  const Index = Dynamic({app,models:()=>[require("./models/")],component:()=>import('./routes/Index')});
  const GameDescription = Dynamic({app,models:()=>[require("./models/")],component:()=>import('./routes/GameDescription')});
  const BuyandSell = Dynamic({app,models:()=>[require("./models/")],component:()=>import('./routes/BuyandSell')});
  const DetailsList = Dynamic({app,models:()=>[require("./models/")],component:()=>import('./routes/DetailsList')});
  const Withdraw = Dynamic({app,models:()=>[require("./models/")],component:()=>import('./routes/Withdraw')});
  const NodeVoting = Dynamic({app,models:()=>[require("./models/")],component:()=>import('./routes/NodeVoting')});
  return (
    <LocaleProvider locale={appLocale.antd}>
      <IntlProvider locale={appLocale.locale} messages={appLocale.messages}>
        <Router  history={history}>
          <Switch>
            <Route path="/GameDescription" exact component={GameDescription} />
            <Route path="/" exact component={Index} />
            <Route path="/BuyandSell" exact component={BuyandSell} />
            <Route path="/DetailsList" exact component={DetailsList} />
            <Route path="/Withdraw" exact component={Withdraw} />
            <Route path="/NodeVoting" exact component={NodeVoting} />
          </Switch>
        </Router>
      </IntlProvider>
    </LocaleProvider>
  );
}
