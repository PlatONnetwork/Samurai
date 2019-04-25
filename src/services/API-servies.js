//
//  API-servies.js
//  <project>
//
//  Created by yann_liang on 2017-05-25.
//  Copyright 2017 yann_liang. All rights reserved.
//

import Http from 'axios'
import API from '@/config/API-config'
import ContractServies from './contract-servies'

Http.defaults.headers.post['Content-Type'] = "application/json;charset=utf-8";

const encodeParams = (params) => {
    let r = '?',
        p = [];
    for(let key in params) {
        p.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
    return r + p.join('&&');
};

//请求类
class ApiService {
    constructor() {


        this.file = {
            upload: this.uploadFile.bind(this, API.FILE.upload),//文件上传
        };
        this.node = {
            getCandidateTicketCount: this.post.bind(this, 'getCandidateTicketCount'),
            getTicketCountByTxHash: this.post.bind(this, 'getTicketCountByTxHash'),
        }

        this.interceptorsOfReq();
        this.interceptorsOfRes();
    }

    get(url, params) {
        if(params) {
            url += encodeParams(params);
            // url += `&sessionid=${localStorage.sessionid}&userID=${localStorage.user? JSON.parse(localStorage.user).userID :''}`;
        }
        return Http.get(url).then(res => res.data);
    }

    post(url, params) {
        typeof params === 'undefined' ? params = {} : '';
        localStorage.sessionid ? params.sessionid = localStorage.sessionid : '';
        // params.userID = localStorage.user ? JSON.parse(localStorage.user).userID : '';;
        return Http.post(API.FILE_BASE+'-'+ContractServies.cid+'/api/'+url, params).then(res => res.data);
    }

    interceptorsOfReq() {
        return Http.interceptors.request.use(
            config => {
                console.log('请求URL== ' + config.url, '\n请求参数==', config.data);
                return config;
            },
            err => {
                return Promise.reject(err);
            });
    }

    interceptorsOfRes() {
        Http.interceptors.response.use(function(response) {
            console.log(response.config.url + '的响应数据↓↓↓\n', response.data);
            if(response.data.errorCode == 4) {
                localStorage.removeItem('sessionid');
                localStorage.removeItem('user');
                vueVm.loginPopFlag=true;
            }

            if(typeof response.data.data==null){
                console.log('没有查询到数据')
            };

            return response;
        }, function(error) {
            console.log("请求失败");
            return Promise.reject(error);
        });
    }

    /**
     * 上传文件
     * @param url -上传的url
     * @param fileObject -文件对象
     * 这里特意给这个方法做了清空http header参数的操作，因为这里涉及到跨域，清空头部参数将请求置为简单请求，可通过浏览器预检请求。
     * @returns {Promise.<TResult>}
     */
    uploadFile(url, params) {
        Http.defaults.headers.post={};
        let formData = new FormData();
        formData.append("file", params.file, params.fileName);
        return Http({
            url: url + "?fileName=" + params.fileName + "&fileSize=" + params.fileSize + "&policy=" + params.policy,
            // url:url,
            method: 'POST',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then((res) => res.data);
    }

}

//导出一个对象
export default new ApiService();
