const { successResponse, errorResponse } = require("../services/response.service")

const _getScreen = async (screen, payload) => {
    const screenNode = require("./coh/"+screen)
    if (screenNode == null) {
        throw "Screen not found"
    } 
    return  screenNode.getScreen(payload)
}
const _getMoreDataScreen = async (screen, payload) => {
    const screenNode = require("./coh/"+screen)
    if (screenNode == null) {
        throw "Screen not found"
    } 
    return  screenNode.getScreenMoreData(payload)
}
 
const getScreenInfo = async (data) => {
   let {screen, payload} = data
   return  await _getScreen(screen,payload)
}

const getScreenMoreData = async (data) => {
    let {screen, payload} = data
    return _getMoreDataScreen(screen, payload)
}

module.exports = {
    getScreenInfo,
    getScreenMoreData
}
