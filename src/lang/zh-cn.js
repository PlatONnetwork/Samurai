export default {
    sideBar:{
        main:'主菜单',
        wallet:'钱包',
        trade:'交易',
        tradeInfor:'交易详情',
        contract:'合约',
        more:'更多',
        setting:'设置',
        help:'帮助',
        application:'应用',
        validatorNode:'共识节点',
        enter: '进 入 ',
        send:'发送'
    },
    wallet:{
        ServiceChargeMsg:'手续费由执行钱包支付',
        executorFrom:'执行钱包',
        wallet:'钱包',
        walletTitle:'钱包',
        individual:"普通钱包",
        shared:'联名钱包',
        totalBalance:'总余额',
        balance:'余额',
        add:'新增普通钱包',
        createWallet:'创建钱包',
        importW:'导入钱包',
        send:'发送',
        accept:'接收',
        copyAddress:'复制地址',
        more:'更多',
        exportKeystore:'导出keystore',
        viewPrivate:'查看私钥',
        modifyPsw:'修改密码',
        deleteWallet:'删除钱包',
        modify:'验证',
        importTxt:'您正在进行钱包Keystore导出',
        viewPrivateTxt:'您正在进行钱包私钥查看操作',
        modifyPswTxt:'您正在进行钱包密码修改操作',
        deleteTxt:'您正在进行钱包删除操作',
        walletAddress:'钱包地址',
        walletAddress0x:"请输入钱包地址0x0000000...",  // add
        enterPsw:'请输入钱包密码',
        walletpubKey:'钱包公钥',  // add
        walletPrivate:'钱包私钥',
        enterOldPsw:'请输入原钱包密码',
        enterNewPsw:'设置钱包密码（不少于6位字符)',
        enterNewPswHint: '密码至少6位字符',
        rePsw:'重复密码',
        repeatPsw:'重复钱包密码',
        warning:'警告',
        warningTxt:'您正处于PlatON测试网络,切勿将真实的资产转账到当前测试网络钱包地址',
        warningContTxt:'您正处于PlatON测试网络,切勿将真实的资产转账到当前测试网络合约地址',
        copySuccess:'已复制到剪贴板',
        copyFail:'复制失败',
        cannotTrans:'钱包余额不足，无法发起转账！',
        cannotTrans2:'钱包余额不足！',
        deleteSuccess:'删除钱包成功',
        pswError:'密码错误',
        modifyPswSuccess:'修改密码成功',
        oldPswError:'原密码错误!',
        // author hufu 2018-11-12
        individualWalletName:'设置普通钱包名称',
        pleaseRememberPassword:'请务必牢记钱包密码，服务器不会存储您的密码，遗忘丢失将无法找回！',
        createIndividualWallet:'创建普通钱包',
        createSharedWallet:'创建联名钱包',
        AddSharedWallet:'添加联名钱包',
        importIndividualWallet:'导入普通钱包',
        IndividualWalletSuccess:'普通钱包创建成功',
        name:'名称',
        address:'地址',
        pubKey:'公钥',
        signature:'签名算法',
        prikey:'私钥',
        tipSaveJson:'请备份好以上数据并保存好.json文件',
        downloadJson:'备份钱包',
        finish:'完成',
        hex: '私钥(64 HEX格式)',
        keystore:'钱包文件',
        keystoreJson:'钱包文件(.json)',
        mnemonicPhrase: '助记词',
        mnemonic:'助记词',
        walletName:'钱包名称',
        inputPKHint:'请输入64位HEX格式的私钥',
        import:'导入',
        browse:'选择文件',
        unselectedFile:'未选择文件',
        decryptKeystore:'解密Keystore文件的钱包密码',
        inputPhraseHint:'请输入钱包助记词,用空格分隔助记词',
        QRCode:'钱包二维码地址',
        // 错误提示
        walletNameRequired:'钱包名称不能为空',
        walletPswRequired:'密码不能为空',
        PKRequired:'私钥不能为空',
        NodePKRequired:'节点私钥不能为空',
        NodePKillegal:'非法节点私钥字符',
        NodeIPRequired:'节点IP不能为空',
        NodeIPillegal:'非法节点IP字符',
        NodePortRequired:'节点端口不能为空',
        NodePortillegal:'非法节点端口字符',
        PKlength:'私钥必须满足64位',
        PhraseRequired:'助记词不能为空',
        fileRequired:'文件不能为空',
        netNameEmpty:'网络名称不能为空',
        netNameRepeat:'网络名称不能重复',
        netNameIllegal:'非法网络名称',
        blockSpacingEmpty:'出块间隔不能为空',
        blockSpacingIllegal:'非法出块间隔',
        repeatPswP:'请重复钱包密码',
        pswNoMatch:'两次输入密码不一致',
        initFailed:'初始化或节点启动失败！',
        paramsEmpty:'参数不能为空',
        notUploadAgain:'请勿重复上传',
        wasmFormat:'上传文件只能是 wasm 格式!',
        estimateFailed:'估算gas值失败',
        selectHint:'请选择',
        defaultNoData: '无数据',
        walletNameExists:'钱包名称已存在',
        //发送
        sendFunds:'发送资产',
        from:'发送方',
        to:'接收方',
        amountSend:'发送数量',
        amountHint:'请输入发送数量',
        wantTo:'您将发送',
        selectFee:'选择手续费',
        cheaper:'更便宜',
        faster:'更快捷',
        estimatedTime:'预计交易确认时间',
        advance:'更多功能',
        advanceHint:'您可以添加额外数据以与事务一起发送。如果您不知道这是什么，请不要触摸它，否则可能会发生不好的事情。',
        total:'总计',
        sendTransaction:'发送交易',
        amount:'数量',
        fee:'手续费',
        input:'请输入 【',
        walletPsw:'】钱包密码',
        allWallet:'所有钱包',
        createShareWallet:'新增联名钱包',
        addShareWallet:'添加钱包',
        tip1:'所有普通钱包余额为0，无法创建联名钱包！',
        tip2:'请先创建普通钱包，并转入相应资产',
        incorrectAddress:'接收地址不正确',
        insufficientBalance:'钱包余额不足！',
        incorrectValue:'发送数量输入格式有误，请重新输入',
        transactionFailed:'交易发送失败',
        invalidSignatures:'个人签名不可用或钱包不存在',
        invalidPrivatekey:'导入失败！私钥无法解析',
        invalidWord:'导入失败！助记词无法解析',
        invalidFile:'导入失败！文件无法解析',
        alreadyExits:'普通钱包已存在',
        importSuccess:'普通钱包导入成功',
        importFail:'普通钱包导入失败',
        viewAbi:'查看接口',
        sharedOwners:'联名用户',
        walletOwner:'关联普通钱包',
        interfaceCode:'接口文件',
        sharedWalletName:'设置联名钱包名称',
        enterSharedAddr:'请输入联名钱包地址',
        addShare:'添加',
        nonSharedName:'联名钱包名称不能为空',
        nonSharedAddr:'联名钱包地址不能为空',
        inVaildSharedAddr:'钱包地址不正确',
        addShareFail:'添加失败！地址不存在',
        addShareOwnerFail:'添加失败！Owner数量为0',
        shareAlreadyExits:'联名钱包已存在',
        addShareSuccess:'联名钱包添加成功',
        requiredNum:'所需签名数',
        deployContract:'创建合约',
        newShareTip1:'用户名及联名用户钱包地址不能为空',
        newShareTip2:'用户名不能为空',
        newShareTip3:'联名用户钱包地址不能为空',
        addrExits:'钱包地址已存在',
        createShareSuccess:'联名钱包创建成功',
        createShareFail:'联名钱包创建失败',
        sendToSelf:'无法发送给自己',
        isShareAddress:'不支持联名钱包地址',
        copy:'复制',
        ownerAccount:'用户名',
        ownerAddress: '输入普通钱包地址',
        walletName:'钱包名称',
        password:'钱包密码',
        rePassword: '确认密码',
        refresh: '刷新',
        record: '交易记录',
        individualText: '普通钱包由个人控制和管理的数字钱包，同时用来可以控制联名钱包及合约的执行操作',
        sharedText: '联名钱包是由多个用户所共同控制和管理的数字钱包(合约)，联名钱包的转出，需要满足既定数量联名用户的确认签名后才能转出。当普通钱包有超过1Energon时，你就可以创建联名钱包',
        walletBackUpInfo: '重新修改钱包密码后，请务必重新备份钱包文件（.json）',
        walletDeleteInfo: '删除前请务必备份好钱包文件，否则一旦删除将无法恢复',
        networkTimeout: '网络连接超时',
        networkConnection :"网络连接已建立"
    },
    nodeSync:{
        syncStatus:'同步状态',
        Peers:'连接节点数',
        Blocks:'区块数',
        compolete:'同步完成',
        syncing:'同步中'
    },
    trade:{
        executionReject:"执行联名钱包-拒绝",
        executionConfirm:"执行联名钱包-确认",
        record:'交易记录',
        pendingTrade:'待确认交易',
        noRecord:'当前地址暂无任何交易记录',
        noListRecord:'暂无任何交易记录',
        noSignRecord:'当前暂无需要签名的交易',
        loadMore:'加载更多...',
        // author hufu 2018-11-13
        sent:'发送',
        sending:'发送',
        contractCreation:'合约创建',
        contractCreation2:'创建合约',
        contractExecution:'合约执行',
        mpc:'MPC交易',
        finished:'已完成',
        toBeSigned:'待签名',
        failed:'交易失败',
        pending:'确认中',
        confirm:'确认',
        reject:'拒绝',
        transactionInfo:'交易信息',
        type:'交易类型',
        tradeTime:'交易时间',
        tradeHash:'交易hash',
        tradeStatus:'状态',
        sum:'金额',
        from:'从',
        to:'到',
        fee:'手续费',
        gas:'消耗的能量',
        energon	:'能量价格',
        block:'区块',
        TXD:'发出数据',
        allTypes:'全部类型',
        others:'其他',
        noData:'暂无数据',
        selOwner:'选择联名用户',
        jointWalletExecution:'执行联名钱包',
        createValidator:'注册共识节点',
        increaseStake:'增加质押',
        reduceStake:'减持质押',
        redeemStake:'提取质押',
        revokePending:'注销操作处理中',
        transactionSent: '交易已发送!',
        signTrade:'待签名交易',
        confirmTransaction:'确认',
        revokeConfirmation:'拒绝',
    },
    settings:{
        network:'网络',
        mainNet:'PlatON 主网络',
        testNet:'Amigo测试网',
        bataNet:'Batalla测试网',
        innerNet:'Test测试网',
        innerdevNet:'Innerdev测试网',
        priNet:'PlatON 私有网络',
        networkConfig:'网络设置',
        joiningNet:'加入网络',
        joiningNet1:'加入Amigo测试网',
        joiningNet2:'加入Batalla测试网',
        joiningNet3:'加入Test测试网',
        joiningNet4:'加入Dev测试网',
        netSet:'网络成功设置为 ',
        networkSet:' 网络',
        stratNet:'启动私有网络',
        failure:'失败',
        fail:'失败',
        mainTitle:'PlatON主网络',
        mainContent:'普通用户选择加入。这是PlatON的正式网络，包含真实的资产及交易信息。',
        testTitle:'PlatON测试网络',
        testContent:'开发者选择加入。这是PlatON的测试网络，用于PlatON的相关测试',
        priTitle:'PlatON私用网络',
        priContent:'创建一个本地的私有网络，供开发者用户学习，及测试功能。',
        comingSoon:'(敬请期待)',
        createPrivateNet:'创建私有网络',
        lang:'语言',
        en:'英文',
        zh:'中文',
        filePath:'钱包保存路径',
        path:'当前路径',
        change:'修改',
        about:'关于平台',
        system:'版本',
        check:'检查更新',
        applyTest:'PlatON测试网络，申请测试币',
        apply:'申请',
        community:'社区',
        customNet:{
            createNet:'创建PlatON私有网络',
            block:'配置创世区块',
            netName:'网络名称',
            netNameHint:'输入私链网络名称（仅支持字母数字）',
            consensus:'共识算法',
            interval:'出块间隔',
            cancel:'取 消',
            create:'创建创世区块',
            creating:'创建中',
            createWallet:'创建Coinbase钱包',
            walletName:'钱包名称',
            password:'钱包密码',
            rePassword:'确认密码',
            createAndWrite:'创建钱包并写入区块',
            address:'地址',
            tip:'请注意备份钱包文件',
            tip2:'.json，丢失无法找回',
            download:'备份钱包文件',
            backUpKey:'备份Coinbase钱包',
            nodeaddress:'配置节点信息',
            node:'节点',
            priK:'私钥',
            pubK:'公钥',
            IP:'IP',
            port:'端口',
            addNode:'新增节点',
            startNode:'初始及启动节点',
            successfully:'创建成功',
            folder:'数据目录',
            forOther:'为方便其他节点加入私有链，请导出静态节点文件',
            export:'导出',
            // 加入PlatON私有网络
            addNet:'加入PlatON私有网络',
            importFiles:'导入静态节点文件',
            importFilesHint:'导入已创建的私有链静态节点文件(static_nodes.json)',
            next:'下一步',
            filesReq:'未导入静态节点文件',
            cannotResolved:'节点信息无法解析',
            nodeAddress:'配置节点地址',
            nodePK:'节点私钥：',
            nodeIP:'节点IP：',
            nodePort:'节点Port：',
            addNode:'加入并启动节点',
            generate:'自动生成',
            getIp:'自动获取',
            blockSubTitle:'设置私有链名称及运行机制',
            coinBaseSubTitle:'Coinbase钱包是矿工的钱包地址，用于接收出块奖励，私有网络默认预置100000 Energon到coinbase钱包',
            nodeSubTitle:' 设置私有网络运行节点，配置有效的节点IP、端口，节点私钥'
        },
        note: '更新提示',
        noUpdate: '当前已是最新版本',
        hasUpdate: 'Samurai有新版本发布，是否立即更新?',
        updater:'下载更新'
    },
    form:{
        nonPsw:'密码不能为空',
        create:'创建',
        cancel:'取消',
        submit: '提交', // add
        submiting:'提交', // add
        sure:'确定',
        nonOldPsw:'原密码不能为空',
        less6:'密码至少6个字符',
        nonRepPsw:'重复密码不能为空',
        disMatch:'两次密码不一致',
        wrongPsw:'密码不正确',
        next:'下一步',
        back:'上一步',
        loading: '加载中...',
        comfirm:'确定',
        warn:'提示'
    },
    contracts:{
        noContract:'暂无合约数据',
        contracts:'合约',
        contractsInfor:'合约详情',
        addCont:'新增合约',
        deployCont:'部署合约',
        watchCont:'添加合约',
        addWatchCont:'添加观察合约',
        from:'执行方',
        fromHint:' ',
        amount:'发送数量',
        amountHint:'请输入发送数量',
        wantSend:'您将发送',
        contByte:'合约字节码',
        contByteEmpty:'合约字节码不能为空',
        contNameEmpty:'合约名称不能为空',
        contNameRepeat:'合约名称已存在',
        import:'导入',
        drag:'拖拽字节码文件',
        contABI:'合约ABI(接口)',
        contABIEmpty:'合约ABI不能为空',
        contABIHint:'输入合约接口ABI',
        contABIinvalid:'无效合约ABI',
        selectFee:'选择手续费',
        within:'小于 ',
        second:'秒',
        withinmins:'分钟',
        within30s:'小于30s',
        within5mins:'小于5分钟',
        within15mins:'小于15分钟',
        total:'总计',
        deploy:'部署',
        deploying:'部署',
        contractInfo:'合约信息',
        copy:'复制地址',
        copyContract:'复制',
        interface:'合约接口',
        contractInterface:'合约接口',
        executeCont:'执行合约',
        executeContCap:'执行合约',
        selectFunc:'选择功能函数',
        executeFrom:'执行钱包',
        execute:'执行',
        walletEmpty:'请先创建普通钱包，并转入相应资产',
        balanceEmpty:'所有普通钱包余额为0，无法创建合约！',
        inputFormat:'发送数量输入格式有误，请重新输入',
        deployFail:'部署合约失败',
        file:'文件',
        executeType:'交易类型',
        ordTx:'普通交易',
        mpcTx:'MPC计算交易(限MPC隐私合约)',
        createCont:{
            creatCont:'创建合约',
            amount:'数量',
            fee:'手续费',
            advanceOpt:'更多功能',
            inputHint:'请输入',
            cancel:'取消',
            submit:'提交',
            from:'执行钱包',
        },
        watchContract:{
            contName:'合约名称',
            nameHint:'请输入合约名称',
            contAddress:'合约地址',
            contAddressEmp:'合约地址不能为空',
            contAddressExist:'合约列表已存在',
            contAddressInvalid:'添加失败！合约地址不存在',
            contAddressError:'合约地址不正确',
            addressHint:'请输入合约地址0x00',
            contABI:'合约接口',
            contABIHint:'请输入合约接口ABI',
            contABIEmp:'合约接口不能为空',
            contABIInvalid:'合约接口无法解析',
            cancel:'取 消',
            add:'添 加',
            addSuccess:'合约添加成功 '
        },
        function:'功能'
    },
    application:{
        nodeName:'节点',
        payWallet:'选择支付钱包',
        stakeAmount:'质押保证金',
        stakeNumber:'请输入质押的数量0.00',
        stakeAmountNull:'质押数量不能为空',
        maximumAmount:'当前最高质押 :',
        minimumAmount:'当前最低质押 :',
        totalAmount:'合计质押 :',
        expectedRanking:'预计质押排名 :',
        agree:'我已知悉并同意节点',
        rule:'验证人竞选规则',
        rule2:'竞选规则',
        pay:'支付',
        increaseFail:'发送交易失败',
        noResult:'您还没有注册共识节点',
        apply:'共识节点注册',
        understand:'了解节点验证人',
        applyTime:'加入时间',
        status1:'竞选已退出',
        status2:'已淘汰',
        status3:'验证节点',
        status4:'候选节点',
        status5:'提名节点',
        staked:'质押金',
        fee:'投票激励',
        ranking:'质押排名',
        unboundStake:'已解除质押金',
        redeem:'提取',
        increase:'增加质押',
        reduce:'减持质押',
        pending:'处理中',
        revoke:'注销共识节点',
        basicInfo:'基本信息',
        nodeInfo:'节点信息',
        nodeUrl:'节点地址',
        nodePublicKey:'节点公钥',
        nodePublicKeyID:'节点ID', //公钥改id只适用于节点竞选和投票
        nodeWallet:'节点钱包',
        nodeIntro:'节点简介',
        profitPlan:'激励计划',
        ratio:'投票激励',
        institutionalInfo:'机构信息',
        orgName:'机构名称',
        orgNet:'机构官网',
        prompt:'提示',
        promptTxt:'确定提取已解除的质押金吗？提交后，质押金将退回到您的节点钱包内。',
        walletAddress:'钱包地址',
        warn:'警告',
        warnText:'确定注销共识节点吗？注销后，质押保证金预计将在1天完成解除！',
        noWallet:'请先创建钱包',
        noBalance:'钱包余额不足，无法发起申请',
        account:'账户名称',
        accountRule:'设置账户名称(6-30位数字字母空格下划线组成,首位需字母开头)',
        logo:'logo图标',
        logoRule:'(图片大小不能高于1M,，支持png\jpeg\jpg)',
        selFile:'选择文件',
        logoNull:'需要上传logo图标',
        nodeUrl2:'节点地址(IP端口)',
        nodeIntroTxt:'简要介绍节点部署信息、服务器配置信息及未来节点规划',
        nodeWallet2:'节点钱包',
        nodeWallet2Txt:' (用于接收出块收益及赎回质押金的钱包地址)',
        ratio2:'投票激励',
        ratio2Txt:'（从区块奖励中拿出多少比例作为投票者激励）',
        notBeBelow:'质押数量不能低于',
        numberTip1:'注:质押金不能低于默认值',
        numberTip2:'及第200名节点质押金的110%;',
        after200:'> 200',
        submitApply:'提交申请',
        noFile:'未选择任何文件。',
        accountNull:'账户名称不能为空',
        accountRule2:'账户名称支持6-30位数字字母下划线组成，首位需字母开头',
        hostNull:'节点地址不能为空',
        invalidHost:'节点地址不合法',
        publicKeyNull:'节点ID不能为空',
        invalidPublicKey:'节点ID不合法',
        introNull:'节点简介不能为空',
        invalidIntro:'节点简介需满足10-200个字符',
        ratioNull:'投票激励不能为空',
        invalidRatio:'无效投票激励值（0-100）',
        orgNameNull:'机构名称不能为空',
        invalidOrgName:'机构名称不超过60字符',
        orgNetNull:'机构官网不能为空',
        invalidOrgNet:'机构官网不合法',
        logoInvalid:'logo图标上传失败，请确保大小格式满足要求',
        cannotConnect:'节点地址无法连接',
        nodeUrlExit:'节点地址已存在',
        nodeIDExit:'节点ID已存在',
        cannotSubmit:'预计质押排名低于200名，无法提交申请',
        reduceStake:'减持质押金',
        remainingStake:'剩余质押:',
        reduceAmount:'请输入减持质押的数量',
        after200Warn:'提示',
        after200Tip:'当前减持后的质押排名低于200名，节点将被淘汰，所有质押金都会解除，确定操作吗？',
        remainTip:'当前减持后，节点将被淘汰，所有质押金都会解除，确定操作吗？',
        myNode:'我的共识节点',
        enterAccount:'请输入账户名称查询',
        status:'状态',
        position:'位置',
        noCandidate:'暂无共识节点',
        sortBy1:'默认排序',
        sortBy2:'质押排名',
        sortBy3:'投票激励',
        sortBy4:'所属区域',
        joinAgain:'重新加入',
        applyWaiting:'共识节点注册提交中',
        validatorNode:'共识节点',
        myValidatorNode:'我的共识节点',
        cannotBeLess:'减持质押金不能低于质押金的10%',
        inCannotBeLess:'增加质押不能低于当前质押的10%',
        ApCannotBeLess:'质押金不能低于第200名候选人质押金的110%',
        createValidator:'共识节点注册',
        increaseStakeConf:'增加质押',
        reduceStakeConf:'减持质押',
        withdrawStakeConf:'提取质押',
        quitValidatorConf:'确认注销',
        OutOfRange:'减持数量不能超过现有质押数量',
        stakeNull:'减持质押数量不能为空',
        pendingRedeem: '提取中',
        revokePending:'注销操作处理中',
        notOperated:'当前客户端未发现节点钱包文件，无法进行操作',
        nodeWalletAddress:'节点钱包地址:',
        staked2:'质押',
        stake2:'质押',
        payWallet2:'支付钱包',
        reduceAmount2:'减持',
        registerInvalid:'当前客户端无钱包或钱包余额不足1000000 Energon,无法注册共识节点',
        nodeName2:'节点名称',
        withdraw:'提取',
        reduceDep:'减持金额',
        withdraw2:'提取',
        voteStaked:'投票质押',
        NodeInformation:'节点详情'
    },
    vote:{
        myVote:'我的投票',
        ticketPrice:'票价',
        tp1:'票价',
        tp2:'',
        ticketPool:'票池',
        roundLeft:'到下轮还有',
        blocks:'区块',
        tickets:'得票数',
        vote:'投票确认',
        nodeID:'节点ID',
        votingWallet:'投票钱包',
        votingWalletTip:'(购买选票，接收当前选票收益及选票资产解冻返还)',
        ticketsCount:'投票数',
        total:'预计支付',
        votingConfirmation:'确认投票',
        voteStatistics:'投票统计',
        voteStaked:'投票锁定',
        vaildTicket:'有效票/失效票',
        validT:'有效票/',
        inValid:'失效票',
        Profit:'投票奖励',
        votingRecord:'投票记录',
        addVote:'新增投票',
        voteDetail:'投票详情',
        noData:'暂无投票记录',
        votingTime:'投票时间',
        voteStaked1:'投票锁定/已解除',
        vs1:'投票锁定/',
        vs2:'已解除',
        expirationTime:'预计/过期时间',
        exT1:'预过期时间',
        exT2:'实失效时间',
        currentTickets:'当前得票数',
        ticketAge:'实时票龄',
        toVote:'投票',
        voting:'投票',
        exceed:'投票数超出票池限制',
        enterVoteNumber:'请输入投票数量',
        noBalance:'钱包余额不足，无法进行投票',
        voteFor:'投票给',
        invalidNode:'节点已退出共识，投票失败！',
        count:'票数',
    }
};
