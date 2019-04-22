import React from 'react';
import { Toast,  ListView, Button,  Progress, InputItem, List, WhiteSpace,Stepper} from 'antd-mobile';
import { injectIntl } from 'react-intl';
import { connect } from 'dva';
import {routerRedux} from 'dva/router';
import Auto from '../utils/Auto'
import Utils from '../utils/Utils'
import {formatEosQua} from '../utils/FormatUtil';

require('moment/locale/zh-cn');
var ScreenWidth = window.screen.width 
var ScreenHeight = window.screen.height

class Index extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
    this.state = {
      dataSource,
      cpuval: 0.1,
      netval: 0.1,
      timeval: 30,
      cpuval_price: 0,
      netval_price: 0,
      toAccount: this.props.account,
    };
  }

  componentDidMount() {
    document.addEventListener('scatterLoaded', scatterExtension => {
      Utils.dispatchActiionData(this, { type: 'common/login', payload:{}});
    });

    setTimeout(()=>{
      this.login();
    }, 10);
  }

  async login() {
    let accountInfo = await Utils.dispatchActiionData(this, { type: 'common/login', payload:{}});
    if(!accountInfo){
      return;
    }
    this.setState({toAccount: accountInfo.name});
  }

  update_costval(){
   let cpuval_price = 0;
   let netval_price = 0;
   
   try {
    let total_rent = Utils.sliceUnit(this.props.rexpool.total_rent);
    let total_unlent = Utils.sliceUnit(this.props.rexpool.total_unlent);
    let float_total_rent = parseFloat(total_rent);
    let float_total_unlent = parseFloat(total_unlent);
    let cpuval = parseFloat(this.state.cpuval);
    let netval = parseFloat(this.state.netval);

    let tmp = (float_total_rent + cpuval).toFixed(4);
    let tmp1 = ((float_total_unlent*cpuval)/tmp).toFixed(4);
    cpuval_price = (tmp1/cpuval).toFixed(4);
    
    let tmp2 = (float_total_rent + netval).toFixed(4);
    let tmp3 = ((float_total_unlent*netval)/tmp2).toFixed(4);
    netval_price = (tmp3/netval).toFixed(4);
    // alert("tmp="+tmp + "tmp1="+tmp1 + " tmp2=" + tmp2 + " tmp3=" + tmp3 +" cpuval_price="+cpuval_price + " netval_price="+netval_price);
  } catch (error) {
    cpuval_price = 0;
    netval_price = 0;
  }
   this.setState({cpuval_price: cpuval_price,netval_price: netval_price});
  }
  onCpuChange = (cpuval) => {
    // console.log(val);
    this.setState({ cpuval });
    this.update_costval();
  }

  onNetChange = (netval) => {
    // console.log(val);
    this.setState({ netval });
    this.update_costval();
  }

  onTimeChange = (timeval) => {
    // console.log(val);
    this.setState({ timeval });
  }

  onbuysell = () => {
    this.props.dispatch(routerRedux.push({pathname: '/BuyandSell', query: {   }}))
  }

  description = () => {
    this.props.dispatch(routerRedux.push({pathname: '/GameDescription', query: {   }}))
  }
 
  doRent = () => {
    if(!this.props.account){
      Toast.info("请先登录", 1);
      return;
    }
    let actions = [
      {
        account: 'eosio',
        name: 'rentcpu',
        authorization: [{
          actor: this.props.account,
          permission: this.props.permission,
        }],
        data: {
          from: this.props.account,
          receiver: this.props.toAccount,
          loan_payment: formatEosQua(this.state.cpuval + ' EOS'),
          loan_fund: '0.0000 EOS',
        },
      },
      {
        account: 'eosio',
        name: 'rentnet',
        authorization: [{
          actor: this.props.account,
          permission: this.props.permission,
        }],
        data: {
          from: this.props.account,
          receiver: this.props.toAccount,
          loan_payment: formatEosQua(this.state.netval + ' EOS'),
          loan_fund: '0.0000 EOS',
        },
      }
    ];

    Utils.dispatchActiionData(this, { type: 'common/sendEosAction', payload:{actions: actions}});
  }

  render() {
    return (<div style={styles.rootDiv}>
      <div style={{background:'#FFFFFF', }}>
        <div style={styles.headtopout}>
          <p style={styles.headtoptext}>可出租资源:(EOS)</p>
          <Button type="ghost" onClick={this.onbuysell.bind(this)} style={styles.headtopbtn} activeStyle={{opacity: '0.5'}}>买卖</Button>
        </div>
        <div style={styles.headbottomout}>
          <p style={styles.headbottomtext}>{Utils.sliceUnit(this.props.rexpool.total_unlent)}</p>
          <Progress percent={this.props.lent_percent} position="normal" unfilled={true} style={styles.progress} barStyle={styles.barout}/>
          <div style={styles.rentout}>
            <p style={styles.renttext}>已出租：{Utils.sliceUnit(this.props.rexpool.total_lent)}</p>
            <p style={styles.renttext}>总量：{Utils.sliceUnit(this.props.rexpool.total_lendable)}</p>
          </div>
        </div>
      </div>
      <WhiteSpace size="lg" />

      <div style={styles.centerDiv}>
        <div style={styles.centertop}>
          <p style={styles.centertoptitle}>租用资源</p>
          <p style={styles.centertoptext}>我的余额：{this.props.eosBalance} EOS</p>
        </div>
        <p style={styles.centertoptitle}>付款账户：{this.props.account}</p>
        <InputItem   
          value={this.state.toAccount}
          onChange={(toAccount) => this.setState({ toAccount })}
          ref={el => this.autoFocusInst = el}>接收账户：</InputItem>
      </div>
      <WhiteSpace size="lg" />

      <div style={styles.centerDiv}>
        <div style={styles.centertop}>
          <p style={styles.centertoptitle}>租赁费用</p>
          <Button type="ghost"  style={styles.centertopbtn} onClick={_el => this.description()}
          activeStyle={{opacity: '0.5'}} icon={<img src={'../img/help.png'}  style={styles.reportimg} />} />
        </div>
        <List>
          <List.Item wrap
            extra={<Stepper style={{ width: '100%', minWidth: '100px' }} showNumber max={10} 
              min={0.1} step={0.1} value={this.state.cpuval} onChange={(cpuval) => {this.onCpuChange(cpuval)}}/>}
          >CPU</List.Item>
          <List.Item wrap
            extra={<Stepper style={{ width: '100%', minWidth: '100px' }} showNumber max={10}
              min={0.1} step={0.1} value={this.state.netval} onChange={(netval) => {this.onNetChange(netval)}}/>}
          >NET</List.Item>
          <List.Item wrap
            extra={<Stepper style={{ width: '100%', minWidth: '100px' }} showNumber max={300}
              min={30} step={30} value={this.state.timeval} onChange={(timeval) => {this.onTimeChange(timeval)}}/>}
          >租用时长(天)</List.Item>
        </List>
      </div>

      <div style={styles.footDiv}>
        <p style={styles.description}>订单确认：</p>
        <div style={styles.explaintext}>{this.props.account}为{this.state.toAccount}租赁抵押{this.state.timeval}天，花费{(this.state.cpuval + this.state.netval).toFixed(1)} EOS租赁CPU {this.state.cpuval_price}，租赁NET {this.state.netval_price}。</div>
        <Button onClick={this.doRent} type="ghost" style={styles.footbtn} activeStyle={{opacity: '0.5'}}>一键租赁</Button>
      </div>
    </div>)
  }
} 

