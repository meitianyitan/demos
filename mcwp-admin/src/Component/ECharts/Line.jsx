import React, { Component } from 'react';
import echarts from 'echarts';
class Line extends Component {
    constructor(props) {
    	super(props);
        this.state = {
            lineChart: null
        }
    }
    componentDidMount() {
        const that = this;
        const { id, data } = this.props;
        let lineChart = echarts.init(document.getElementById(id));
        that.setState({
            lineChart: lineChart
        })
        let optionLine = {
            title: {
                text: data.title,
                x: '10px',
                y: '10px' ,
                textStyle:{
                    fontSize:14,
                },
            },
            tooltip: {
                trigger: "axis"         //触发方式
            },
            legend: {
                data: data.legendData   // 顶部展示数据
            },
            calculable: true,
            xAxis: [                    // 坐标刻度
                {
                    type: "category",
                    boundaryGap: false,
                    axisLabel:{          //防止坐标轴省略
                        interval: 0 ,
                        rotate:-40 ,
                    },
                    data: data.xAxisData
                }
            ],
            yAxis: [                    // 坐标刻度
                {
                    type: "value",
                    name: ""
                }
            ],
            grid:data.grid,             //对图表本身的设置
            // dataZoom: [{                //图形缩放
            //     type: 'inside',
            //     start: 20,              //起始位置(百分比)
            //     end: 80,               //结束位置(百分比)
            //     minSpan:60,
            //     maxSpan:60,
            // }, {//此处handleIcon的值为拖动条手柄的默认样式
            //     handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            //     handleSize: '80%',
            //     handleStyle: {          //手柄的颜色阴影等修饰样式
            //         color: '#fff',
            //         shadowBlur: 3,
            //         shadowColor: 'rgba(0, 0, 0, 0.7)',
            //         shadowOffsetX: 2,
            //         shadowOffsetY: 2
            //     }
            // }],
            series: data.series         // 图标中数据
        };
        lineChart.setOption(optionLine);
    }
    update () {                         //对比刷新，此处非Echarts原有内容
        const { data } = this.props;
        const { lineChart } = this.state;
        lineChart.setOption({
            xAxis: [{
                show: true,
                type: 'category',
                data: data.xAxisData
            }],
            series: data.series
        });
    }
	render() {
        const { id } = this.props;
		return (
            <div id={id} style={{width: '1000px', height:'480px'}}></div>
		);
	}
}
export default Line;
