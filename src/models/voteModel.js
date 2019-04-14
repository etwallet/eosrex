import Request from '../utils/RequestUtil';
import { noAttentionPage, attentionPage, plazaPage, biggiePage,} from '../utils/Api';
import { Toast } from 'antd-mobile';
import Utils from '../utils/Utils'

export default {
  namespace: 'vote',

  state: {
    myVoteInfo:[],
    isVoted:　false, // 是否进行投票过
  },

  effects: {
    // 获取投票信息
    *getMyVoteInfo({ payload, callback }, { select,  call, put }) {
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

        let voteInfo = info.rows;
        yield put({ type: 'update', payload: {myVoteInfo: voteInfo, isVoted:true} });
      } catch (error) {
        console.log("+++++app/models/voteModel.js++++getMyVoteInfo-error:",JSON.stringify(error));
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
