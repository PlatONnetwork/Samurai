require('../../static/script/lightwallet.min')
var keythereum = require("keythereum");
let ATPPath = "m/44'/266'/0'/0"
const EthUtil = require('ethereumjs-util');

//特别注意，在imtoken1.0 版本的的导出路径为 "m/44'/266'/0'/0/0" 私钥才能匹配上

let specifyPath = ATPPath

// let mnemonic = "normal dune pole key case cradle unfold require tornado mercy hospital buyer"

const importByMnemonic =function(account,keyWord,password, cb){
    let ks = lightwallet.keystore;
    if(!ks.isSeedValid(keyWord)){
        cb(1,null);
        return;
    }
    ks.createVault({
        password: password,
        seedPhrase: keyWord,
        hdPathString: specifyPath
    }, function (err, ks) {
        if (err) {
            console.log("!!!err:"+err);
        }else{
            console.log("ks is:\n"+JSON.stringify(ks));
        }
        ks.keyFromPassword(password, function (err, pwDerivedKey) {
            if (err) console.log("!!!err:"+err);
            ks.generateNewAddress(pwDerivedKey, 1);
            var addr = ks.getAddresses();
            var privateKey = ks.exportPrivateKey(addr[0], pwDerivedKey);
            console.log("Address:" + addr[0]);
            console.log("PrivateKey:" + privateKey);
            exportPrivitekeyToJson(privateKey,account,password,(data) => {
                if(data){
                    cb(0,data)
                }else{
                    cb(1,null)
                }

            });

        });
    });
}

function exportPrivitekeyToJson(privateKey,account,password,cb){
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

    // var params = {
    //     keyBytes: 32,
    //     ivBytes: 16
    // };
    // var options = {
    //     kdf: "scrypt",
    //     cipher: "aes-128-ctr",
    //     kdfparams: {
    //         n: 1 << 4,
    //         dklen: 32,
    //         p: 1,
    //         r: 8,
    //         prf: "hmac-sha256"
    //     }
    // };
    var dk = keythereum.create(params);
    dk.privateKey = privateKey
    keythereum.dump(
        password,
        dk.privateKey,
        dk.salt,
        dk.iv,
        options,
        function(keyObject) {
            keyObject.account = account;
            keyObject.address = "0x" + keyObject.address;
            console.log("valut: " + keyObject);
            keyObject.publicKey = EthUtil.privateToPublic(new Buffer(privateKey, 'hex')).toString('hex');
            cb(keyObject);
        });
}
export default importByMnemonic
