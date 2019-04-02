import Request from '../utils/RequestUtil';
import { noAttentionPage, attentionPage, plazaPage, biggiePage,} from '../utils/Api';
import { Toast } from 'antd-mobile';

export default {
  namespace: 'nodevote',

  state: {
   
  },

  effects: {
    
  },

  reducers: {
    update(state, action) {
      return { ...state, ...action.payload };
    },
    
  },

  subscriptions: {

  }
};
