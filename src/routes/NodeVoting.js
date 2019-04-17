import React,{Component} from 'react'
import { connect } from 'dva';
import {routerRedux} from 'dva/router';
import { injectIntl } from 'react-intl';
import moment from "moment";
import PropTypes from 'prop-types';
import Auto from '../utils/Auto'
import Utils from '../utils/Utils'
import { Toast, PullToRefresh, ListView, Button, WhiteSpace, List, Modal, Checkbox} from 'antd-mobile';
var ScreenWidth = document.documentElement.clientWidth;
var ScreenHeight = document.documentElement.clientHeight;
const CheckboxItem = Checkbox.CheckboxItem;
require('moment/locale/zh-cn');

class NodeVoting extends Component{
    constructor(props) {
        super(props);
        const dataSource = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
        this.state = {
            dataSource,
            selected: 0,
            producers: []
        }
    }

    componentDidMount() {
        this.onRefresh();
    }

    onRefresh() {
        this.getVoteInfo();
    }

    onEndReached() {

    }

    async getVoteInfo(){
        let producers = await Utils.dispatchActiionData(this, { type: 'vote/listProducers', payload:{}});
        let selected = 0;
        producers.forEach((item) => {
            if(item.isSelect){
                selected++;  
            }
        })
        this.setState({producers: producers, selected: selected});
    }

    getVoteActions = () => {
        let producers = [];
        this.state.producers.forEach((p) => {
            if(p.isSelect){
                producers.push(p.owner);
            }
        });
        producers.sort();

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
            producers: producers,
          },
        }];
    
        return actions;
    }

    async doVote (){
        let actions = this.getVoteActions();
        let resp = await Utils.dispatchActiionData(this, { type: 'common/sendEosAction', payload:{actions: actions}});
        if(resp.transaction_id){
            Toast.info("投票成功");
            return;
        }

        Toast.info("投票失败");
    }

    voteProc = () =>{
        if(this.state.selected < 21){
            let dialog = Modal.alert('温馨提示', <div>您的选择少于21个节点，交易REX必须要对至少21个节点投过票或代理投票，确定进行投票?</div>, [
                { text: '重新选择', onPress: () => {}},
                { text: '确定', onPress: () =>{dialog.close();  this.doVote()}},
            ])            
            return;
        }

        this.doVote();
    }

    selectItem = (rowData) => {
        let newdata = new Array();
        let quantity = 0;
        this.state.producers.forEach((item) => {
            if(item.owner == rowData.owner){
                item.isSelect = !item.isSelect;
            }

            if(item.isSelect){
                quantity++;  
            }
            newdata.push(item);
        })

        this.setState({producers: newdata, selected: quantity});
    }
    render() {
        return <div style={styles.rootDiv}>
            <div style={styles.headerDiv}>
                <img src={'../img/nodevote.png'}  style={styles.headerimg} />  
                <p style={styles.headertitle}>节点投票</p>
                <p style={styles.headertext}>1、在进行买卖REX之前，用户必须要对至少21个节点投过票或代理投票。 </p>
                <p style={styles.headertext}>2、在进行投票前，用户需要进行EOS抵押换取投票权。</p>
            </div>
            <WhiteSpace size="lg" />
            <ListView
                useBodyScroll
                pageSize={4}
                ref={el => this.lv = el}
                style={{paddingLeft: Auto.WHT(30), backgroundColor: '#FFFFFF', paddingBottom: Auto.WHT(100), }}
                dataSource={this.state.dataSource.cloneWithRows(this.state.producers)}
                pullToRefresh={<PullToRefresh 
                    refreshing={this.props.loading} 
                    onRefresh={this.onRefresh} />
                }
                onEndReached={this.onEndReached}
                renderRow={this._renderRow}
            />
            <div style={styles.footDiv}>
               <p style={styles.foottext}>已选节点：{this.state.selected}/21</p>
               <Button type="ghost" onClick={this.voteProc.bind(this)} style={styles.footbtn} activeStyle={{opacity: '0.5'}}>投票</Button>
            </div>
        </div>
    }

    _renderRow = (rowData, sectionID, rowID) => {
        return (<div key={rowID} style={styles.rowDiv}>
            <img src={rowData.icon ? rowData.icon : '../img/help.png'}  style={styles.nodeimg} />  
            <div style={styles.rownodeout}>
                <p style={styles.nodename}>{rowData.owner}</p>
                {/* <p style={styles.regiontext}>{rowData.region}</p> */}
            </div>
            <Button type="ghost" onClick={this.selectItem.bind(this,rowData)} style={styles.listbtn} activeStyle={{opacity: '0.5'}}
                icon={<img src={rowData.isSelect ? '../img/check.png' : '../img/check_h.png'} style={styles.listbtnimg} />}/>
        </div>)
    }

}

