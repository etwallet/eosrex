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
      netQuantity: '0.0000',
      cpuQuantity: '0.0000',
      quantity: '0.0000',
      quantity_rex: '0.0000',
      transType: TransType.BUY,
      actionsList: [
        {actions: this.getBuyActions},
        {actions: this.getSellActions},
      ],
      defaultProducers:[
        'argentinaeos',    
        'atticlabeosb',    
        'bitfinexeos1',    
        'cochainworld',    
        'eos42freedom',    
        'eosauthority',    
        'eosbeijingbp',    
        'eosbixinboot',    
        'eoscannonchn',    
        'eosflytomars',    
        'eoshuobipool',    
        'eosiosg11111',    
        'eoslaomaocom',    
        'eosliquideos',    
        'eosnewyorkio',    
        'eosriobrazil',    
        'eosswedenorg',    
        'helloeoscnbp',    
        'jedaaaaaaaaa',    
        'starteosiobp',    
        'zbeosbp11111',
        // "producer1111",
        // "producer1114",
        // "producer111f"
      ],
      exchangeradio: 0,  //兑换比例
      selectedIndex: 0,
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
    this.props.dispatch(routerRedux.push({pathname: '/GameDescription', query: {lease:false}}))
  }

  onChange = (e) => {
    this.setState({selectedIndex: e.nativeEvent.selectedSegmentIndex})
  }

  onValueChange = (value) => {
    if(value == this.state.values[1]){
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
  //查询冻结的 EOS
  queryWithdrawAmount = async () => {
    let tmp_amount = 0.0000;
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
    console.log('resp tmp_amount',tmp_amount);
    return tmp_amount;
  }
  withdraw = async () => {
    let tmp_amount = await this.queryWithdrawAmount();
    if(tmp_amount < 0.0001){
      Toast.info("没有冻结的币,无需提币");
      return ;
    }
    this.props.dispatch(routerRedux.push({pathname: '/Withdraw', query: {balance: tmp_amount}}))
  }
  auto_sendWithdraw = async (amount) => {
    try {
      let actions = [{
        account: 'eosio',
        name: 'withdraw',
        authorization: [{
          actor: this.props.account,
          permission: this.props.permission,
        }],
        data: {
          owner: this.props.account,
          amount: formatEosQua(amount + ' EOS'), 
        },
      }];
       console.log('actions=',JSON.stringify(actions));
       let resp = await Utils.dispatchActiionData(this, { type: 'common/sendEosAction', payload:{actions: actions}});
       console.log('resp =',JSON.stringify(resp));
       if(resp){
         Utils.dispatchActiionData(this, { type: 'common/getAccountInfo', payload:{account: this.props.account}});
        Toast.info("交易成功");
       }else{
        Toast.info("提币失败");
       }
    } catch (error) {
      console.log('err=',JSON.stringify(error));
    }
  }


  doTrans = async (transType) => {
    try {
      let quantity;
      let banlance;
      if(transType == TransType.BUY){
        quantity = parseFloat(this.state.quantity);
        let cpuQuantity = parseFloat(this.state.cpuQuantity);
        let netQuantity = parseFloat(this.state.netQuantity);
        banlance = parseFloat(this.state.isSwitch ? this.props.eosBalance :this.props.delegated_eosBalance);
        if(this.state.isSwitch){
          if(quantity < 0.0001){
            Toast.info('购买数量错误');
            return ;
          }
        }else{
          if(cpuQuantity < 0.0001 && netQuantity < 0.0001){
            Toast.info('购买数量错误');
            return ;
          }
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
        let resp = await this.doEosTransact(rexTransActions);
        if(resp){
          console.log('doEosTransact+++++');
          // if(this.state.transType == TransType.SELL){
            //卖了REX，自动发起提币
            //  setTimeout(async () => {
            //   let tmp_amount = await this.queryWithdrawAmount();
            //   console.log('tmp_amount 11',tmp_amount);
            //   if(tmp_amount >= 0.0001){
            //     console.log('tmp_amount 22');
            //     // resp = await this.auto_sendWithdraw('' + tmp_amount);
            //     resp = await this.auto_sendWithdraw('0.1000');
            //   }
            // }, 1000);
          // }
          Toast.info('交易成功');
        }else{
          Toast.info('交易失败');
        }
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

  // 使用抵押资源购买rex
  getBuyByStakeActions(){
    let actions = [{
      account: 'eosio',
      name: 'unstaketorex',
      authorization: [{
        actor: this.props.account,
        permission: this.props.permission,
      }],
      data: {
        owner: this.props.account,
        receiver: this.props.account,
	      from_net: formatEosQua(this.state.netQuantity + ' EOS'),
	      from_cpu: formatEosQua(this.state.cpuQuantity + ' EOS'),
      },
    }];

    return actions;
  }

  // 使用余额购买rex
  getBuyByBalanceActions(){
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
        permission: this.props.permission,
      }],
      data: {
        from: this.props.account,
        amount: formatEosQua(this.state.quantity + ' EOS'),
      },
    }];

    return actions;
  }

  /**
   * 买rex
   */
  getBuyActions = () => {
    if(this.state.isSwitch){ // 使用余额购买rex
      return this.getBuyByBalanceActions();
    }

    return this.getBuyByStakeActions();
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
          rex: formatEosQua(this.state.quantity_rex + ' REX'),
        },
      },
    ]

    return actions;
  }

  onQuantityRex = () => {
    this.setState({quantity_rex: this.props.myRexInfo.sell_available_rex})
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
    let resp = await Utils.dispatchActiionData(this, { type: 'common/sendEosAction', payload:{actions: actions}});
    return resp;
  }
  
  showMyRexDetails = () => {
    if(!this.props.myRexInfo.rex_maturities || this.props.myRexInfo.rex_maturities.length == 0){
      Modal.alert('温馨提示', <div>您没有冻结的REX</div>, [
        { text: '关闭', onPress: () => {}},
      ]);
      return;
    }
    this.props.dispatch(routerRedux.push({pathname: '/MyRexDetails', query: { }}))
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
          <List.Item wrap style={{display: 'flex', flexDirection: 'row', }}>
          <span style={styles.centerbottom}>我的REX：</span>
          <span style={styles.centerbottom1}>{this.props.myRexInfo.total_rex} REX</span>
          <span onClick={this.showMyRexDetails.bind(this)} style={styles.rexDetail}>详情</span>
          </List.Item>
        </List>
      </div>
      <WhiteSpace size="lg" />

      <div style={styles.centerDiv}>
        <div style={styles.centertopout}>
          <div style={{flex: 1,}}/>
          <SegmentedControl values={this.state.values} selectedIndex={this.state.selectedIndex} onChange={this.onChange} style={{flex: 2, height: Auto.WHT(62),}} onValueChange={this.onValueChange}/>
          <Button type="ghost" onClick={this.onBuySellList.bind(this)} style={styles.sellbtn} activeStyle={{opacity: '0.5'}} >{ (this.state.transType == TransType.BUY) ? "出售列表" : "买卖列表"}</Button>
        </div>
        {this.state.transType == TransType.BUY ?
        <div style={{display: 'flex', flexDirection: 'column', }}>
          <div style={styles.listitemout}>
            {this.state.isSwitch ?
            <p style={styles.centertoptext}>我的余额：{this.props.eosBalance} EOS</p>
            :
            <div style={{display: 'flex', flex: 1, flexDirection: 'column', }}>
              <p style={styles.centertoptext}>抵押资源：{this.props.delegated_eosBalance} EOS</p>
              <p style={styles.graytext}>{'(net：' + this.props.netDelegated + '  cpu：' + this.props.cpuDelegated + ')'}</p>
            </div>
            }
            <Button type="ghost" onClick={_el => this.setState({isSwitch: !this.state.isSwitch})} style={styles.listbtn} activeStyle={{opacity: '0.5'}}>切换</Button>
          </div>
          {this.state.isSwitch ?
            <div >
              <div style={{height: '1px', background:"#DDDDDD", boxSizing: 'border-box',  marginLeft: Auto.WHT(30), marginRight: Auto.WHT(30), }}/>
              <div style={styles.listitemout}>
                <InputItem  type="text" pattern="[0-9]."  value={this.state.quantity} placeholder="请输入EOS数量"  onChange={(quantity) => this.setState({ quantity: Utils.chkEosQuantity(quantity)})} >购买数量：</InputItem>
                <Button type="ghost" onClick={()=>{this.setState({quantity: this.state.isSwitch ? this.props.eosBalance :this.props.delegated_eosBalance});}}  style={styles.listbtn} activeStyle={{opacity: '0.5'}}>全部</Button>
              </div>
            </div>
            :
            <div>
              <div style={{height: '1px', background:"#DDDDDD", boxSizing: 'border-box',  marginLeft: Auto.WHT(30), marginRight: Auto.WHT(30), }}/>
              <div style={styles.listitemout}>
                <InputItem  type="text" pattern="[0-9]."  value={this.state.netQuantity} placeholder="请输入EOS数量"  onChange={(quantity) => this.setState({ netQuantity: Utils.chkEosQuantity(quantity)})} >使用net：</InputItem>
                <Button type="ghost" onClick={()=>{this.setState({netQuantity: this.props.netDelegated});}}  style={styles.listbtn} activeStyle={{opacity: '0.5'}}>全部</Button>
              </div>

              <div style={{height: '1px', background:"#DDDDDD", boxSizing: 'border-box',  marginLeft: Auto.WHT(30), marginRight: Auto.WHT(30), }}/>
              <div style={styles.listitemout}>
                <InputItem  type="text" pattern="[0-9]."  value={this.state.cpuQuantity} placeholder="请输入EOS数量"  onChange={(quantity) => this.setState({ cpuQuantity: Utils.chkEosQuantity(quantity)})} >使用cpu：</InputItem>
                <Button type="ghost" onClick={()=>{this.setState({cpuQuantity: this.props.cpuDelegated});}}  style={styles.listbtn} activeStyle={{opacity: '0.5'}}>全部</Button>
              </div>
            </div>
          }

          <div style={{height: '1px', background:"#DDDDDD", boxSizing: 'border-box',  marginLeft: Auto.WHT(30), marginRight: Auto.WHT(30), }}/>
        </div>
        :
        <div style={{display: 'flex', flexDirection: 'column', }}>
          <div style={styles.listitemout}>
           <InputItem  type="text" pattern="[0-9]." value={this.state.quantity_rex} placeholder="请输入REX数量"  onChange={(quantity_rex) => this.setState({ quantity_rex: Utils.chkEosQuantity(quantity_rex)})}	>出售数量：</InputItem>
           <Button type="ghost" onClick={this.onQuantityRex.bind(this)}  style={styles.listbtn} activeStyle={{opacity: '0.5'}}>全部</Button>
          </div>
          <div style={{height: '1px', background:"#DDDDDD", boxSizing: 'border-box',  marginLeft: Auto.WHT(30), marginRight: Auto.WHT(30), }}/>
          <div style={styles.listitemout11}>
            <p style={styles.centertoptext11}>可卖数量：{this.props.myRexInfo.sell_available_rex} REX</p>
          </div>
          <div style={{height: '1px', background:"#DDDDDD", boxSizing: 'border-box',  marginLeft: Auto.WHT(30), marginRight: Auto.WHT(30), }}/>
         </div>
        }
      </div>

      {(this.state.transType == TransType.BUY) &&
      <div style={{padding: Auto.WHT(30), }}>
        <p style={styles.ordertext}>订单确认：</p>
      <div style={styles.orderout}>花费{this.state.isSwitch ? this.state.quantity : parseFloat(this.state.netQuantity) + parseFloat(this.state.cpuQuantity)} EOS，为您兑换{((this.state.isSwitch ? parseFloat(this.state.quantity) : parseFloat(this.state.netQuantity) + parseFloat(this.state.cpuQuantity)) * this.state.exchangeradio).toFixed(4)} REX</div>
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
    height: Auto.WHT(110), 
    display:"flex", 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottom: '1px solid #DDDDDD',
  },
  centertoptext: {
    flex: 1,
    color: '#000000', 
    fontSize: Auto.WHT(34), 
    lineHeight: Auto.WHT(42), 
    paddingLeft: Auto.WHT(30),  
  },
  graytext: {
    flex: 1,
    color: 'gray', 
    fontSize: Auto.WHT(30), 
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
  centerbottom1: {
    display: 'flex',
    flex: 1,
    color: '#888888', 
    fontSize: Auto.WHT(28),
  },
  rexDetail: {

    color: '#108EE9', 
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
    height:  Auto.WHT(110), 
    paddingRight: Auto.WHT(30),
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

  listitemout11: {
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    height:  Auto.WHT(88), 
    // paddingRight: Auto.WHT(30),
  },
  centertoptext11: {
    flex: 1,
    textAlign: 'center',
    color: '#888888', 
    fontSize: Auto.WHT(26), 
    lineHeight: Auto.WHT(37), 
    // paddingLeft: Auto.WHT(30),  
  },

}
