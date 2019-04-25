var keythereum = require("keythereum");
var createKeccakHash = require("keccak/js");
var secp256k1 = require("secp256k1/elliptic");
import store from '@/vuex/store'
const EthUtil = require('ethereumjs-util');

var params = {
    keyBytes: 32,
    ivBytes: 16
};

var options = {
    kdf: "pbkdf2",
    cipher: "aes-128-ctr",
    kdfparams: {
        c: 1,
        dklen: 32,
        prf: "hmac-sha256"
    }
};

function isFunction(f) {
    return typeof f === "function";
}
function keccak256(buffer) {
    return createKeccakHash("keccak256").update(buffer).digest();
}

function myBrowser(){
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera) {
        return "Opera"
    }; //判断是否Opera浏览器
    if (userAgent.indexOf("Firefox") > -1) {
        return "FF";
    } //判断是否Firefox浏览器
    if (userAgent.indexOf("Chrome") > -1){
        return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1) {
        return "Safari";
    } //判断是否Safari浏览器
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
        return "IE";
    }; //判断是否IE浏览器
}
const keyManager = {
    //创建文件证书
    createKey(account, password,mobile,email, cb) {
        var options = this.getOption();
        var err = 0,_this = this;
        if (isFunction(cb)) {
            this.createDk(function (_err, dk) {
                err = _err;
                if (!err) {
                    console.log("privateKey",dk);
                    keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options, function (keyObject) {
                        if (keyObject) {
                            keyObject.account = account;
                            keyObject.address = '0x' + keyObject.address;
                            keyObject.mobile = mobile;
                            keyObject.email = email;
                            _this.getPublicKey(dk.privateKey,(e,pub)=>{
                                if(e){
                                    cb(1, keyObject);
                                }else{
                                    keyObject.publicKey = pub;
                                    cb(0, keyObject);
                                }
                            });
                        } else {
                            err = 2;
                            cb(err, keyObject);
                        }

                    })
                } else {
                    cb(err, keyObject);
                }
            })
        } else {
            var dk = this.createDk();
            var keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);
            keyObject.account = account;
            keyObject.address = '0x' + keyObject.address;
            keyObject.mobile = mobile;
            keyObject.email = email;
            return keyObject;
        }
    },
    //根据已知私钥导入钱包
    importWalletByPriKey(account, priKey, password, cb){
        var _this = this
        if(priKey){
            var err = 0;
            if (isFunction(cb)) {
                this.createDk(function (_err, dk) {
                    err = _err;
                    if (!err) {
                        let priKeyInvalid=true;
                        keythereum.dump(password, priKey, dk.salt, dk.iv, options, function (keyObject) {
                            if (keyObject) {
                                priKeyInvalid = false;
                                keyObject.account = account;
                                keyObject.address = '0x' + keyObject.address;
                                keyObject.publicKey = EthUtil.privateToPublic(new Buffer(priKey, 'hex')).toString('hex');
                            } else {
                                err = 2;
                            }
                            cb(err, keyObject);
                        });
                        setTimeout(()=>{
                            if(priKeyInvalid){
                                cb(3, null);
                            }
                        },3000)
                    } else {
                        cb(err, keyObject);
                    }
                })
            } else {
                var dk = this.createDk();
                var keyObject = keythereum.dump(password, priKey, dk.salt, dk.iv, options);
                keyObject.account = account;
                keyObject.address = '0x' + keyObject.address;
                keyObject.mobile = mobile;
                keyObject.email = email;
                return keyObject;
            }
        }
    },
    //备份到本地
    backUpKey(address,keystore){
        var content;
        if(!this.checkAvailable(address) && !keystore){
            alert('无可用钱包，请先创建或导入钱包文件');
            return;
        }else{
            if(keystore){
                content = JSON.stringify(keystore);
            }else{
                content = JSON.stringify(this.checkAvailable(address));
            }
        }
        if (content) {
            try{
                let parseObj = JSON.parse(content);
                /*if(parseObj.account){
                    delete parseObj.account
                }*/
                content = JSON.stringify(parseObj)
            }catch(e){
                throw e;
            }
            if(myBrowser()=="IE"){
                var OW = window.open('', "_blank", "");
                var DD = new Date();
                OW.document.open();
                OW.document.write(content);
                var name = keystore.address + ".txt";
                OW.document.execCommand("saveAs", false, "C:/Users/15236/Downloads/"+name);//执行保存，IE6,IE7,IE8有效
                OW.close();
            }else{
                var bb = new Blob([content],{type : 'application/json'});
                var jsonURL=window.URL.createObjectURL(bb);
                var a = document.createElement('a');
                a.setAttribute('download', keystore.address+'.json');
                a.id='key-save';
                a.target="_blank";
                a.href = jsonURL;
                a.innerHTML = 'testing';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                setTimeout(function(){
                    document.body.removeChild(a);
                },500)
            }
        } else {
            alert('请先生成或导入钱包文件')
        }
    },
    //检测是否有可用的钱包
    checkAvailable(address){
        var walletList = store.state.wallet.walletList;
        let arr = walletList.filter((item)=>{
            return item.address == address;
        });
        if(arr.length>0){
            return arr[0];
        }else{
            return false;
        }
    },
    getCookie:function(c_name){
        if (document.cookie.length>0) {
            var c_start=document.cookie.indexOf(c_name + "=")
            if (c_start!=-1) {
                c_start=c_start + c_name.length+1
                var c_end=document.cookie.indexOf(";",c_start)
                if (c_end==-1) c_end=document.cookie.length
                return unescape(document.cookie.substring(c_start,c_end))
            }
        }
        return ""
    },
    //校验导入钱包文件的密码与用户身份
    verifypsw(content,password,cb){
        var _this = this;
        if(!content){
            cb(-1,null);
            return;
        }
        if(typeof(content)=='string'){
            content = JSON.parse(content);
        };
        if(content.address){
            this.interFn(content,password,function(err,privateKey){
                if(err==0){
                    var userObj = {
                        account:content.account,
                        privateKey:privateKey,
                        address:content.address,
                        mobile:content.mobile,
                        email:content.email,
                        publicKey:EthUtil.privateToPublic(new Buffer(privateKey, 'hex')).toString('hex')
                    };
                    cb(err,userObj);
                }else{
                    cb(err,null)
                }
            });
        }else{
            cb(-2,null);
        }
    },
    //导入keyObject
    importKey(content,password,cb){
        if(typeof(content)=='string'){
            content = JSON.parse(content);
        };
        var _this = this;
        this.verifypsw(content,password,function(err,userObj){
            if(err==0){
                content.publicKey = userObj.publicKey;
                cb(err,content);
            }else{
                cb(err,null);
            }
        });
    },
    //密码解私钥
    interFn(keyObject,password,cb){
        var keyObjectCrypto, iv, salt, ciphertext, algo;
        var self = keythereum;
        var privateKey = '';
        keyObjectCrypto = keyObject.Crypto || keyObject.crypto;
        function verifyAndDecrypt(derivedKey, salt, iv, ciphertext, algo) {
            var key;
            if (self.getMAC(derivedKey, ciphertext) !== keyObjectCrypto.mac) {
                return null;
            }
            if (keyObject.version === "1") {
                key = keccak256(derivedKey.slice(0, 16)).slice(0, 16);
            } else {
                key = derivedKey.slice(0, 16);
            }
            return self.decrypt(ciphertext, key, iv, algo);
        }

        iv = self.str2buf(keyObjectCrypto.cipherparams.iv);
        salt = self.str2buf(keyObjectCrypto.kdfparams.salt);
        ciphertext = self.str2buf(keyObjectCrypto.ciphertext);
        algo = keyObjectCrypto.cipher;

        if (keyObjectCrypto.kdf === "pbkdf2" && keyObjectCrypto.kdfparams.prf !== "hmac-sha256") {
            if (!isFunction(cb)) {
                return null;
            } else {
                cb(2, null);
            }
        }
        self.deriveKey(password, salt, keyObjectCrypto, function (derivedKey) {
            var err = 0;
            privateKey = verifyAndDecrypt(derivedKey, salt, iv, ciphertext, algo);
            if (!privateKey) {
                err = 1;
            } else {
                privateKey = privateKey.toString('hex');
            }
            cb(err, privateKey);
        });

    },

    /**
     *  获取私钥 privateKey  入参无钱包文件
     * @param account  钱包地址
     * @param password  口令
     * @param type  格式：hex十六进制  buf:buffer
     * @param cb   回调
     * @returns {*}
     */
    recover(account,password,type,cb) {
        let walletList = store.state.wallet.walletList;
        if(!walletList || walletList.length==0)  return;
        let arr = walletList.filter((item)=>{
            return item.address==account;
        });
        let keyObject = arr.length>0?arr[0]:null;
        if(keyObject){
            this._insetRecover(keyObject,password,type,cb);
        }
    },
    /**
     * 获取私钥 入参有钱包文件
     */
    recover2(keyObject,password,type,cb){
        // console.warn('recover2--->',keyObject);
        try{
            this._insetRecover(keyObject,password,type,cb)
        }catch(e){
            cb(-100)
        }
    },
    _insetRecover(keyObject,password,type,cb){
        var keyObjectCrypto, iv, salt, ciphertext, algo;
        var self = keythereum;
        var privateKey = '';
        keyObjectCrypto = keyObject.Crypto || keyObject.crypto;
        function verifyAndDecrypt(derivedKey, salt, iv, ciphertext, algo) {
            var key;
            if (self.getMAC(derivedKey, ciphertext) !== keyObjectCrypto.mac) {
                return null;
            }
            if (keyObject.version === "1") {
                key = keccak256(derivedKey.slice(0, 16)).slice(0, 16);
            } else {
                key = derivedKey.slice(0, 16);
            }
            return self.decrypt(ciphertext, key, iv, algo);
        }
        iv = self.str2buf(keyObjectCrypto.cipherparams.iv);
        salt = self.str2buf(keyObjectCrypto.kdfparams.salt);
        ciphertext = self.str2buf(keyObjectCrypto.ciphertext);
        algo = keyObjectCrypto.cipher;

        if (keyObjectCrypto.kdf === "pbkdf2" && keyObjectCrypto.kdfparams.prf !== "hmac-sha256") {
            if (!isFunction(cb)) {
                return null;
            } else {
                cb(2, null);
            }
        }

        if (!isFunction(cb)) {
            privateKey = verifyAndDecrypt(self.deriveKey(password, salt, keyObjectCrypto), salt, iv, ciphertext, algo);
            if (privateKey) {
                privateKey = privateKey.toString('hex');
            }
            return privateKey;
        } else {
            self.deriveKey(password, salt, keyObjectCrypto, function (derivedKey) {
                var err = 0;
                privateKey = verifyAndDecrypt(derivedKey, salt, iv, ciphertext, algo);
                if (!privateKey) {
                    err = 1;
                } else {
                    if(type=='hex'){
                        privateKey = privateKey.toString('hex');
                    }
                }
                cb(err, privateKey);
            });
        }
    },
    // 根据私钥获取公钥
    getPublicKey(privateKey, cb) {
        // function ab2str(buf) {
        //     return String.fromCharCode.apply(null, new Uint16Array(buf));
        // }
        //
        // function str2ab(str) {
        //     var buf = new ArrayBuffer(str.length * 2);
        //     var bufView = new Uint16Array(buf);
        //     for (var i = 0, strLen = str.length; i < strLen; i++) {
        //         bufView[i] = str.charCodeAt(i);
        //     }
        //     return bufView;
        // }

        var err = 0;
        var publicKey = null;
        try {
            publicKey = secp256k1.publicKeyCreate(new Buffer(privateKey), false).slice(1);
        } catch (e) {
            console.warn(e);
            err = 1;
        }
        if (publicKey) {
            publicKey = publicKey.toString('hex');
        }
        if (isFunction(cb)) {
            cb(err, publicKey);
        } else {
            return publicKey;
        }
    },
    //重置密码
    resetPassword(account,address,oldPassword, newPassword, cb) {
        var _this = this,err=0,keyObject;
        if(!this.checkAvailable(address)){
            if(!isFunction(cb)){
                return null
            }else{
                cb(-100,null);
                return;
            }
        }else{
            keyObject = this.checkAvailable(address);
        }
        function deepClone(o){
            return JSON.parse(JSON.stringify(o));
        }
        var self = this;
        if(typeof(keyObject)=='string'){
            keyObject = JSON.parse(keyObject);
        }
        if (isFunction(cb)) {
            self.recover(address,oldPassword,'buf', function (err_gp, privateKey) {
                if (privateKey) {
                    self.createDk(function (err_dk, dk) {
                        if (dk) {
                            if (!err_dk) {
                                keythereum.dump(newPassword, privateKey, dk.salt, dk.iv, options, function (newKeyObject) {
                                    if (newKeyObject) {
                                        var newKey = deepClone(newKeyObject);
                                        newKey.publicKey = EthUtil.privateToPublic(new Buffer(privateKey, 'hex')).toString('hex');
                                        newKey.account = keyObject.account;
                                        newKey.address = keyObject.address;
                                        newKey.crypto = newKeyObject.crypto;
                                    } else {
                                        err = 2;
                                    }
                                    cb(err, newKey);
                                })
                            } else {
                                cb(err_dk, newKey);
                            }
                        } else {
                            cb(err_dk, null);
                        }
                    })
                } else {
                    cb(err_gp, null);
                }
            });
        } else {
            var newKey = null;
            var privateKey = this.recover(address,oldPassword,'buf');
            if (privateKey) {
                var dk = this.createDk();
                keythereum.dump(newPassword, privateKey, dk.salt, dk.iv, options, function (newKeyObject) {
                    if (keyObject) {
                        var newKey = deepClone(keyObject);
                        newKey.publicKey = EthUtil.privateToPublic(new Buffer(privateKey, 'hex')).toString('hex');
                        newKey.account = keyObject.account;
                        newKey.address = keyObject.address;
                        newKey.crypto = newKeyObject.crypto;
                    } else {
                        err = 2;
                    }
                    cb(err, newKey);
                })
            }
            return newKey;
        }
    },
    //获取地址
    getAddress(account,cb){
        if(!this.checkAvailable(account)){
            if(!isFunction(cb)){
                return null;
            }else{
                cb(-100,null);
                return;
            }
        };
        var keyObject = JSON.parse(window.localStorage.getItem("keyObject-"+account));
        if(keyObject.address){
            if(!isFunction(cb)){
                return keyObject.address;
            }else{
                cb(0,keyObject.address);
            }
        }
    },
    //校验身份
    // 1，修改密码的场景  keyManager.verifyIdentity(account,psw,cb)调用
    verifyIdentity(account,psw,cb){
        var privateKey = this.recover(account,psw);
        if(privateKey){
           if(!isFunction(cb)){
               return true;
           }else{
               cb(0,privateKey);
           }
        }else{
            if(!isFunction(cb)){
                return false;
            }else{
                cb(-100,null);
            }
        }
    },
    getOption() {
        return options;
    },
    getParams() {
        return params;
    },
    createDk(cb) {
        var err = 0;
        if (isFunction(cb)) {
            keythereum.create(this.getParams(), function (dk) {
                if (!dk) {
                    err = 1;
                }
                cb(err, dk);
            })
        } else {
            var dk = keythereum.create(this.getParams());
            return dk;
        }
    }
}

export default keyManager;

