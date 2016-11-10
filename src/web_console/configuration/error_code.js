/**
 * Created by Strawmanbobi
 * 2014-08-30
 */

function ErrorCode() {
    this.SUCCESS = {
        code: 0,
        cause: "成功"
    };
    this.FAILED = {
        code: -1,
        cause: "网络故障，请稍后再试"
    };
    this.WRONG_ENV = {
        code: -2,
        cause: "错误的运行环境配置"
    }

    // Common error
    this.AUTHENTICATION_FAILURE = {
        code: 1,
        cause: "用户验证失败，请重新登录"
    };
    this.INVALID_CATEGORY = {
        code: 2,
        cause: "不存在的电器品类"
    };
    this.INVALID_BRAND = {
        code: 3,
        cause: "不存在的品牌"
    };
    this.INVALID_PARAMETER = {
        code: 4,
        cause: "参数错误"
    };

    this.DUPLICATED_REMOTE_CODE = {
        code: 10,
        cause: "遥控码重复"
    }
}

module.exports = ErrorCode;