export default connect(({common, vote }) => ({...common, ...vote }))(injectIntl(Index));

const styles = { 
  rootDiv:{
    width: ScreenWidth,
    height: ScreenHeight,
    background:"#F8F8F8",
    boxSizing: 'border-box', 
  },

  headtopout: {
    height: Auto.WHT(88), 
    paddingLeft: Auto.WHT(30), 
    paddingRight: Auto.WHT(30), 
    display:"flex", 
    flexDirection: 'row', 
    alignItems: 'center',  
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
    borderRadius: Auto.WHT(10), 
    fontSize: Auto.WHT(26), 
    color: '#108EE9', 
  },
  headbottomout: {
    display: 'flex', 
    flexDirection: 'column', 
    padding: Auto.WHT(30), 
    paddingTop: Auto.WHT(10),
  },
  headbottomtext: {
    color: '#000000', 
    fontSize: Auto.WHT(48), 
    lineHeight: Auto.WHT(67), 
    paddingBottom: Auto.WHT(22),
  },
  progress: {
    height: Auto.WHT(34), 
    background: '#FFFFFF', 
    border: '1PX solid #E9E9E9', 
    borderRadius: Auto.WHT(17)
  },
  barout: {
    background: '#108EE9', 
    borderWidth: Auto.WHT(17), 
    borderStyle: 'solid', 
    borderColor: '#108EE9', 
    borderRadius: Auto.WHT(17)
  },
  rentout: {
    width: '100%', 
    display:"flex", 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: Auto.WHT(30), 
  },
  renttext: {
    color: '#888888', 
    fontSize: Auto.WHT(30), 
    lineHeight: Auto.WHT(34),
  },

  centerDiv: {
    display: 'flex', 
    flexDirection: 'column',
    background: '#FFFFFF',
  },
  centertop: {
    height: Auto.WHT(88), 
    display:"flex", 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottom: '1px solid #DDDDDD',
  },
  centertoptitle: {
    color: '#000000', 
    fontSize: Auto.WHT(35), 
    lineHeight: Auto.WHT(84), 
    paddingLeft: Auto.WHT(30),
  },
  centertoptext: {
    color: '#888888', 
    fontSize: Auto.WHT(30), 
    lineHeight: Auto.WHT(34), 
    paddingRight: Auto.WHT(30),
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

  footDiv: {
    flex: 1, 
    padding: Auto.WHT(30), 
  },
  description: {
    color: '#000000', 
    fontSize: Auto.WHT(28), 
    paddingTop: Auto.WHT(10), 
    paddingBottom: Auto.WHT(10),
  },
  explaintext: {
    color: '#888888', 
    fontSize: Auto.WHT(28), 
    lineHeight: Auto.WHT(40),
  },
  footbtn: {
    width: '100%', 
    height: Auto.WHT(94), 
    lineHeight: Auto.WHT(94), 
    background: '#108EE9', 
    border: 'none', 
    textDecoration: 'none', 
    borderRadius: Auto.WHT(10), 
    fontSize: Auto.WHT(36), 
    color: '#FFFFFF',
    marginTop: Auto.WHT(40),
    marginBottom: Auto.WHT(40),
  },
}
