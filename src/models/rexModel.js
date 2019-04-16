import Request from '../utils/RequestUtil';
import { noAttentionPage, attentionPage, plazaPage, biggiePage,} from '../utils/Api';
import { Toast } from 'antd-mobile';
import Utils from '../utils/Utils'

export default {
  namespace: 'rex',

  state: {
    myRexInfo:[],

  },

  effects: {
    // 获取REX信息
    *getMyRexInfo({ payload, callback }, { select,  call, put }) {
      try {
        if(!payload.account){
          return;
        }
        let network = yield select(state => state.common.network);  
        var eos = window.scatter.eos(network, window.Eos);
        var obj = new Object();
        obj.json = true;
        obj.code = 'eosio';
        obj.scope = 'eosio';
        obj.table = 'rexbal';
        obj.limit = 1;
        obj.lower_bound = payload.account;
        let info = yield eos.getTableRows(obj);

        let rexInfo = info.rows;
        let myTotalRex = 0;
        rexInfo.forEach(item => {
          let v = 0;
          try {
            let s = Utils.sliceUnit(item.rex_balance);
            v = parseFloat(s);
          } catch (error) {
            v = 0;
          }
          myTotalRex += v;
        });

        rexInfo.totalRex = myTotalRex;
        yield put({ type: 'update', payload: {myRexInfo: rexInfo} });
      } catch (error) {
        console.log("+++++app/models/rexModel.js++++getMyRexInfo-error:",JSON.stringify(error));
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
