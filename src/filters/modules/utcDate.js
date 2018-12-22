import Vue from 'vue'

//全局过滤器
// 注册
export default Vue.filter('UTCDate', function(time) {
    if(!time) return;
    var a = new Date(time-0).toUTCString(),
        b = a.slice(a.indexOf(',')+2,a.length).replace(/^\s+/,''),
        c = b.split(' '),
        d = c[3].split(":"),
        e = 'AM';
    if(d[0]>12){
        e='PM';
        d.splice(0,1,d[0]-12)
    }
    return `${c[1]}-${c[0]}-${c[2]} ${d.join(":")} ${e} +UTC`;
})
