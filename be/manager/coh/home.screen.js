const { CommanderModel } = require("../../models/CommanderModel")
const { FactionModel } = require("../../models/FactionModel")
const { NewsModel } = require("../../models/NewsModel")
const { 
    getBannerWidget,
    getFactionWiget,
    getNewsWidget,
    getCommanderWidget,
    screens, widgets } = require("./coh.type")
 
const getScreen  = async (payload) => {
    
    let screenData = []
    let bannerNews = (await NewsModel.find({pinTohome: true}).limit(5)).map((m)=>getBannerWidget(m.toJSON()))
    let factions  =  (await FactionModel.find()).map((m)=>getFactionWiget(m.toJSON()))

   // let commanders  =  (await CommanderModel.aggregate([{$sample: {size: 6}}])).map((m)=>getCommanderWidget(m))
   let commanders  =  (await CommanderModel.find().sort({created_at: -1}).limit(6)).map((m)=>getCommanderWidget(m))
    
    let news = (await NewsModel.find().sort({created_at: -1}).limit(4)).map((m)=>getNewsWidget(m.toJSON()))

    if (bannerNews.length > 0) {
        screenData.push( {
            type: widgets.homeBanner,
            data: bannerNews
        })
    }

    if (factions.length > 0) {
        screenData.push({
            type: widgets.homeFactions,
            data: factions
        })
    }

    if (commanders.length > 0) {
        screenData.push({
            type: widgets.homeCommanders,
            data: commanders
        })
    }

    screenData.push ({
        type: widgets.homeDonate,
        data: {
            text: "Text donate  asd asd sd adsa dasd asd ada "
        }
    })


    if (news.length > 0) {
        screenData.push ({
            type: widgets.homeNews,
            data: news
        })
    }
    
 
    return {
        screen: screens.home,
        data:  screenData
    }
}


module.exports = {
    getScreen
}