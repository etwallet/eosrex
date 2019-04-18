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
    },
    isVoted: false,
    myVotes: [],
  },

  effects: {
    // 登录
    *login({ payload, callback }, { select, call, put }) {
      try {
        let identity = yield window.scatter.getIdentity({});
        if(window.scatter.identity && window.scatter.identity.accounts && window.scatter.identity.accounts.length>0){
          let account = window.scatter.identity.accounts[0];
          if(account.blockchain=="eos"){


            yield put({ type: 'update', payload: {account: account.name, permission: account.authority}});

            yield put({ type: 'getAccountInfo', payload: {account: account.name}});

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

    // 获取账户信息
    *getAccountInfo({ payload, callback }, { select,  call, put }) {
      try {
        let network = yield select(state => state.common.network)  
        var eos = window.scatter.eos(network, window.Eos);
        
        let eosBalance = '0.0000';
        let accountInfo = yield eos.getAccount(payload.account);
        if(accountInfo && accountInfo.core_liquid_balance){
          eosBalance = accountInfo.core_liquid_balance.replace("EOS", "").replace(" ", "");
        }

        let isVoted = false; // 是否已经投票过
        let myVotes = [];
        if(accountInfo && accountInfo.voter_info && accountInfo.voter_info.producers){
          myVotes = accountInfo.voter_info.producers;
          if(myVotes && myVotes.length >= 21){
            isVoted = true;
          }
        }

        yield put({ type: 'update', payload: {myVotes: myVotes, isVoted: isVoted, eosBalance: eosBalance}});

      } catch (error) {
        console.log("+++++app/models/commonModel.js++++getAccountInfo-error:",JSON.stringify(error));
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
          let account = yield select(state => state.common.account);  
          yield put({ type: 'getAccountInfo', payload: {account: account}});
          yield put({ type: 'getRexInfo', payload: {}});
        }
        if(callback) callback(resp);
      } catch (error) {
        console.log("+++++app/models/commonModel.js++++sendEosAction-error:",JSON.stringify(error));
        if(callback) callback(null);
      }
    },
    //查询卖单
    *querySellRexInfo({ payload, callback }, { select,  call, put }) {
      try {
        if(!payload.account){
          if(callback) callback(null);
          return;
        }
        
        let network = yield select(state => state.common.network);  
        var eos = window.scatter.eos(network, window.Eos);
        var obj = new Object();
        obj.json = true;
        obj.code = 'eosio';
        obj.scope = 'eosio';
        obj.table = 'rexqueue';
        obj.limit = 1;
        obj.lower_bound = payload.account;
        // obj.table_key = 'owner';
        let resp = yield eos.getTableRows(obj);

        if(callback) callback(resp);
      } catch (error) {
        console.log("+++++app/models/common.js++++querySellRexInfo-error:",JSON.stringify(error));
        if(callback) callback(null);
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