export default connect(({ common, rex, vote }) => ({ ...common, ...rex, ...vote }))(injectIntl(NodeVoting));

const styles = {
    rootDiv: {
        width: ScreenWidth,
        height: ScreenHeight,
        background: '#F5F5F9',
        boxSizing: 'border-box', 
        
    },
    headerDiv: {
        display:"flex", 
        alignItems: 'center', 
        background: '#FFFFFF', 
        flexDirection: 'column', 
        paddingTop: Auto.WHT(40),
        paddingLeft: Auto.WHT(30), 
        paddingRight: Auto.WHT(30), 
    },
    headerimg: {
        width: Auto.WHT(133), 
        height: Auto.WHT(133), 
    },
    headertitle: {
        color: '#333333', 
        padding: Auto.WHT(20),
        fontSize: Auto.WHT(28), 
        lineHeight: Auto.WHT(36), 
    },
    headertext: {
        color: '#333333', 
        fontSize: Auto.WHT(28), 
        lineHeight: Auto.WHT(36), 
        paddingBottom: Auto.WHT(30),
    },

    rowDiv: {
        display:"flex", 
        flexDirection: 'row', 
        alignItems: 'center',
        paddingTop: Auto.WHT(18),
        paddingBottom: Auto.WHT(18),
        background: '#FFFFFF',
        borderBottom: '1px #DDDDDD solid', 
    },
    nodeimg: {
        width: Auto.WHT(100), 
        height: Auto.WHT(100), 
    },
    rownodeout: {
        flex: 1, 
        paddingLeft: Auto.WHT(30), 
    },
    nodename: {
        color: '#000000', 
        fontSize: Auto.WHT(34), 
        lineHeight: Auto.WHT(48), 
    },
    regiontext: {
        color: '#888888', 
        fontSize: Auto.WHT(28), 
        lineHeight: Auto.WHT(40), 
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
    listbtn: {
        border: 'none', 
        borderRadius: 0, 
        color: '#FFFFFF',
        textDecoration: 'none', 
        fontSize: Auto.WHT(26), 
    },
    listbtnimg: {
        width: Auto.WHT(42), 
        height: Auto.WHT(42), 
        margin: Auto.WHT(30), 
    },

    footDiv: {
        width: ScreenWidth, 
        bottom: 0, 
        display:"flex", 
        position: 'fixed', 
        flexDirection: 'row', 
        alignItems: 'center',
        backgroundColor: '#FFFFFF', 
        borderTop: '1px #DDDDDD solid', 
    },
    foottext: {
        flex: 1, 
        color: '#000000', 
        fontSize: Auto.WHT(28), 
        lineHeight: Auto.WHT(40), 
        paddingLeft: Auto.WHT(20),
    },
    footbtn: {
        width: Auto.WHT(230), 
        height: Auto.WHT(100), 
        lineHeight: Auto.WHT(100), 
        background: '#108EE9', 
        border: 'none', 
        textDecoration: 'none', 
        borderRadius: 0, 
        fontSize: Auto.WHT(36), 
        color: '#FFFFFF',
      },
}