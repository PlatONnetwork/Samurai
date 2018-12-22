//
//  line-chart-services.js
//  <project>
//
//  Created by yann_liang on 2017-06-01.
//  Copyright 2017 yann_liang. All rights reserved.
//

let echarts = require('echarts');

/*
 * fun init(ele, type, xData, yData) 初始化
 *  @param ele 必传
 *  @param type 必传
 *  @param xData 选填
 *  @param yData 选填
 *
 * fun updata(xData, yData) 更新数据
 * fun changeTitle(title) 改变标题
 * fun resize() 重置图表尺寸
 */

/*
 * 私有方法-图表类型
 *
 */
const _getSeriesType = (type) => {
    switch(type) {
        case 'line':
            return {
                type: 'line',
                name: '交易量',
                symbol: 'circle',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                lineStyle: {
                    normal: {
                        color: '#0b8aee',
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#666',
                    }

                }
            };
            break;
        case 'bar':
            return {
                type: 'bar',
                name: '出块量',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                lineStyle: {
                    normal: {
                        color: '#666',
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#0b8aee',
                    }

                }
            };
    }
}

/*
 * 私有方法-设置标题
 *
 */
const _setTitle = (type) => {
    let title = {
        text: '交易趋势图',
        left: 'center',
        //top:'center',
        textStyle: {
            color: '#666',
            fontSize: '14',
            fontWeight: 'normal',
        },

    }

    switch(type) {
        case 'line':
            title.text = '交易趋势图';

            break;
        case 'bar':
            title.text = '出块趋势图';

            break;
    }

    return title;
};

/*
 *
 *
 */
class ChartServices {
    constructor() {
        this.chart = null;
        this.ele = null;
    }

    init(ele, type, xData = ["0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"], yData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) {
        this.ele = ele;
        // 基于准备好的dom，初始化echarts实例
        this.chart = echarts.init(ele);

        let series = _getSeriesType(type);

        series.data = yData; //[100, 120, 136, 110, 10, 120, 15, 120, 136, 110, 10, 20, 20, 36, 10, 10, 20, 500]

        // 绘制图表
        this.chart.setOption({
            title: _setTitle(type),
            tooltip: {},
            //直角坐标系内绘图网格
            grid: {
                left: '2%',
                right: '2%',
            },
            //x轴设置
            xAxis: {
                type: 'category',
                boundaryGap: true,
                data: xData,
                axisLabel: {
                    show: true,
                    interval: 0,
                    textStyle: {
                        color: '#7d7d7d'
                    }
                },
                axisLine: {
                    show: true
                },
                //坐标轴刻度相关设置
                axisTick: {
                    show: false,
                }

            },
            //y轴设置
            yAxis: {
                show: false,
            },
            /*dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100,

            }, {
                start: 0,
                end: 10,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }],*/
            series: [series]
        });

    }

    updata(xData, yData) {
        console.log(xData, yData)
        this.chart ? this.chart.setOption({
            xAxis: {
                data: xData
            },
            series: [{
                data: yData
            }]
        }) : console.warn('请先执行init方法');
    }

    changeTitle(title) {
        this.chart ? this.chart.setOption({
            title: {
                text: title,
            },
        }) : console.warn('请先执行init方法');
    }

    resize() {
        return this.chart.resize();
    }

}

export default ChartServices;