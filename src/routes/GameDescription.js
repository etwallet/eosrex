import React from 'react';
import { ListView, Button,  InputItem, } from 'antd-mobile';
import { injectIntl } from 'react-intl';
import { connect } from 'dva';
import Auto from '../utils/Auto'
import {routerRedux} from 'dva/router';
import Constants from '../utils/Constants'
require('moment/locale/zh-cn');
var ScreenWidth = window.screen.width 
var ScreenHeight = window.screen.height

class GameDescription extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lease: this.props.location.query ? this.props.location.query.lease : false,
    };
  }

  componentDidMount() {
   
  }

  render() {
    return (<div style={styles.rootDiv}>
      <p style={styles.description}>REX玩法说明</p>
      <p style={styles.explaintext}>1、在进行买卖REX之前，用户必须要对至少21个节点投过票或代理投票，并且买入4天后方可卖出，之后就不需要进行节点投票。</p>
      <p style={styles.explaintext}> 2、如果REX里面没有足够的EOS，则排入队列，等到EOS足够再卖出，并且卖出时才计算REX价格，用户是可以取消尚未成交的卖出订单。</p>
      {this.state.lease &&
      <div >
        <p style={styles.descriptiontitle}>租赁介绍</p>
        <p style={styles.explaintext}>1、您可以根据自己的需要填写足量的CPU，NET,租用时长，默认接收账户是您当前使用的账户，可给当前账户租赁，还可以帮助朋友租赁，
             默认接收账户是您当前使用账户，您可以修改为朋友账户，填写完成后，在订单确认里您可以看到当前可以租用的EOS金额，确认无误后，点击一键租赁完成资源租赁。</p>
      </div>
      }
    </div>
    )
  }
} 

export default connect(({ }) => ({ }))(injectIntl(GameDescription));

const styles = { 
  rootDiv:{
    width: ScreenWidth,
    height: ScreenHeight,
    background:"#F5F5F9",
    boxSizing: 'border-box', 
    padding: Auto.WHT(30),
  },
  description: {
    color: '#000000', 
    fontSize: Auto.WHT(48), 
    lineHeight: Auto.WHT(67), 
    paddingTop: Auto.WHT(10),
  },
  explaintext: {
    color: '#333333', 
    fontSize: Auto.WHT(28), 
    lineHeight: Auto.WHT(36), 
    paddingTop: Auto.WHT(30),
  },
  descriptiontitle: {
    color: '#000000', 
    fontSize: Auto.WHT(48), 
    lineHeight: Auto.WHT(67), 
    paddingTop: Auto.WHT(70),
  },
}
