//请求地址
const BASE = process.env.API_ROOT,
    USER_URL = `${BASE}/user/`,
    FILE_BASE='http://192.168.9.86:8082/',
    FILE_URL = 'http://192.168.9.85:8888/file_api/',



    //用户
    USER = {
        register: `${USER_URL}register.do`,
        login: `${USER_URL}login.do`,
        getMenuList: `${USER_URL}getMenus.do`,
        logout: `${USER_URL}logout.do`,
    },
    //文件上传
    FILE = {
        upload: `${FILE_URL}upload`,
    };
//登录
export default {
    BASE: BASE,
    USER: USER,
    FILE: FILE,
    FILE_BASE
}
