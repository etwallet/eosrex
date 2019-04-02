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
      
    };
  }

  componentDidMount() {
   
  }

  render() {
    return (<div style={styles.rootDiv}>
      <p style={styles.description}>REX玩法说明</p>
      <p style={styles.explaintext}>1、在进行买卖REX之前，用户必须要对至少21个节点投过票或代理投票，并且买入4天后方可卖出，之后就不需要进行节点投票。</p>
      <p style={styles.explaintext}> 2、如果REX里面没有足够的EOS，则排入队列，等到EOS足够再卖出，并且卖出时才计算REX价格，用户是可以取消尚未成交的卖出订单。</p>
    </div>)
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
}
