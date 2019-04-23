import React from 'react';
import { Toast, PullToRefresh, ListView, Button, Modal, InputItem, List, WhiteSpace, SegmentedControl} from 'antd-mobile';
import { injectIntl } from 'react-intl';
import { connect } from 'dva';
import Auto from '../utils/Auto'
import {routerRedux} from 'dva/router';
import Utils from '../utils/Utils'
import {formatEosQua} from '../utils/FormatUtil';

require('moment/locale/zh-cn');
var ScreenWidth = window.screen.width 
var ScreenHeight = window.screen.height
const alert = Modal.alert;

var TransType = {
  BUY: 0, 
  SELL: 1,
};

class BuyandSell extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
    this.state = {
      dataSource,
      isSwitch: true,
      values: ['购买', '出售'],
      quantity: '0.0000',
      quantity_rex: '0.0000',
      transType: TransType.BUY,
      actionsList: [
        {actions: this.getBuyActions},
        {actions: this.getSellActions},
      ],
      defaultProducers:[
        // "producer1111",
        // "producer1114",
        // "producer111f"
      ],
      exchangeradio: 0,  //兑换比例
    };
  }

  componentDidMount() {
    Utils.dispatchActiionData(this, { type: 'rex/getMyRexInfo', payload:{account: this.props.account}});
    this.calcExchangRadio();
  }

  onlease = () => {
    this.props.dispatch(routerRedux.push({pathname: '/', query: {   }}))
  }

  description = () => {
    this.props.dispatch(routerRedux.push({pathname: '/GameDescription', query: {   }}))
  }

  onChange = (e) => {
    if(e.nativeEvent.value == this.state.values[1]){
      this.setState({transType: TransType.SELL})
    }else{
      this.setState({transType: TransType.BUY})
    }
  }

  onBuySellList = () => {
    let  isBuySell = (this.state.transType == TransType.BUY) ? true : false;
    localStorage.setItem('buy_sell', isBuySell);
    this.props.dispatch(routerRedux.push({pathname: '/DetailsList', query: { isBuySell: isBuySell }}))
  }

  onNodeVoting = () => {
    this.props.dispatch(routerRedux.push({pathname: '/NodeVoting', query: { }}))
  }

  calcExchangRadio(){
    let val_price = 0;
    try {
      let total_rex = Utils.sliceUnit(this.props.rexpool.total_rex);
      let total_lendable = Utils.sliceUnit(this.props.rexpool.total_lendable);
      let float_total_rex = parseFloat(total_rex);
      let float_total_lendable = parseFloat(total_lendable);
      let amount = 1.0000;
      let val = (float_total_lendable + amount).toFixed(4);
  
      let tmp = (float_total_rex * val).toFixed(4);
      let tmp1 = (tmp/float_total_lendable).toFixed(4);
      let tmp2 = (tmp1 - float_total_rex).toFixed(4);
      val_price = (tmp2/amount).toFixed(4);
    } catch (error) {
      val_price = 0;
    }
    this.setState({exchangeradio:val_price});
  }
  withdraw = async () => {
    var tmp_amount = 0.0000;
    let resp = await Utils.dispatchActiionData(this, { type: 'common/queryWithdrawInfo', payload:{account: this.props.account}});
    if(resp && resp.rows){
      resp.rows.forEach(function(val,index){
          if(val.balance){
            let amount = 0.0000;
            try {
                let s3 =  Utils.sliceUnit(val.balance);
                amount = parseFloat(s3).toFixed(4);
            } catch (error) {
              amount = 0.0000;
            }
            tmp_amount = amount;
            return ;
          }
      });
    }
    if(tmp_amount < 0.0001){
      Toast.info("没有冻结的币,无需提币");
      return ;
    }
    this.props.dispatch(routerRedux.push({pathname: '/Withdraw', query: {balance: tmp_amount}}))
  }

  doTrans = (transType) => {
    try {
      let quantity;
      let banlance;
      if(transType == TransType.BUY){
        quantity = parseFloat(this.state.quantity);
        banlance = parseFloat(this.state.isSwitch ? this.props.eosBalance :this.props.delegated_eosBalance);
        if(quantity < 0.0001){
          Toast.info('购买数量错误');
          return ;
        }
      }else{
        quantity = parseFloat(this.state.quantity_rex);
        banlance = parseFloat(this.props.myRexInfo.total_rex);
        if(quantity < 0.0001){
          Toast.info('出售数量错误');
          return ;
        }
      }
      if(quantity > banlance){
        Toast.info('余额不足');
        return ;
      }
 
      if(this.props.isVoted){ // 投过票了
        let rexTransActions = this.getRexTransActions();
        this.doEosTransact(rexTransActions);
        return;
      }

      // 还没投过票
      Modal.alert('温馨提示', <div>在进行买卖REX之前，您必须要对至少21个节点投过票或代理投票，我们已经帮您进行了默认的节点投票。</div>, [
        { text: '高级设置 >', onPress: () => {this.onNodeVoting()}},
        { text: '确定', onPress: () => this.doVoteAndRexTrans() },
      ])
    } catch (error) {
      
    }
  }

  getdefaultVoteActions = () => {
    let actions = [{
      account: 'eosio',
      name: 'voteproducer',
      authorization: [{
        actor: this.props.account,
        permission: this.props.permission,
      }],
      data: {
        voter: this.props.account,
	      proxy: '',
        producers: this.state.defaultProducers,
      },
    }];

    return actions;
  }

  /**
   * 买rex
   */
  getBuyActions = () => {
    let actions = [{
        account: 'eosio',
        name: 'deposit',
        authorization: [{
          actor: this.props.account,
          permission: this.props.permission,
        }],
        data: {
          owner: this.props.account,
          amount: formatEosQua(this.state.quantity + ' EOS'),
        },
      },
      {
        account: 'eosio',
        name: 'buyrex',
        authorization: [{
          actor: this.props.account,
          permission: 'active',
        }],
        data: {
          owner: this.props.account,
          amount: formatEosQua(this.state.quantity + ' EOS'),
        },
      }
    ]

    return actions;
  }

  /**
   * 卖rex
   */
  getSellActions = () => {
      let actions = [{
        account: 'eosio',
        name: 'sellrex',
        authorization: [{
          actor: this.props.account,
          permission: this.props.permission,
        }],
        data: {
          from: this.props.account,
          rex: formatEosQua(this.state.quantity + ' REX'),
        },
      },
    ]

    return actions;
  }

  

  getRexTransActions = () => {
    let actions = this.state.actionsList[this.state.transType].actions();
    return actions;
  }

  doVoteAndRexTrans = () => {
    let voteActions = this.getdefaultVoteActions();
    let rexTransActions = this.getRexTransActions();
    let actions = voteActions.concat(rexTransActions);
    this.doEosTransact(actions);
  }

  async doEosTransact(actions){
    Utils.dispatchActiionData(this, { type: 'common/sendEosAction', payload:{actions: actions}});
  }
  
  render() {
    return (<div style={styles.rootDiv}>
      <div style={{background:'#FFFFFF', }}>
        <div style={styles.headtopout}>
          <p style={styles.headtoptext}>总量(REX)</p>
          <Button type="ghost" onClick={this.onlease.bind(this)} style={styles.headtopbtn} activeStyle={{opacity: '0.5'}}>租赁</Button>
        </div>
        <div style={styles.headbottomout}>
          <p style={styles.headbottomleft}>{Utils.sliceUnit(this.props.rexpool.total_rex)}</p>
          <div style={styles.headbottomright}>
            <p style={styles.headbottomtext}>REX趋势</p>
            <img src={'../img/chevron.png'}  style={styles.headbottomimg} />
          </div>
        </div>
      </div>
      <WhiteSpace size="lg" />

      <div style={styles.centerDiv}>
        <div style={styles.centertopout}>
          <p style={styles.centertoptext}>账户信息：{this.props.account}</p>
          <Button type="ghost"  style={styles.centertopbtn} onClick={_el => this.description()}
            activeStyle={{opacity: '0.5'}} icon={<img src={'../img/help.png'}  style={styles.reportimg} />} />
        </div>
        <List>
          <List.Item wrap >
          <span style={styles.centerbottom}>兑换比例：</span>
          <span style={styles.centerbottom}>1 EOS ≈ {this.state.exchangeradio} REX</span>
          </List.Item>
          <List.Item wrap >
          <span style={styles.centerbottom}>我的REX：</span>
          <span style={styles.centerbottom}>{this.props.myRexInfo.total_rex} REX</span>
          </List.Item>
        </List>
      </div>
      <WhiteSpace size="lg" />

      <div style={styles.centerDiv}>
        <div style={styles.centertopout}>
          <div style={{flex: 1,}}/>
          <SegmentedControl values={this.state.values} onChange={this.onChange} style={{flex: 2, height: Auto.WHT(62),}}/>
          <Button type="ghost" onClick={this.onBuySellList.bind(this)} style={styles.sellbtn} activeStyle={{opacity: '0.5'}} >{ (this.state.transType == TransType.BUY) ? "出售列表" : "买卖列表"}</Button>
        </div>
        {this.state.transType == TransType.BUY ?
        <div style={{display: 'flex', flexDirection: 'column', }}>
          <div style={styles.listitemout}>
            {this.state.isSwitch ?
            <p style={styles.centertoptext}>我的余额：{this.props.eosBalance} EOS</p>
            // <InputItem  editable={true} defaultValue="0 EOS" placeholder="please input content" data-seed="logId">我的余额：{this.props.eosBalance} EOS</InputItem>
            :
            // <InputItem  defaultValue="0 EOS" placeholder="please input content" data-seed="logId">抵押资源：</InputItem>
            <p style={styles.centertoptext}>抵押资源：{this.props.delegated_eosBalance} EOS</p>
            }
            <Button type="ghost" onClick={_el => this.setState({isSwitch: !this.state.isSwitch})} style={styles.listbtn} activeStyle={{opacity: '0.5'}}>切换</Button>
          </div>
          <div style={styles.listitemout}>
            <InputItem  type="text" pattern="[0-9]."  value={this.state.quantity} placeholder="请输入EOS数量" ref={el => this.autoFocusInst = el}  onChange={(quantity) => this.setState({ quantity: Utils.chkEosQuantity(quantity)})} >购买数量：</InputItem>
            <Button type="ghost" onClick={()=>{this.setState({quantity: this.state.isSwitch ? this.props.eosBalance :this.props.delegated_eosBalance});}}  style={styles.listbtn} activeStyle={{opacity: '0.5'}}>全部</Button>
          </div>
        </div>
        :
        <div style={{display: 'flex', flexDirection: 'column', }}>
           <div style={styles.listitemout}>
           <InputItem  type="text" pattern="[0-9]." value={this.state.quantity_rex} placeholder="请输入REX数量"  onChange={(quantity_rex) => this.setState({ quantity_rex: Utils.chkEosQuantity(quantity_rex)})}	>出售数量：</InputItem>
           <Button type="ghost" onClick={()=>{this.setState({quantity_rex: this.props.myRexInfo.total_rex});}}  style={styles.listbtn} activeStyle={{opacity: '0.5'}}>全部</Button>
          </div>
          <div style={styles.listitemout}>
             <p style={styles.centertoptext}>可卖数量：{this.props.myRexInfo.total_rex} REX</p>
          </div>
         </div>
        }
      </div>

      {(this.state.transType == TransType.BUY) &&
      <div style={{padding: Auto.WHT(30), }}>
        <p style={styles.ordertext}>订单确认：</p>
      <div style={styles.orderout}>花费{this.state.quantity} EOS，为您兑换{(parseFloat(this.state.quantity) * this.state.exchangeradio).toFixed(4)} REX</div>
      </div>}

      <div style={styles.footDiv}>
        <Button type="ghost" style={styles.footbtn} activeStyle={{opacity: '0.5'}}
        onClick={this.doTrans.bind(this, this.state.transType)}>{ (this.state.transType == TransType.BUY) ? "一键购买" : "一键出售"}</Button>
      </div>

      <div style={styles.footDivWithdraw}>
        <Button type="ghost" style={styles.footbtnWithdraw} activeStyle={{opacity: '0.5'}}
        onClick={this.withdraw.bind(this)}>提币至当前账户</Button>
      </div>
    </div>)
  }
} 

