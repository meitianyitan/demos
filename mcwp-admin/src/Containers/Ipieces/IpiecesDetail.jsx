/**
 * 进件管理 -- 征信调查
 * @Author: 魏昌华
 * @Date:   2017-05-27 14:08:20
 * @Last Modified by:   魏昌华
 * @Last Modified time: 2017-05-27 14:01:59
 */

import React, { Component } from 'react'; // 引入了React
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Config } from '../../Config/Index';
import { Link, browserHistory } from 'react-router';
import IpiecesService from '../../Services/IpiecesService';
import BaseService from '../../Services/BaseService';
import { getLoanTop, getLoanBasic, getLoanGuarantee, postLoanCreditHis, changeBasicRemark, changeGuaranteeRemark } from '../../Redux/Action/Ipieces/IpiecesAction';
import { setModal, getOssClient, uploadFile, getSysDict, getFileList, delOssFile } from '../../Redux/Action/Index';

//征信调查央行信息编辑
import EditAssetBank from '../../Component/Ipieces/EditAssetBank';
import DetailLoanInfo from '../../Component/Ipieces/DetailLoanInfo'; // 进件详情查看老客户

import './style/ipiecesDetail.less';
import ipiecesDelete from './../../Assets/Images/icon_remove.png';

import { Modal, Row, Col, Button, message, Breadcrumb, Radio, Form, Icon, Spin} from 'antd';
const RadioGroup = Radio.Group;
// const TabPane = Tabs.TabPane;
//基本信息
const EditAssetBankForm = Form.create()(EditAssetBank)
const flatten = arr => {
    return arr.reduce((acc, value) => {
        const newFields = Object.assign({}, acc.fields, value.fields)
        const newErrs = Object.assign({}, acc.errs, value.errs)
        return Object.assign(acc, {fields: newFields}, {errs: newErrs})
    })
}
/* 以类的方式创建一个组件 */
class IpiecesDetail extends Component {
    constructor(props) {
    	super(props);
        this.state = {
            basicCreditHis: '',
            borrowerCreditHis: '',
            guaranteeCreditHis: '',
            basicFileName: '',
            borrowerFileName: '',
            guaranteeFileName: '',
            creditCentralBankInfo: '',
            cid: '',
            reqCode: '',
            coBorrowerName: '',
            code: props.routeParams.code,
            identity: props.routeParams.type
        };
    }
    // shouldComponentUpdate(nextProps, nextState) {
    //     return !is(fromJS(this.props), fromJS(nextProps)) || !is(fromJS(this.state),fromJS(nextState))
    // }
    componentDidMount() {
        const that = this;
        const { routeParams, actions } = that.props;
        let identity = routeParams.type;
        const params = {
            code: routeParams.code
        };
        // 获取信贷历史信息
        if( identity == 'personal') {
            IpiecesService.getLoanCreditHis(params, (res) => {
                if (res.code == Config.errorCode.success) {
                    const data = res.data;
                    if (data) {
                        let basicCreditHis = data.creditHisCustomer;
                        if (!basicCreditHis) basicCreditHis = {};
                        if (!basicCreditHis.loanCreditTaints || basicCreditHis.loanCreditTaints.length == 0) {
                            basicCreditHis.loanCreditTaints = [{remark: ''}];
                        }
                        let creditCentralBankInfo = data.creditCentralBankInfo;
                        that.setState({
                            basicCreditHis:  basicCreditHis,
                            creditCentralBankInfo:  creditCentralBankInfo || {peopleBankRecord: false}
                        });
                        // let basicCreditHis = data.creditHisCustomer;
                        // if (!basicCreditHis) basicCreditHis = {};
                        // if (!basicCreditHis.loanCreditTaints || basicCreditHis.loanCreditTaints.length == 0) {
                        //     basicCreditHis.loanCreditTaints = [{remark: ''}];
                        // }
                        // // let borrowerCreditHis = data.creditHisCoBorrower;
                        // // if (!borrowerCreditHis) borrowerCreditHis = {};
                        // // if (!borrowerCreditHis.loanCreditTaints || borrowerCreditHis.loanCreditTaints.length == 0) {
                        // //     borrowerCreditHis.loanCreditTaints = [{remark: ''}];
                        // // }
                        // let borrowerCreditHis = data.creditHisCoBorrower;
                        // if (!borrowerCreditHis){
                        //     borrowerCreditHis = [{loanCreditTaints: [{remark: '', proValue: ''}]}];
                        // } else {
                        //     borrowerCreditHis = borrowerCreditHis.map(item => {
                        //         if (!item) item = {}
                        //         item.loanCreditTaints=item.loanCreditTaints && item.loanCreditTaints.length? item.loanCreditTaints : [{remark: '', proValue: ''}];
                        //         return item;
                        //     })
                        // }
                        // let guaranteeCreditHis = data.creditHisGuarantee;
                        // if (!guaranteeCreditHis){
                        //     guaranteeCreditHis = [{loanCreditTaints: [{remark: '', proValue: ''}]}];
                        // } else {
                        //     guaranteeCreditHis = guaranteeCreditHis.map(item => {
                        //         if (!item) item = {}
                        //         item.loanCreditTaints=item.loanCreditTaints && item.loanCreditTaints.length? item.loanCreditTaints : [{remark: '', proValue: ''}];
                        //         return item;
                        //     })
                        // }
                        // // if (!guaranteeCreditHis.loanCreditTaints || guaranteeCreditHis.loanCreditTaints.length == 0) {
                        // //     // guaranteeCreditHis.loanCreditTaints = [{remark: ''}];
                        // // }
                        // that.setState({
                        //     basicCreditHis:  basicCreditHis,
                        //     borrowerCreditHis: borrowerCreditHis,
                        //     guaranteeCreditHis: guaranteeCreditHis
                        // });
                    }
                } else {
                    message.error(res.msg);
                }
            })
            actions.getLoanTop(params);
            actions.getLoanBasic(params);
            actions.getLoanGuarantee(params);
            const pScript = Config.appendScript(Config.baseText.pScript);
            const oScript = Config.appendScript(Config.baseText.oScript);
            pScript.onload = function() {
                oScript.onload = function() {
                    actions.getOssClient({});
                }
            }
        } else if( identity == 'loan') {
            IpiecesService.getLoanCreditLoan(params, (res) => {
                if (res.code == Config.errorCode.success) {
                    const data = res.data;
                    if (data) {
                        let basicCreditHis = data.creditHisCoBorrower;
                        if (!basicCreditHis) basicCreditHis = {};
                        if (!basicCreditHis.loanCreditTaints || basicCreditHis.loanCreditTaints.length == 0) {
                            basicCreditHis.loanCreditTaints = [{remark: ''}];
                        }
                        let creditCentralBankInfo = data.creditCentralBankInfo;
                        that.setState({
                            basicCreditHis:  basicCreditHis,
                            reqCode: data.reqCode,
                            cid: data.cid,
                            coBorrowerName: data.coBorrowerName || '',
                            creditCentralBankInfo:  creditCentralBankInfo || {peopleBankRecord: false}
                        });
                    }
                } else {
                    message.error(res.msg);
                }
            })
        } else {
            IpiecesService.getLoanCreditGua(params, (res) => {
                if (res.code == Config.errorCode.success) {
                    const data = res.data;
                    if (data) {
                        let basicCreditHis = data.creditHisGuarantor;
                        if (!basicCreditHis) basicCreditHis = {};
                        if (!basicCreditHis.loanCreditTaints || basicCreditHis.loanCreditTaints.length == 0) {
                            basicCreditHis.loanCreditTaints = [{remark: ''}];
                        }
                        let creditCentralBankInfo = data.creditCentralBankInfo;
                        that.setState({
                            basicCreditHis:  basicCreditHis,
                            reqCode: data.reqCode,
                            cid: data.cid,
                            coBorrowerName: data.coBorrowerName || '',
                            creditCentralBankInfo:  creditCentralBankInfo || {peopleBankRecord: false}
                        });
                    }
                } else {
                    message.error(res.msg);
                }
            })
        }
        actions.getSysDict({code: 'zxwt'});
        const bizType = Config.bizType.loanPersonCredit + ',' + Config.bizType.loanCoborrowerCredit + ',' +Config.bizType.loanGuaranteeCredit;
        actions.getFileList({bizCode: routeParams.code, bizType: bizType, fileTypes: '*'});
    }
    componentWillUnmount() {
        // 关闭征信调查信息询问框
        const { modalVisible } = this.props;
        if(modalVisible) this.setModal(false);
    }
    getSubFormValue(formName, param) {
        return new Promise(resolve => {
            if(this[formName]){
                this[formName].validateFields((errs, fields) => {
                    if (errs) {
                        if (param == 'link') {
                            message.error('存在不符合要求项，请先修改')
                            return;
                        }
                        message.error('存在不符合要求项，请及时修改')
                    } else {
                        resolve({errs, fields})
                    }
                })
            } else {
                resolve({})
            }
        })
    }
    changeRadio(e, type, index) {
        const that = this;
        const { basicCreditHis } = that.state;
        const value = e.target.value;
        if (type == 'Basic') {
            that.setState({
                basicCreditHis: basicCreditHis ? fromJS(basicCreditHis).merge({proValue: value}).toJS() : {
                    proValue: value
                }
            });
        }
        if (type == 'loan') {
            // that.setState({
            //     borrowerCreditHis: borrowerCreditHis ? fromJS(borrowerCreditHis).merge({proValue: value}).toJS() : {
            //         proValue: value
            //     }
            // });
            // basicCreditHis.proValue = value;
            that.setState({
                basicCreditHis: fromJS(basicCreditHis).merge({proValue: value}).toJS()
            });
        }
        if (type == 'Guarantee') {
            // basicCreditHis.proValue = value;
            that.setState({
                basicCreditHis: fromJS(basicCreditHis).merge({proValue: value}).toJS()
            });
        }
    }
    submitInfo = (action,param) => { // 提交信息
        Promise.all([
            //基本信息表单数据获取0
            this.getSubFormValue('editAssetBankForm', param),
        ]).then(result => {
            let arr = [];
            arr[0] = flatten([result[0]]);
            const that = this;
            // const { routeParams, actions, loanBasicInfo, loanGuarantee } = that.props;
            const { routeParams, actions, loanBasicInfo } = that.props;
            // const { basicCreditHis, borrowerCreditHis, guaranteeCreditHis } = that.state;
            // const { basicCreditHis, identity, code, cid, reqCode } = that.state;
            const { basicCreditHis, identity, cid, reqCode } = that.state;
            const loanCreditHisList = [];
            let address = {pathname:"/ipieces/edit/" + this.state.reqCode + "/6", state: {key: 'comLoan'}}
            if (identity == 'personal') {
                if (basicCreditHis && loanBasicInfo.loanCustomer && basicCreditHis.proValue) {
                    const loanCreditHis = {
                        cid: loanBasicInfo.loanCustomer.cid,
                        ctype: 1,
                        proValue: basicCreditHis.proValue
                    };
                    if (basicCreditHis.proValue == 1) {
                        if (loanCreditHis.loanCreditTaints) delete loanCreditHis.loanCreditTaints;
                    } else {
                        let taints = [];
                        basicCreditHis.loanCreditTaints.map((item, index) => {
                            let taint = {
                                remark: item.remark
                            };
                            taints.push(taint);
                        })
                        loanCreditHis.loanCreditTaints = taints;
                    }
                    loanCreditHisList.push(loanCreditHis);
                }
            }
            if (identity == 'loan') {
                if (basicCreditHis && basicCreditHis.proValue) {
                    const loanCreditHis = {
                        cid: cid,
                        ctype: 2,
                        proValue: basicCreditHis.proValue
                    };
                    if (basicCreditHis.proValue == 1) {
                        if (loanCreditHis.loanCreditTaints) delete loanCreditHis.loanCreditTaints;
                    } else {
                        let taints = [];
                        basicCreditHis.loanCreditTaints.map((item, index) => {
                            let taint = {
                                remark: item.remark
                            };
                            taints.push(taint);
                        })
                        loanCreditHis.loanCreditTaints = taints;
                    }
                    loanCreditHisList.push(loanCreditHis);
                }
            }
            if (identity == 'guaran') {
                if (basicCreditHis && basicCreditHis.proValue) {
                    const loanCreditHis = {
                        cid: cid,
                        ctype: 3,
                        proValue: basicCreditHis.proValue
                    };
                    if (basicCreditHis.proValue == 1) {
                        if (loanCreditHis.loanCreditTaints) delete loanCreditHis.loanCreditTaints;
                    } else {
                        let taints = [];
                        basicCreditHis.loanCreditTaints.map((item, index) => {
                            let taint = {
                                remark: item.remark
                            };
                            taints.push(taint);
                        })
                        loanCreditHis.loanCreditTaints = taints;
                    }
                    loanCreditHisList.push(loanCreditHis);
                }
            }
            if(loanCreditHisList.length == 0) {
                message.error('请选择征信调查信息');
                this.setModal(false);
                return;
            }
            // 央行征信信息
            let creditCentralBankInfoBO = '';
            let creditHisParam = {
                reqCode: routeParams.code,
                action: action,
                loanCreditHisList: loanCreditHisList
            };
            creditCentralBankInfoBO = arr[0].fields.creditCentralBankInfoBO;
            if (loanCreditHisList[0].cid) {
                creditCentralBankInfoBO.cid = loanCreditHisList[0].cid;
            }
            if (loanCreditHisList[0].ctype) {
                creditCentralBankInfoBO.ctype = loanCreditHisList[0].ctype;
            }
            creditHisParam.creditCentralBankInfoBO = creditCentralBankInfoBO;
            if(identity == 'personal') {
                const params = Config.serializeObjects(creditHisParam);
                let param = Config.serializeObjects(params)
                for (let key in param) {
                    if(param[key] === null) {
                        delete param[key]
                    }
                }
                actions.postLoanCreditHis(param,'','/ipieces/operate');
            }
            if(identity == 'loan' || identity == 'guaran') {
                const params = Config.serializeObjects({
                    reqCode: reqCode,
                    action: action,
                    loanCreditHisList: loanCreditHisList,
                    creditCentralBankInfoBO: creditCentralBankInfoBO
                });
                let param = Config.serializeObjects(params)
                for (let key in param) {
                    if(param[key] === null) {
                        delete param[key]
                    }
                }
                actions.postLoanCreditHis(param,'',address);
            }
        });
    }
    addAttachment(e, type, typeCode) { // 添加附件
        const that = this;
        const { routeParams, ossClient, actions } = that.props;
        // const { reqCode } = that.state;
        var file = e.target.files[0];
        var fileArray = file.name.split('.');
        var key = Config.localItem('ENTERP_CODE') + '/' + Config.bizType.loanPersonCredit + '/' + Config.localItem('LOGIN_USER_ID') + '/' + Config.getOssUUID() + (new Date()).getTime() + '.' + fileArray[fileArray.length - 1];
        let cbParams = {
            style: '',
            size: file.size,
            mimeType: file.type,
            bizCode: routeParams.code,
            enterpriseCode: Config.localItem('ENTERP_CODE'),
            bizType: Config.bizType.loanPersonCredit
        };
        if(type == 'Basic') {
            cbParams.bizType = Config.bizType.loanPersonCredit;
            that.setState({
                basicFileName: ''
            });
        } else if(type == 'Borrower') {
            cbParams.bizType = Config.bizType.loanCoborrowerCredit;
            cbParams.bizCode = typeCode
            // cbParams.tmpCode = reqCode    // 此code用于更新列表使用
            that.setState({
                borrowerFileName: ''
            });
        } else if(type == 'Guarantee') {
            cbParams.bizType = Config.bizType.loanGuaranteeCredit;
            cbParams.bizCode = typeCode
            // cbParams.tmpCode = reqCode    // 此code用于更新列表使用
            that.setState({
                guaranteeFileName: ''
            });
        }
        const fileListBizType = Config.bizType.loanPersonCredit + ',' + Config.bizType.loanCoborrowerCredit + ',' + Config.bizType.loanGuaranteeCredit;
        if (ossClient && ossClient.multipartUpload && typeof ossClient.multipartUpload == 'function') {
            actions.uploadFile(cbParams, ossClient, key, file, fileListBizType);
        } else {
            const pScript = Config.appendScript(Config.baseText.pScript);
            const oScript = Config.appendScript(Config.baseText.oScript);
            pScript.onload = function() {
                oScript.onload = function() {
                    let OSS = window.OSS;
                    const wOSS = OSS.Wrapper,
                    bucket = Config.ossKey.bucket,
                    region = Config.ossKey.region;
                    let ossClient = null;
                    if(Config.localItem('OOS_CLIENT')) ossClient = JSON.parse(Config.localItem('OOS_CLIENT'));
                    let currentTime = (new Date()).getTime();
                    if(!ossClient || currentTime >= ossClient.expiration) {
                        BaseService.getStsToken({}, (res) => {
                            if(res.code == Config.errorCode.success) {
                                let expiration = currentTime + res.data.durationSeconds * 1000;
                                let wOssParams = {
                                    region: region,
                                    secure: true,
                                    accessKeyId: res.data.accessKeyId,
                                    accessKeySecret: res.data.accessKeySecret,
                                    stsToken: res.data.securityToken,
                                    bucket: bucket
                                };
                                const client = new wOSS(wOssParams);
                                wOssParams.expiration = expiration;
                                Config.localItem('OOS_CLIENT', JSON.stringify(wOssParams));
                                actions.uploadFile(cbParams, client, key, file, fileListBizType);
                            } else {
                                message.error(res.msg);
                            }
                        });
                    } else {
                        delete ossClient.expiration;
                        const client = new wOSS(ossClient);
                        actions.uploadFile(cbParams, client, key, file, fileListBizType);
                    }
                }
            }
        }
    }
    delAttachment(item) { // 删除附件
        const { routeParams, actions } = this.props;
        const bizType = Config.bizType.loanPersonCredit + ',' + Config.bizType.loanCoborrowerCredit + ',' +Config.bizType.loanGuaranteeCredit;
        const fileListParams = {
            bizCode: routeParams.code,
            bizType: bizType,
            fileTypes: '*'
        };
        const params = {
            codes: item.code
        };
        actions.delOssFile(params, fileListParams);
    }
    setModal(status) { // 对话框是否可见
        const { actions } = this.props;
        actions.setModal(status);
    }
    goBack = () => {
        let identity = this.state.identity;
        if (identity == 'personal') {
            browserHistory.goBack()
        } else {
            browserHistory.push({pathname:"/ipieces/edit/" + this.state.reqCode + "/6", state: {key: 'comLoan'}})
        }
    }
    changeRemark = (e, type, index, i) => {
        const that = this;
        const value = e.target.value;
        if(type == 'Basic') {
            let { basicCreditHis } = that.state;
            if (basicCreditHis.loanCreditTaints && basicCreditHis.loanCreditTaints.length >= 0) {
                basicCreditHis.loanCreditTaints[index] = {
                    remark: value
                };
                that.setState({
                    basicCreditHis: fromJS(basicCreditHis).merge({basicCreditHis: basicCreditHis}).toJS()
                });
            }
        }
        if(type == 'Borrower') {
            let { borrowerCreditHis } = that.state;
            // if (borrowerCreditHis.loanCreditTaints && borrowerCreditHis.loanCreditTaints.length > 0) {
            //     borrowerCreditHis.loanCreditTaints[index] = {
            //         remark: value
            //     };
            //     that.setState({
            //         borrowerCreditHis: fromJS(borrowerCreditHis).merge({borrowerCreditHis: borrowerCreditHis}).toJS()
            //     });
            // }
            if (borrowerCreditHis[i].loanCreditTaints && borrowerCreditHis[i].loanCreditTaints.length > 0) {
                borrowerCreditHis[i].loanCreditTaints[index] = {
                    remark: value
                };
                that.setState({
                    borrowerCreditHis: fromJS(borrowerCreditHis).merge(borrowerCreditHis).toJS()
                });
            } else {
                borrowerCreditHis[i].loanCreditTaints = [];
                borrowerCreditHis[i].loanCreditTaints[index] = {
                    remark: value
                };
                that.setState({
                    borrowerCreditHis: fromJS(borrowerCreditHis).merge(borrowerCreditHis).toJS()
                });
            }
        }

        if(type == 'Guarantee') {
            let { guaranteeCreditHis } = that.state;
            if (guaranteeCreditHis[i].loanCreditTaints && guaranteeCreditHis[i].loanCreditTaints.length > 0) {
                guaranteeCreditHis[i].loanCreditTaints[index] = {
                    remark: value
                };
                that.setState({
                    guaranteeCreditHis: fromJS(guaranteeCreditHis).merge(guaranteeCreditHis).toJS()
                });
            } else {
                guaranteeCreditHis[i].loanCreditTaints = [];
                guaranteeCreditHis[i].loanCreditTaints[index] = {
                    remark: value
                };
                that.setState({
                    guaranteeCreditHis: fromJS(guaranteeCreditHis).merge(guaranteeCreditHis).toJS()
                });
            }
        }
    }
    addCredit = (type, index) => {
        const that = this;
        if (type == 'Basic') {
            let { basicCreditHis } = that.state;
            let loanCreditTaints = basicCreditHis.loanCreditTaints;
            if (loanCreditTaints && loanCreditTaints.length) {
                loanCreditTaints[loanCreditTaints.length] = {
                    remark: ''
                };
            } else {
                loanCreditTaints = [];
                loanCreditTaints[0] = loanCreditTaints[1] = {
                    remark: ''
                };
            }
            basicCreditHis.loanCreditTaints = loanCreditTaints;
            that.setState({
                basicCreditHis: fromJS(basicCreditHis).merge({basicCreditHis: basicCreditHis}).toJS()
            });
        }
        if (type == 'Borrower') {
            let { borrowerCreditHis } = that.state;
            // let loanCreditTaints = borrowerCreditHis.loanCreditTaints;
            let loanCreditTaints = borrowerCreditHis[index].loanCreditTaints;
            if (loanCreditTaints && loanCreditTaints.length) {
                loanCreditTaints[loanCreditTaints.length] = {
                    remark: ''
                };
            } else {
                loanCreditTaints = [];
                loanCreditTaints[0] = loanCreditTaints[1] = {
                    remark: ''
                };
            }
            // borrowerCreditHis.loanCreditTaints = loanCreditTaints;
            borrowerCreditHis[index].loanCreditTaints = loanCreditTaints;
            that.setState({
                // borrowerCreditHis: fromJS(borrowerCreditHis).merge({borrowerCreditHis: borrowerCreditHis}).toJS()
                borrowerCreditHis: fromJS(borrowerCreditHis).merge(borrowerCreditHis).toJS()
            });
        }
        if (type == 'Guarantee') {
            let { guaranteeCreditHis } = that.state;
            let loanCreditTaints = guaranteeCreditHis[index].loanCreditTaints;
            if (loanCreditTaints && loanCreditTaints.length) {
                loanCreditTaints[loanCreditTaints.length] = {
                    remark: ''
                };
            } else {
                loanCreditTaints = [];
                loanCreditTaints[0] = loanCreditTaints[1] = {
                    remark: ''
                };
            }
            guaranteeCreditHis[index].loanCreditTaints = loanCreditTaints;
            that.setState({
                guaranteeCreditHis: fromJS(guaranteeCreditHis).merge(guaranteeCreditHis).toJS()
            });
        }
    }
    deleteCredit = (type, index, i) => {
        const that = this;
        if (type == 'Basic') {
            let { basicCreditHis } = that.state;
            let loanCreditTaints = basicCreditHis.loanCreditTaints;
            loanCreditTaints.splice(index, 1);
            basicCreditHis.loanCreditTaints = loanCreditTaints;
            that.setState({
                basicCreditHis: fromJS(basicCreditHis).merge({basicCreditHis: basicCreditHis}).toJS()
            });
        }
        if (type == 'Borrower') {
            let { borrowerCreditHis } = that.state;
            // let loanCreditTaints = borrowerCreditHis.loanCreditTaints;
            let loanCreditTaints = borrowerCreditHis[i].loanCreditTaints;
            loanCreditTaints.splice(index, 1);
            // borrowerCreditHis.loanCreditTaints = loanCreditTaints;
            borrowerCreditHis[i].loanCreditTaints = loanCreditTaints;
            that.setState({
                // borrowerCreditHis: fromJS(borrowerCreditHis).merge({borrowerCreditHis: borrowerCreditHis}).toJS()
                guaranteeCreditHis: fromJS(borrowerCreditHis).merge(borrowerCreditHis).toJS()
            });
        }
        if (type == 'Guarantee') {
            let { guaranteeCreditHis } = that.state;
            let loanCreditTaints = guaranteeCreditHis[i].loanCreditTaints;
            loanCreditTaints.splice(index, 1);
            guaranteeCreditHis[i].loanCreditTaints = loanCreditTaints;
            that.setState({
                guaranteeCreditHis: fromJS(guaranteeCreditHis).merge(guaranteeCreditHis).toJS()
            });
        }
    }
    showModal = () => { // 设置借款记录模态对话框
        this.setState({
            showLoanInfo: true,
        });
    }
    handleOk = () => {
        this.setState({
            showLoanInfo: false,
        });
    }
    handleCancel = () => {
        this.setState({
            showLoanInfo: false,
        });
    }
    changeBankInfo = () => {
        let creditCentralBankInfo = this.state.creditCentralBankInfo
        creditCentralBankInfo.isBlankCreditRecord = !creditCentralBankInfo.isBlankCreditRecord
        this.setState({
            creditCentralBankInfo: creditCentralBankInfo,
        });
    }
	render() {
        const that = this;
        // const { basicCreditHis, borrowerCreditHis, guaranteeCreditHis, basicFileName, borrowerFileName, guaranteeFileName } = that.state;
        const { basicCreditHis,  basicFileName, creditCentralBankInfo, identity, code, reqCode } = that.state;
        const { loading, modalVisible, loanTopInfo, loanBasicInfo, loanGuarantee, sysDictItems, fileLists } = that.props;
        let busiCheck = loanBasicInfo.duplicateBusiCheck;
        // let cusCode = loanBasicInfo.customerCode;
        return (
            <Spin tip={Config.warnInfo.spinText} spinning={loading}>
                <div className="ipieces-detail-container">
                    <Breadcrumb className='breadcrumb'>
                        <Breadcrumb.Item className='breadcrumb-item'><Link to="/ipieces/operate">进件管理</Link></Breadcrumb.Item>
                        {
                            identity != 'personal' ?
                            <Breadcrumb.Item className='breadcrumb-item'><Link to={"/ipieces/edit/" + reqCode + '/6'}>编辑调查报告</Link></Breadcrumb.Item>
                            : null
                        }
                        {
                            identity == 'loan' ?
                            <Breadcrumb.Item className='breadcrumb-item'>共同借款人征信模型验证</Breadcrumb.Item>
                            : null
                        }
                        {
                            identity == 'guaran' ?
                            <Breadcrumb.Item className='breadcrumb-item'>担保人征信模型验证</Breadcrumb.Item>
                            : null
                        }
                        {
                            identity == 'personal' ?
                            <Breadcrumb.Item className='breadcrumb-item'>征信调查</Breadcrumb.Item>
                            : null
                        }
                    </Breadcrumb>
                    <div className="idetail-content">
                        {
                            identity == 'personal' ?
                            <div>
                            {
                                loanBasicInfo && loanBasicInfo.custType == 2?
                                <p className='ipieces-cust-type'>该客户已被标识为黑名单用户</p>
                                : null
                            }
                            {
                                busiCheck && busiCheck.length > 0?
                                <div>
                                    {
                                        busiCheck.map((item, index) => (
                                            <p key={index}><Link className='result-content' onClick={this.showModal}>{item + ' >>>'}</Link></p>
                                        ))
                                    }
                                </div>
                                :
                                null
                            }
                            { loanTopInfo ? <Row className="idetail-title">
                                <Col span={12}>
                                    <span>产品类型：{loanTopInfo.prdTypeText}</span>
                                </Col>
                                <Col span={12}>
                                    <span>产品名称：{loanTopInfo.prdName}</span>
                                </Col>
                                <Col span={12}>
                                    <span>授信类型：{loanTopInfo.authTypeText}</span>
                                </Col>
                                <Col span={12}>
                                    <span>借款用途：{loanTopInfo.loanUseText}</span>
                                </Col>
                            </Row> : null }
                            <Row className="personal-info">
                                <Col span={4} className="title">
                                    <span>个人信息</span>
                                </Col>
                                {loanBasicInfo ? <Col span={20}>
                                    <div className="upload-file"><Icon type="plus" />添加附件<input value={basicFileName} type="file" onChange={(e)=>{this.addAttachment(e, 'Basic')}} multiple /></div>
                                </Col> : null}
                            </Row>
                            { loanBasicInfo ?
                                <Row className="personal-info-content">
                                {}
                                    <Col span={6} className="title">
                                        <span>姓名：{loanBasicInfo.loanCustomer.cname || '未录入'}</span>
                                    </Col>
                                    <Col span={6} className="title">
                                        <span>性别：{loanBasicInfo.loanCustomer.sex || '未录入'}</span>
                                    </Col>
                                    <Col span={6} className="title">
                                        <span>年龄：{loanBasicInfo.loanCustomer.age && loanBasicInfo.loanCustomer.age + '岁' || '未录入'}</span>
                                    </Col>
                                    <Col span={6} className="title">
                                        <span>婚姻状况：{loanBasicInfo.maritalStatusText || '未录入'}</span>
                                    </Col>
                                    <Col span={12} className="title">
                                        <span>身份证号：{loanBasicInfo.loanCustomer.idCardNo || '未录入'}</span>
                                    </Col>
                                    <Col span={12} className="title">
                                        <span>联系方式：{loanBasicInfo.loanCustomer.telephone || '未录入'}</span>
                                    </Col>
                                    <Col span={12} className="title">
                                        <span>经营类别：{loanBasicInfo.manageTypeText || '未录入'}</span>
                                    </Col>
                                    <Col span={12} className="title">
                                        <span>单位名称：{loanBasicInfo.loanCustomer.orgName || '未录入' }</span>
                                    </Col>
                                    <Col span={24} className="title">
                                        <span>住址：{loanBasicInfo.loanCustomer.homeAddr || loanBasicInfo.loanCustomer.idCardAddr || '未录入' }</span>
                                    </Col>
                                    <Col span={24} className="title">
                                        <Row className="upload-file-box">
                                            {
                                                fileLists.LOAN_PERSON_CREDIT && fileLists.LOAN_PERSON_CREDIT.length > 0 ? fileLists.LOAN_PERSON_CREDIT.map((info, index)=> (
                                                    <Col key={index} span={6} className="title">
                                                        <a  target="_blank" className="file-url" href={info.srcUrl}>{info.fileName}</a><span onClick={this.delAttachment.bind(this, info)} className="file-del">删除</span>
                                                    </Col>
                                                )) : null
                                            }
                                        </Row>
                                    </Col>
                                    <Col span={24} className="title mg-left01">
                                        <span>征信调查分析</span>
                                    </Col>
                                    <RadioGroup value={basicCreditHis  && basicCreditHis.proValue && basicCreditHis.proValue.toString()} onChange={(e)=>{this.changeRadio(e, 'Basic')}}>
                                        {
                                            sysDictItems && sysDictItems.zxwt ? sysDictItems.zxwt.map((info, index)=> (
                                                <Col key={index} span={24} className="title">
                                                    <Radio value={info.ddValue}>{info.ddText}</Radio>
                                                </Col>
                                            )) : null
                                        }
                                    </RadioGroup>
                                    <Col span={24} className="title" style={basicCreditHis  && basicCreditHis.proValue && basicCreditHis.proValue == 2 ? {display: 'block'} : {display: 'none'}}>
                                        { basicCreditHis  && basicCreditHis.loanCreditTaints && basicCreditHis.loanCreditTaints.length > 0 ? basicCreditHis.loanCreditTaints.map((item, index) => (
                                            <div className="ipieces-item" key={index}>
                                                <input style={{width: '60%'}} className="ant-input ant-input-lg" value={item.remark} placeholder="请逐条列出逾期情况" onChange={(e)=>{this.changeRemark(e, 'Basic', index)}} />
                                                {index > 0 ? <img className='ipieces-delete' src={ipiecesDelete} alt='delete' onClick={() => this.deleteCredit('Basic', index)} /> : null}
                                            </div>
                                        )) : <div>
                                            <input style={{width: '60%'}} className="ant-input ant-input-lg" placeholder="请逐条列出逾期情况" onChange={(e)=>{this.changeRemark(e, 'Basic', 0)}} />
                                        </div>}
                                        <Button className="add-overdue" type="primary" onClick={() => this.addCredit('Basic')}>添加征信问题</Button>
                                    </Col>
                                </Row> : <Row className="personal-info-content">
                                <Col span={24} className="title">
                                    <span>暂未录入基本信息信息</span>
                                </Col>
                            </Row> } </div>:null
                        }
                        {
                            identity == 'loan' || identity == 'guaran' ?
                            <div>
                                <Row className="personal-info">
                                    <Col span={8} className="title">
                                        <span>{identity == 'loan' ? '共同借款人' + this.state.coBorrowerName + '征信调查' : '共同担保人' + this.state.coBorrowerName + '征信调查'}</span>
                                    </Col>
                                    <Col span={16}>
                                    {   identity == 'loan' ?
                                        <div className="upload-file"><Icon type="plus" />添加附件<input value={basicFileName} type="file" onChange={(e)=>{this.addAttachment(e, 'Borrower', code)}} multiple /></div> :
                                        <div className="upload-file"><Icon type="plus" />添加附件<input value={basicFileName} type="file" onChange={(e)=>{this.addAttachment(e, 'Guarantee', code)}} multiple /></div>
                                    }
                                    </Col>
                                </Row>
                                <Row className="personal-info-content">
                                    <Col span={24} className="title">
                                    {
                                        identity == 'loan' ?
                                        <Row className="upload-file-box">
                                            {
                                                fileLists.LOAN_COBORROWER_CREDIT && fileLists.LOAN_COBORROWER_CREDIT.length > 0 ? fileLists.LOAN_COBORROWER_CREDIT.map((info, index)=> (
                                                    <Col key={index} span={6} className="title">
                                                        <a  target="_blank" className="file-url" href={info.srcUrl}>{info.fileName}</a><span onClick={this.delAttachment.bind(this, info)} className="file-del">删除</span>
                                                    </Col>
                                                )) : null
                                            }
                                        </Row> :
                                        <Row className="upload-file-box">
                                            {
                                                fileLists.LOAN_GUARANTEE_CREDIT && fileLists.LOAN_GUARANTEE_CREDIT.length > 0 ? fileLists.LOAN_GUARANTEE_CREDIT.map((info, index)=> (
                                                    <Col key={index} span={6} className="title">
                                                        <a  target="_blank" className="file-url" href={info.srcUrl}>{info.fileName}</a><span onClick={this.delAttachment.bind(this, info)} className="file-del">删除</span>
                                                    </Col>
                                                )) : null
                                            }
                                        </Row>
                                    }
                                    </Col>
                                    <Col span={24} className="title mg-left01">
                                            <span>征信调查分析</span>
                                    </Col>
                                    {
                                        identity == 'loan' ?
                                        <RadioGroup value={basicCreditHis  && basicCreditHis.proValue && basicCreditHis.proValue.toString()} onChange={(e)=>{this.changeRadio(e, 'loan')}}>
                                            {
                                                sysDictItems && sysDictItems.zxwt ? sysDictItems.zxwt.map((info, index)=> (
                                                    <Col key={index} span={24} className="title">
                                                        <Radio value={info.ddValue}>{info.ddText}</Radio>
                                                    </Col>
                                                )) : null
                                            }
                                        </RadioGroup> :
                                        <RadioGroup value={basicCreditHis  && basicCreditHis.proValue && basicCreditHis.proValue.toString()} onChange={(e)=>{this.changeRadio(e, 'Guarantee')}}>
                                            {
                                                sysDictItems && sysDictItems.zxwt ? sysDictItems.zxwt.map((info, index)=> (
                                                    <Col key={index} span={24} className="title">
                                                        <Radio value={info.ddValue}>{info.ddText}</Radio>
                                                    </Col>
                                                )) : null
                                            }
                                        </RadioGroup>
                                    }
                                    <Col span={24} className="title" style={basicCreditHis  && basicCreditHis.proValue && basicCreditHis.proValue == 2 ? {display: 'block'} : {display: 'none'}}>
                                        { basicCreditHis  && basicCreditHis.loanCreditTaints && basicCreditHis.loanCreditTaints.length > 0 ? basicCreditHis.loanCreditTaints.map((item, index) => (
                                            <div className="ipieces-item" key={index}>
                                                <input style={{width: '60%'}} className="ant-input ant-input-lg" value={item.remark} placeholder="请逐条列出逾期情况" onChange={(e)=>{this.changeRemark(e, 'Basic', index)}} />
                                                {index > 0 ? <img className='ipieces-delete' src={ipiecesDelete} alt='delete' onClick={() => this.deleteCredit('Basic', index)} /> : null}
                                            </div>
                                        )) : <div>
                                            <input style={{width: '60%'}} className="ant-input ant-input-lg" placeholder="请逐条列出逾期情况" onChange={(e)=>{this.changeRemark(e, 'Basic', 0)}} />
                                        </div>}
                                        <Button className="add-overdue" type="primary" onClick={() => this.addCredit('Basic')}>添加征信问题</Button>
                                    </Col>
                                </Row>
                            </div> : null
                        }
                        <EditAssetBankForm ref={editAssetBankForm => {this.editAssetBankForm = editAssetBankForm}}  creditCentralBankInfo ={this.state.creditCentralBankInfo} changeBankInfo={this.changeBankInfo}/>
                        {
                            this.state.showLoanInfo ?
                            <Modal
                                title="贷款记录"
                                visible={this.state.showLoanInfo}
                                onOk={this.handleOk}
                                onCancel={this.handleCancel}
                                wrapClassName = 'loanInfo-modal'
                                width = {580}
                                footer=""
                                >
                                <DetailLoanInfo customerLoanList={loanBasicInfo.loanReqRecord} customerBorrowList={loanBasicInfo.borrowInfoRecord}/>
                            </Modal>
                            :null
                        }
                        {
                            loanTopInfo || loanGuarantee || creditCentralBankInfo ? <div className="detail-btns">
                                {/* <Button className="detail-submit" type="primary" onClick={this.setModal.bind(this, true)}>提交</Button> */}
                                <Modal
                                    visible={modalVisible || false}
                                    title="温馨提示"
                                    footer={[
                                        <Button key="cancel" size="large" onClick={this.setModal.bind(this, false)}>取消</Button>,
                                        <Button key="ok" type="primary" size="large" onClick={this.submitInfo.bind(this, 2)}>确定</Button>
                                    ]}
                                    >
                                    <p>提交后信息不可修改，确认要提交吗？</p>
                                </Modal>
                                <Button className="detail-check" type="primary" onClick={this.submitInfo.bind(this, 2)}>征信验证</Button>
                                <Button className="detail-submit" type="primary" onClick={this.submitInfo.bind(this, 1)}>保存</Button>
                                <Button className="detail-cancle" type="primary" onClick={this.goBack}>取消</Button>
                            </div> : null
                        }
                    </div>
                </div>
			</Spin>
		);
	}
}

