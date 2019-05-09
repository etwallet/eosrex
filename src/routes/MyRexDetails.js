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

class MyRexDetails extends Component{
    constructor(props) {
        super(props);
        const dataSource = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
        this.state = {
            dataSource,
        }
    }
    componentWillMount(){
        alert(JSON.stringify(this.props.myRexInfo.rex_maturities))
    }
    componentDidMount() {
       
    }

    render() {
        return <div style={styles.rootDiv}>
            {/* <List>
                <List.Item wrap>总量：{this.props.myRexInfo.total_rex + ' REX'}</List.Item>
                <List.Item wrap>可卖：{this.props.myRexInfo.sell_available_rex + ' REX'}</List.Item>
            </List> */}
            <p style={styles.titletext}>我的REX</p>
            <p style={styles.headtext}>总量：{this.props.myRexInfo.total_rex + ' REX'}</p>
            <p style={styles.headtext}>可卖：{this.props.myRexInfo.sell_available_rex + ' REX'}</p>
            <ListView
                useBodyScroll
                pageSize={4}
                ref={el => this.lv = el}
                dataSource={this.state.dataSource.cloneWithRows(this.props.myRexInfo.rex_maturities)}
                renderRow={this._renderRow}
            />
        </div>
    }

    _renderRow= (rowData, sectionID, rowID) => {
        return (<div key={rowID} style={styles.rowDiv}>
            <WhiteSpace size="lg" />
            <div style={styles.listTopout}>
               <p style={styles.clinchtext}>{(rowData.second/10000).toFixed(4)+ ' REX'}</p>
               <p style={styles.datetext}>{rowData.first + ' 解冻'}</p>
            </div>
        </div>)
    }
  
}

export default connect(({ rex,}) => ({ ...rex,}))(injectIntl(MyRexDetails));

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
    datetext: {
        color: '#BBBBBB', 
        fontSize: Auto.WHT(28), 
        lineHeight: Auto.WHT(48), 
        paddingLeft: Auto.WHT(30), 
        paddingRight: Auto.WHT(30),
    },
    titletext: {
        background: '#FFFFFF',
        textAlign: 'center', 
        fontSize: Auto.WHT(40), 
        lineHeight: Auto.WHT(50),
    },
    headtext: {
        background: '#FFFFFF',
        fontSize: Auto.WHT(28), 
        lineHeight: Auto.WHT(42),
        paddingLeft: Auto.WHT(30), 
        paddingRight: Auto.WHT(30),
        paddingTop: Auto.WHT(10),
    },
    clinchtext: {
        background: '#FFFFFF',
        // color: '#108EE9', 
        // textAlign: 'center', 
        // width: Auto.WHT(110), 
        fontSize: Auto.WHT(28), 
        lineHeight: Auto.WHT(42),
        // border: '1px #108EE9 solid', 
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