import React,{Component} from 'react'
import { connect } from 'dva';
import {routerRedux} from 'dva/router';
import { injectIntl } from 'react-intl';
import moment from "moment";
import PropTypes from 'prop-types';
import Auto from '../utils/Auto'
import Utils from '../utils/Utils'
import Constants from '../utils/Constants'
import { Toast, PullToRefresh, ListView, Button, WhiteSpace, List, Modal} from 'antd-mobile';
var ScreenWidth = document.documentElement.clientWidth;
var ScreenHeight = document.documentElement.clientHeight;
require('moment/locale/zh-cn');

class DetailsList extends Component{
    constructor(props) {
        super(props);
        const dataSource = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
        this.state = {
            dataSource,
            isbuysell: this.props.location.query ? this.props.location.query.isBuySell : localStorage.getItem('buy_sell'),
            data: []
        }
    }
    componentWillMount(){
      this.getListData();
    }
    componentDidMount() {
       
    }
    async getListData(){
        // alert(JSON.stringify(this.props.rexpool));
        let  total_rex = 0.0000;
        let  total_lendable = 0.0000;
        try {
            let s1 = Utils.sliceUnit(this.props.rexpool.total_rex);
            let s2 = Utils.sliceUnit(this.props.rexpool.total_lendable);
            total_rex = parseFloat(s1);
            total_lendable = parseFloat(s2);
          } catch (error) {
            total_rex = 0.0000;
            total_lendable = 0.0000;
        }
        // alert("total_rex="+total_rex+" total_lendable=" + total_lendable);
        let resp = await Utils.dispatchActiionData(this, { type: 'common/querySellRexInfo', payload:{account: this.props.account}});
        // let resp = [
        //     {transaction: false, quantity: '9 REX', conversionratio: '1 EOS ≈ 500 REX', createdate: 1520840297000, },
        // ];
        // alert("resp"+JSON.stringify(resp));
        if(resp && resp.rows){
            let retArray = new Array();
            resp.rows.forEach(function(val,index){
                let price = 0;
                try {
                    let s3 =  Utils.sliceUnit(val.rex_requested);
                    let amount = parseFloat(s3);
                    let tmp1 = (total_lendable+amount).toFixed(4);
                    let tmp2 = (total_rex*tmp1/total_lendable).toFixed(4);
                    let tmp3 = (tmp2 - total_rex).toFixed(4);
                    price = (tmp3/amount).toFixed(4);
                    // alert("tmp1="+tmp1 + " tmp2=" + tmp2 + " tmp3=" + tmp3 +" price="+price);
                } catch (error) {
                    price = 0;
                }
                retArray[index] = {
                    transaction: false, quantity: val.rex_requested, conversionratio: '1 EOS ≈ '+price+' REX', createdate: val.order_time, 
                };
            });
            this.setState({data: retArray});
        }else{
            Toast.info("暂无更多数据");
        }
    }
    onRefresh() {

    }

    onEndReached() {

    }
    async refundTransaction(){
       let actions = [{
        account: 'eosio',
        name: 'cnclrexorder',
        authorization: [{
          actor: this.props.account,
          permission: this.props.permission,
        }],
        data: {
          owner: this.props.account,
        },
      }];
    //    alert('refundTransaction='+JSON.stringify(actions));
       let resp = await Utils.dispatchActiionData(this, { type: 'common/sendEosAction', payload:{actions: actions}});
    //    alert("resp="+JSON.stringify(resp));
       if(resp){
        Toast.info("撤单成功");
       }else{
        Toast.info("撤单失败");
       }
    }
    onWithdraw = () => {
        Modal.alert('', '您是否撤回这次交易？', [
            { text: '取消', onPress: () => console.log('取消'), style: 'default' },
            { text: '确定', onPress: () => this.refundTransaction() },
        ]);
    }

    render() {
        return <div style={styles.rootDiv}>
            <ListView
                useBodyScroll
                pageSize={4}
                ref={el => this.lv = el}
                dataSource={this.state.dataSource.cloneWithRows(this.state.data)}
                pullToRefresh={<PullToRefresh 
                    refreshing={this.props.loading} 
                    onRefresh={this.onRefresh} />
                }
                onEndReached={this.onEndReached}
                renderRow={this._renderRow}
            />
        </div>
    }

    _renderRow= (rowData, sectionID, rowID) => {
        return (<div key={rowID} style={styles.rowDiv}>
            <div style={styles.listTopout}>
               <p style={styles.buyselltext}>{this.state.isbuysell ? '卖' : '买'}</p>
               <p style={styles.datetext}>{moment(rowData.createdate).format('MM-DD')}</p>
               <p style={styles.clinchtext}>{rowData.transaction ? '已成交' : '待成交'}</p>
               <div style={{flex: 1,}}/>
               {!rowData.transaction && <Button type="ghost" onClick={this.onWithdraw.bind(this)} style={styles.listTopbtn} activeStyle={{opacity: '0.5'}}>撤回</Button>}
            </div>
            <List>
                <List.Item wrap>出售数量：{rowData.quantity}</List.Item>
                <List.Item wrap>兑换比例：{rowData.conversionratio}</List.Item>
                <List.Item wrap>成交时间：{moment(rowData.createdate).format('HH:mm:ss')}</List.Item>
            </List>
            <WhiteSpace size="lg" />
        </div>)
    }
  
}

export default connect(({ common,}) => ({ ...common,}))(injectIntl(DetailsList));

const styles = {
    rootDiv: {
        width: ScreenWidth,
        height: ScreenHeight,
        background: '#F5F5F9',
        boxSizing: 'border-box', 
    },
    rowDiv: {
        background: '#F5F5F9',
    },
    listTopout: {
        display:"flex", 
        flexDirection: 'row', 
        alignItems: 'center',
        height: Auto.WHT(88), 
        paddingLeft: Auto.WHT(30), 
        paddingRight: Auto.WHT(30), 
        backgroundColor: '#FFFFFF',
        borderBottom: '1px #DDDDDD solid', 
    },
    buyselltext: {
        color: '#000000', 
        fontSize: Auto.WHT(34), 
        lineHeight: Auto.WHT(48), 
    },
    datetext: {
        color: '#BBBBBB', 
        fontSize: Auto.WHT(34), 
        lineHeight: Auto.WHT(48), 
        paddingLeft: Auto.WHT(30), 
        paddingRight: Auto.WHT(30),
    },
    clinchtext: {
        color: '#108EE9', 
        textAlign: 'center', 
        width: Auto.WHT(110), 
        fontSize: Auto.WHT(28), 
        lineHeight: Auto.WHT(42),
        border: '1px #108EE9 solid', 
    },
    listTopbtn: {
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
}