IpiecesDetail.contextTypes = {
    router: React.PropTypes.object.isRequired
};

// 将 store 中的数据作为 props 绑定到 IpiecesDetail 上
const mapStateToProps = (state, ownProps) => {
    let { Common, Ipieces } = state;
    return {
        loading: Common.loading,
        modalVisible: Common.modalVisible,
        ossClient: Common.ossClient,
        fileLists: Common.fileLists,
        sysDictItems: Common.sysDictItems,
        basicInfo: Ipieces.basicInfo,
        guarantee: Ipieces.guarantee,
        loanTopInfo: Ipieces.loanTopInfo,
        loanBasicInfo: Ipieces.loanBasicInfo,
        loanGuarantee: Ipieces.loanGuarantee
    }
}

// 将 action 作为 props 绑定到 IpiecesDetail 上。
const mapDispatchToProps = (dispatch, ownProps) => ({
    actions: bindActionCreators({ setModal, getOssClient, uploadFile, getSysDict, getLoanTop, getLoanBasic, getLoanGuarantee, postLoanCreditHis, getFileList, delOssFile, changeBasicRemark, changeGuaranteeRemark }, dispatch)
});

const Main = connect(mapStateToProps, mapDispatchToProps)(IpiecesDetail); // 连接redux

export default Main;
