require('dotenv').config();
const _ = require('lodash');


function get(env, _default) {
    _default = _default || "";
    const varEnv = _.get(process.env, env, _default);
    return varEnv
}

function getOrFail(env){
    const varEnv = _.get(process.env, env);
    if(varEnv) return varEnv;
    throw new Error('Thiếu biến môi trường ' + env);
}

module.exports = {
    get,
    getOrFail
}