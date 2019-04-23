import React from 'react';
import { Toast, Button, Modal, InputItem,} from 'antd-mobile';
import { injectIntl } from 'react-intl';
import { connect } from 'dva';
import Auto from '../utils/Auto';
import Utils from '../utils/Utils';
import {formatEosQua} from '../utils/FormatUtil';

require('moment/locale/zh-cn');
var ScreenWidth = window.screen.width 
var ScreenHeight = window.screen.height
const alert = Modal.alert;


class Withdraw extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: this.props.location.query ? this.props.location.query.balance : '0.0000',
      quantity: '', 
    };
  }

  componentDidMount() {
    // Utils.dispatchActiionData(this, { type: 'rex/getMyRexInfo', payload:{account: this.props.account}});
  }


  sendWithdraw = async () => {
    try {
      let quantity = parseFloat(this.state.quantity).toFixed(4);
      let banlance = parseFloat(this.state.balance).toFixed(4);
      if(quantity < 0.0001){
        Toast.info('请输入提现数量');
        return ;
      }
      if(quantity > banlance){
        Toast.info('余额不足');
        return ;
      }
      let actions = [{
        account: 'eosio',
        name: 'withdraw',
        authorization: [{
          actor: this.props.account,
          permission: this.props.permission,
        }],
        data: {
          owner: this.props.account,
          amount: formatEosQua(this.state.quantity + ' EOS'), 
        },
      }];
       let resp = await Utils.dispatchActiionData(this, { type: 'common/sendEosAction', payload:{actions: actions}});
    //    alert("resp="+JSON.stringify(resp));
       if(resp){
        Toast.info("成功");
       }else{
        Toast.info("失败");
       }
    } catch (error) {
      
    }
  }
 

  render() {
    return (<div style={styles.rootDiv}>
      <div style={{background:'#FFFFFF', }}>
        <div style={styles.headtopout}>
          <Button type="ghost"  style={styles.centertopbtn} onClick={_el => {}}
            activeStyle={{opacity: '0.5'}} icon={<img src={'../img/eos_icon.png'}  style={styles.reportimg} />} />
        </div>
        <div style={styles.headbottomout}>
          <p style={styles.headbottomleft}>余额: {this.state.balance} EOS</p>
        </div>
        <div style={styles.centertopout}>
          <p style={styles.centertoptext}>收款账户：{ this.props.account}</p>
        </div>
      </div>
      <div style={styles.centerDiv}>
        <div style={{display: 'flex', flexDirection: 'column', }}>
          <div style={styles.listitemout}>
            <InputItem  type="text" pattern="[0-9]."  value={this.state.quantity} placeholder="请输入提现数量" ref={el => this.autoFocusInst = el}  onChange={(quantity) => this.setState({ quantity: Utils.chkEosQuantity(quantity) })} >提现数量：</InputItem>
          </div>
        </div>
      </div>

      <div style={styles.footDiv}>
        <Button type="ghost" style={styles.footbtn} activeStyle={{opacity: '0.5'}}
        onClick={this.sendWithdraw.bind(this)}>提现</Button>
      </div>

    </div>)
  }
} 

export default connect(({ common, rex }) => ({ ...common, ...rex }))(injectIntl(Withdraw));

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
    justifyContent: 'center', 
    height: Auto.WHT(188), 
    // paddingLeft: Auto.WHT(30), 
    // paddingRight: Auto.WHT(30), 
  },
  
  headbottomout: {
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    // padding: Auto.WHT(13),
  },
  headbottomleft: {
    color: '#333333', 
    fontSize: Auto.WHT(36), 
    lineHeight: Auto.WHT(45), 
    // paddingBottom: Auto.WHT(9),
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
    justifyContent: 'center', 
    // borderBottom: '1px solid #DDDDDD',
  },
  centertoptext: {
    color: '#888888', 
    fontSize: Auto.WHT(34), 
    lineHeight: Auto.WHT(42), 
    // paddingLeft: Auto.WHT(30),  
  },
  centertopbtn: {
    border: 'none', 
    borderRadius: 0,
    color: '#D9D9D9', 
    padding: '0 0.4rem',
    // height: Auto.WHT(36),
    textDecoration: 'none', 
  },
  reportimg: {
    width: Auto.WHT(30),
    height: Auto.WHT(30),
    margin: 0,
  },
  
  listitemout: {
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
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
  

}
