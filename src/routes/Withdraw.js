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


class Withdraw extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      quantity: '0',
    };
  }

  componentDidMount() {
    // Utils.dispatchActiionData(this, { type: 'rex/getMyRexInfo', payload:{account: this.props.account}});
  }


  description = () => {
  }
 
  doTrans = () => {
 
  }


  render() {
    return (<div style={styles.rootDiv}>
      <div style={{background:'#FFFFFF', }}>
        <div style={styles.headtopout}>
          <Button type="ghost"  style={styles.centertopbtn} onClick={_el => this.description()}
            activeStyle={{opacity: '0.5'}} icon={<img src={'../img/help.png'}  style={styles.reportimg} />} />
        </div>
        <div style={styles.headbottomout}>
          <p style={styles.headbottomleft}>余额: 200EOS</p>
        </div>
        <div style={styles.centertopout}>
          <p style={styles.centertoptext}>收款账户：{ this.props.account}</p>
        </div>
      </div>
      <WhiteSpace size="lg" />
      <div style={styles.centerDiv}>
        <div style={{display: 'flex', flexDirection: 'column', }}>
          <div style={styles.listitemout}>
            <InputItem  value={this.state.quantity} placeholder="请输入EOS数量" ref={el => this.autoFocusInst = el}>提现数量：</InputItem>
          </div>
        </div>
      </div>

      <div style={styles.footDiv}>
        <Button type="ghost" style={styles.footbtn} activeStyle={{opacity: '0.5'}}
        onClick={this.doTrans.bind(this)}>提现</Button>
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
    padding: Auto.WHT(20),
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

  

}