export default connect(({ common, rex }) => ({ ...common, ...rex }))(injectIntl(BuyandSell));

const styles = { 
  rootDiv:{
    width: ScreenWidth,
    height: ScreenHeight,
    background:"#F8F8F8",
    boxSizing: 'border-box', 
  },

  headtopout: {
    display:"flex", 
    flexDirection: 'row', 
    alignItems: 'center',
    height: Auto.WHT(88), 
    paddingLeft: Auto.WHT(30), 
    paddingRight: Auto.WHT(30), 
  },
  headtoptext: {
    flex: 1, 
    color: '#000000', 
    fontSize: Auto.WHT(34), 
    lineHeight: Auto.WHT(42),
  },
  headtopbtn: {
    width: Auto.WHT(164), 
    height: Auto.WHT(60), 
    lineHeight: Auto.WHT(60), 
    background: '#FFFFFF', 
    border: '1px #108EE9 solid', 
    textDecoration: 'none', 
    borderRadius: Auto.WHT(6), 
    fontSize: Auto.WHT(26), 
    color: '#108EE9', 
  },
  headbottomout: {
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: Auto.WHT(30),
  },
  headbottomleft: {
    color: '#000000', 
    fontSize: Auto.WHT(48), 
    lineHeight: Auto.WHT(67), 
    paddingBottom: Auto.WHT(22),
  },
  headbottomright: {
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  headbottomtext: {
    color: '#888888', 
    fontSize: Auto.WHT(32), 
    lineHeight: Auto.WHT(45), 
  },
  headbottomimg: {
    width: Auto.WHT(16),
    height: Auto.WHT(26), 
    marginLeft: Auto.WHT(30)
  },

  centerDiv: {
    display: 'flex', 
    flexDirection: 'column',
    background: '#FFFFFF',
  },
  centertopout:{
    height: Auto.WHT(88), 
    display:"flex", 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottom: '1px solid #DDDDDD',
  },
  centertoptext: {
    color: '#000000', 
    fontSize: Auto.WHT(34), 
    lineHeight: Auto.WHT(42), 
    paddingLeft: Auto.WHT(30),  
  },
  centertopbtn: {
    border: 'none', 
    borderRadius: 0,
    color: '#D9D9D9', 
    padding: '0 0.4rem',
    height: Auto.WHT(36),
    textDecoration: 'none', 
  },
  reportimg: {
    width: Auto.WHT(30),
    height: Auto.WHT(30),
    margin: 0,
  },
  centerbottom: {
    color: '#888888', 
    fontSize: Auto.WHT(28),
  },

  listDiv: {
    display: 'flex', 
    flexDirection: 'column',
    background: '#FFFFFF',
  },
  sellbtn: {
    flex: 1,
    background: 'transparent', 
    border: 'none', 
    textDecoration: 'none', 
    borderRadius: 0, 
    fontSize: Auto.WHT(28), 
    color: '#BBBBBB',
  },
  listitemout: {
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  listbtn: {
    width: Auto.WHT(112), 
    height: Auto.WHT(60), 
    lineHeight: Auto.WHT(60), 
    background: '#108EE9', 
    border: 'none', 
    textDecoration: 'none', 
    borderRadius: Auto.WHT(6), 
    fontSize: Auto.WHT(26), 
    color: '#FFFFFF',
  },
  ordertext: {
    color: '#000000', 
    fontSize: Auto.WHT(28), 
    paddingTop: Auto.WHT(10), 
    paddingBottom: Auto.WHT(10),
  },
  orderout: {
    color: '#888888', 
    fontSize: Auto.WHT(28), 
    lineHeight: Auto.WHT(40),
  },

  footDiv: {
    width: ScreenWidth, 
    boxSizing: 'border-box', 
    paddingTop: Auto.WHT(40), 
    paddingLeft: Auto.WHT(30), 
    paddingRight: Auto.WHT(30), 
    paddingBottom: Auto.WHT(40),
  },
  footbtn: {
    width: '100%', 
    border: 'none', 
    color: '#FFFFFF',
    height: Auto.WHT(94), 
    background: '#108EE9', 
    textDecoration: 'none', 
    fontSize: Auto.WHT(36), 
    lineHeight: Auto.WHT(94), 
    borderRadius: Auto.WHT(10),
  },

  footDivWithdraw: {
    width: ScreenWidth, 
    boxSizing: 'border-box', 
    paddingTop: Auto.WHT(15), 
    paddingLeft: Auto.WHT(30), 
    paddingRight: Auto.WHT(30), 
    paddingBottom: Auto.WHT(40),
  },
  footbtnWithdraw: {
    width: '100%', 
    border: '1px #108EE9 solid', 
    color: '#108EE9', 
    height: Auto.WHT(94), 
    background: '#FFFFFF', 
    textDecoration: 'none', 
    fontSize: Auto.WHT(36), 
    lineHeight: Auto.WHT(94), 
    borderRadius: Auto.WHT(10),
  },

}
