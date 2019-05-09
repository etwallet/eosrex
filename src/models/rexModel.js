import Request from '../utils/RequestUtil';
import { noAttentionPage, attentionPage, plazaPage, biggiePage,} from '../utils/Api';
import { Toast } from 'antd-mobile';
import Utils from '../utils/Utils'

export default {
  namespace: 'rex',

  state: {
    myRexInfo:{
      total_rex: 0, // 总rex
      sell_available_rex: 0, // 可卖的rex
    },

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
        
        let rexInfo = info.rows[0];
        if(rexInfo && rexInfo.owner != payload.account){
          return;
        }

        rexInfo.sell_available_rex = 0;
        rexInfo.total_rex = 0;
        if(rexInfo.rex_balance){
          rexInfo.total_rex = Utils.sliceUnit(rexInfo.rex_balance);
          rexInfo.sell_available_rex = rexInfo.total_rex;
        }

        if(rexInfo.rex_maturities){
          rexInfo.rex_maturities.forEach(item => {
            try {
              rexInfo.sell_available_rex = (parseFloat(rexInfo.sell_available_rex) - (item.second/10000).toFixed(4)).toFixed(4);
            } catch (error) {
              
            }
          });
        }

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
