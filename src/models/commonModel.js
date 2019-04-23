import Request from '../utils/RequestUtil';
import { noAttentionPage, attentionPage, plazaPage, biggiePage,} from '../utils/Api';
import { Toast } from 'antd-mobile';
import Utils from '../utils/Utils'

export default {
  namespace: 'common',

  state: {
    account: '',
    permission: 'active',
    eosBalance: '0.0000',
    delegated_eosBalance: '0.0000',
    network: {
      blockchain:'eos',
      protocol:'http',
      host:'192.168.1.37',  
      port:8000,
      chainId:'1c6ae7719a2a3b4ecb19584a30ff510ba1b6ded86e1fd8b8fc22f1179c622a32'
    },
    rexpool:{
      total_lent: '0.0000 EOS', // 已出租的EOS总量
      total_unlent: '0.0000 EOS', // 可出租的EOS总量
      total_rent: '0.0000 EOS', // 总租金
      total_lendable: '0.0000', //总的EOS量
      total_rex: '0.0000 REX', // REX总量
    },
    lent_percent: 0, //出租百分比
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
        let delegated_eosBalance = '0.0000';
        let accountInfo = yield eos.getAccount(payload.account);
        if(accountInfo){
          if(accountInfo.core_liquid_balance){
            eosBalance = accountInfo.core_liquid_balance.replace("EOS", "").replace(" ", "");
          }
          if(accountInfo.total_resources){
            let cpu_weight = '0.0000';
            let net_weight = '0.0000';
            if(accountInfo.total_resources.cpu_weight)
            {
              cpu_weight = accountInfo.total_resources.cpu_weight.replace("EOS", "").replace(" ", "");
            }
            if(accountInfo.total_resources.net_weight)
            {
              net_weight = accountInfo.total_resources.net_weight.replace("EOS", "").replace(" ", "");
            }
            delegated_eosBalance = (parseFloat(cpu_weight) + parseFloat(net_weight)).toFixed(4);
          }
        }

        let isVoted = false; // 是否已经投票过
        let myVotes = [];
        if(accountInfo && accountInfo.voter_info && accountInfo.voter_info.producers){
          myVotes = accountInfo.voter_info.producers;
          if(myVotes && myVotes.length >= 21){
            isVoted = true;
          }
        }
        yield put({ type: 'update', payload: {myVotes: myVotes, isVoted: isVoted, eosBalance: eosBalance,delegated_eosBalance:delegated_eosBalance}});

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

        let lent_percent = 0;
        if(rexpool && rexpool.total_lent && rexpool.total_lendable)
        {
          let total_lent = Utils.sliceUnit(rexpool.total_lent);
          let total_lendable = Utils.sliceUnit(rexpool.total_lendable);
          // alert('total_lent = ' + total_lent + ' total_lendable = ' + total_lendable);
          let float_total_lent = parseFloat(total_lent).toFixed(4);
          let float_total_lendable = parseFloat(total_lendable).toFixed(4);
          lent_percent = (float_total_lent * 100 / float_total_lendable).toFixed(2);
        }
        yield put({ type: 'update', payload: {rexpool: rexpool,lent_percent: lent_percent} });
        if(callback) callback(true);
      } catch (error) {
        console.log("+++++app/models/commonModel.js++++getRexInfo-error:",JSON.stringify(error));
        if(callback) callback(false);
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
    //查询可提币余额
    *queryWithdrawInfo({ payload, callback }, { select,  call, put }) {
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
        obj.table = 'rexfund';
        obj.limit = 1;
        obj.lower_bound = payload.account;
        // obj.table_key = 'owner';
        let resp = yield eos.getTableRows(obj);

        if(callback) callback(resp);
      } catch (error) {
        console.log("+++++app/models/common.js++++queryWithdrawInfo-error:",JSON.stringify(error));
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
