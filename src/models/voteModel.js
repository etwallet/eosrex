import Request from '../utils/RequestUtil';
import { noAttentionPage, attentionPage, plazaPage, biggiePage,} from '../utils/Api';
import { Toast } from 'antd-mobile';
import Utils from '../utils/Utils'

export default {
  namespace: 'vote',

  state: {
    myVoteInfo:[],
    isVoted:　false, // 是否进行投票过
    producers: [], // 节点列表
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
        obj.table = 'voters';
        obj.limit = 1;
        obj.lower_bound = payload.account;
        obj.table_key = 'owner';
        let info = yield eos.getTableRows(obj);

        let voteInfo = info.rows;
        yield put({ type: 'update', payload: {myVoteInfo: voteInfo, isVoted:true} });
      } catch (error) {
        console.log("+++++app/models/voteModel.js++++getMyVoteInfo-error:",JSON.stringify(error));
      }
    },

    /**
     * 根据排名获取投票列表
     */
    *listProducers({ payload, callback }, { select,  call, put }) {
      try {
        let network = yield select(state => state.common.network);  
        var eos = window.scatter.eos(network, window.Eos);
        var obj = new Object();
        obj.json = true;
        obj.code = 'eosio';
        obj.scope = 'eosio';
        obj.table = 'producers';
        obj.limit = 100;
        obj.index_position = 2;
        obj.key_type = 'float64'
        let info = yield eos.getTableRows(obj);

        let producers = info.rows;

        let myVotes = yield select(state => state.common.myVotes);
        producers.forEach((p) => {
          p.isSelect = false;
          if(myVotes && myVotes.includes(p.owner)){
            p.isSelect = true;
          }
        });

        // alert("listProducers: " + JSON.stringify(producers));

        yield put({ type: 'update', payload: {producers: producers} });
        if(callback) callback(producers);
      } catch (error) {
        console.log("+++++app/models/voteModel.js++++listProducers-error:",JSON.stringify(error));
        if(callback) callback([]);
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
