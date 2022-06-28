
const { CohEntityModel } = require("../../models/CohEntityModel");
const { CommanderModel } = require("../../models/CommanderModel")
const { commandersScreenTabs, commandersTabTitle, screens } = require("./coh.type")


const getResultCommanders = async (factionId) => {
    let values = await CommanderModel.find({factionId: factionId})

    return values.map((m)=>{
        m = m.toJSON()
        return {
            type: "commander.widget",
            data: {
                id: m._id,
                screen: screens.commanderDetail,
                title: m.name,
                thumb: m.thumb,
                description: m.description,
                tags: m.tags, 
                code: m.code,
                payload:{
                    id:  m._id,
                }
            }
        }
    });
}

const getResultUnits = async (factionId) => {

    let values = await CohEntityModel.find({factionId: factionId, type:"UNIT"})
    return values.map((m)=>{
        m = m.toJSON()
        return  {
            type:"init.widget",
            data: {
                id: m._id,
                screen: screens.unitDetail,
                title: m.name,
                thumb: m.thumb,
                description: m.description,
                tags: m.tags, 
                code: m.code,
                manpower: m.manpower,
                munition: m.munition,
                fuel: m.fuel,
                payload:{
                    id:  m._id,
                }
            }
        }
    }); 
}

const getResultBuilding = async (factionId) => {
    let values = await CohEntityModel.find({factionId: factionId, type:"BUILDING"})
    return values.map((m)=>{
        m = m.toJSON()
        return {
            type:"building.widget",
            data: {
                id: m._id,
                screen: screens.buildingDetail,
                title: m.name,
                thumb: m.thumb,
                description: m.description,
                tags: m.tags, 
                code: m.code,
                manpower: m.manpower,
                munition: m.munition,
                fuel: m.fuel,
                payload:{
                    id:  m._id,
                }
            }
        }
    }); 
}


const getScreen = async (payload) => {
    let { subtab, id } = payload  
    var resultData = [];
    if (subtab == null) {
        subtab = commandersScreenTabs.commanders
    }

    if ( subtab == commandersScreenTabs.commanders) {
        resultData = await  getResultCommanders(id)
    } else  if ( subtab == commandersScreenTabs.units) {
        resultData = await  getResultUnits(id)
    } else  if ( subtab == commandersScreenTabs.units) {
        resultData = await  getResultBuilding(id)
    }

    var tabs = {...commandersTabTitle};
     for (tab in tabs) {
        tabs[tab].payload = {
            subtab: tab,
            id: id
        }
     }
    return {
        canSearch: true,
        screen: screens.commanders, 
        subtab: subtab,
        tabs: tabs,
        data: resultData
    }
}

const getScreenMoreData = async (payload) => {

}


module.exports = {
    getScreen,
    getScreenMoreData
}