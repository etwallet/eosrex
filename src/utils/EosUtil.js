import '../shim.js'
import eos from 'eosjs'
var ecc = require('eosjs-ecc');

const RPC_API_URL = "http://47.52.250.41:8001";

export class Eos {
    static respSucc(e){
        return {isSuccess:!0,msg:"success",data:e};
    }
    
    static respErr(e){
        return {isSuccess:!1,msg:"error",data:e};
    }
    
    static getEos(){
        config = {
          httpEndpoint: RPC_API_URL,
          chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        }
      
        var eoss = eos(config);
        return eoss;
      }
      
      
    static getInfo(){
        let eos = Eos.getEos();
        return eos.getInfo({}).then(info => {
            return info;
        });
    }

    static checkPrivateKey(privatekey,callback){
        try{
            if(ecc.isValidPrivate(privatekey)){
                callback(Eos.respSucc(!0));
            }else{
                callback(Eos.respErr({code:500,msg:"私钥格式错误"}));
            }
        }catch(t){
            callback(Eos.respErr({code:500,msg:"校验私钥失败"}));
        }
    }

    static privateToPublic(privateKey,callback){
        try{
            var publicKey=ecc.privateToPublic(privateKey);
            callback(Eos.respSucc({publicKey:publicKey}));
        }catch(t){
            callback(Eos.respErr({code:500,msg:"生成公钥失败"}));
        }
    }

    /**
    * 生成随机私钥
    * @param {回调函数} callback 
    */
    static randomPrivateKey(callback){
        try{
            ecc.randomKey().then(privateKey => {
                alert('Private Key:\t', privateKey) // wif
                alert('Public Key:\t', ecc.privateToPublic(privateKey)) // EOSkey...
            })
            // ecc.randomKey().then(t =>{
            //     alert(t)
            //     if(t){
            //         var e=t;
            //         var r=ecc.privateToPublic(e);
            //         callback(Eos.respSucc({ownerPrivate:e,ownerPublic:r}));
            //     }else{
            //         callback(Eos.respErr({code:500,msg:"生成私钥失败"}));
            //     } 
            // }).catch(function(t){
            //     alert("222");
            //     callback(Eos.respErr({code:500,msg:"生成私钥失败"}));
            // })
        }catch(t){
            callback(Eos.respErr({code:500,msg:"生成私钥失败"}));
        } 
    }
}

