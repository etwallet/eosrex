import Request from '../utils/RequestUtil';
import { noAttentionPage, attentionPage, plazaPage, biggiePage,} from '../utils/Api';
import { Toast } from 'antd-mobile';

export default {
  namespace: 'common',

  state: {
    account: '',
    permission: 'active',
    eosBalance: '0.0000',
    network: {
      blockchain:'eos',
      protocol:'http',
      host:'192.168.1.37',  
      port:8000,
      chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
    },
    rexpool:{
      totalLent: '0.0000 EOS', // 已出租的EOS总量
      totalUnLent: '0.0000 EOS', // 可出租的EOS总量
      totalRent: '0.0000 EOS', // 总租金
      totalLendable: '0.0000', //总的EOS量
      totalRex: '0.0000 REX', // REX总量
    }

  },

  effects: {
    // 登录
    *login({ payload, callback }, { select, call, put }) {
      try {
        let identity = yield window.scatter.getIdentity({});
        if(window.scatter.identity && window.scatter.identity.accounts && window.scatter.identity.accounts.length>0){
          let account = window.scatter.identity.accounts[0];
          if(account.blockchain=="eos"){
            let network = yield select(state => state.common.network)  
            var eos = window.scatter.eos(network, window.Eos);
            
            let balanceArr = yield eos.getCurrencyBalance('eosio.token', account.name, 'EOS');
            let eosBalance = '0.0000';
            if(balanceArr && (balanceArr.length > 0) && (balanceArr[0] != '')){
              eosBalance = balanceArr[0].replace("EOS", "").replace(" ", "");
            }

            yield put({ type: 'update', payload: {account: account.name, permission: account.authority, eosBalance: eosBalance} });
            yield put({ type: 'getRexInfo', payload: {}});

            if(callback) callback(account);
          }
        }else{
          // Toast.info("登录失败，请重新登录", 1);
        }
      } catch (error) {
        // Toast.info("登录失败，请重新登录", 1);
        console.log("+++++app/models/commonModel.js++++login:",JSON.stringify(error));
      }
    },

    // 获取REX信息
    *getRexInfo({ payload, callback }, { select,  call, put }) {
      try {
        let network = yield select(state => state.common.network);  
        var eos = window.scatter.eos(network, window.Eos);
        var obj = new Object();
        obj.json = true;
        obj.code = 'eosio';
        obj.scope = 'eosio';
        obj.table = 'rexpool';
        obj.limit = 1;
        let info = yield eos.getTableRows(obj);

        let rexpoolRemote = info.rows[0];
        let rexpoolLocal = yield select(state => state.common.rexpool);  
        let rexpool = {...rexpoolLocal, ...rexpoolRemote};
        yield put({ type: 'update', payload: {rexpool: rexpool} });
      } catch (error) {
        console.log("+++++app/models/commonModel.js++++getRexInfo-error:",JSON.stringify(error));
      }
    },
    // 发送eos交易
    *sendEosAction({ payload, callback }, { select,  call, put }) {
      try {
        let network = yield select(state => state.common.network);  
        var eos = window.scatter.eos(network, window.Eos);
        let resp = yield eos.transaction({actions: payload.actions});
        if(resp.transaction_id){
          yield put({ type: 'getRexInfo', payload: {}});
        }
        if(callback) callback(resp);
      } catch (error) {
        console.log("+++++app/models/commonModel.js++++sendEosAction-error:",JSON.stringify(error));
      }
    },
  },

  reducers: {
    update(state, action) {
      return { ...state, ...action.payload };
    },

  },

  subscriptions: {

  }
};
