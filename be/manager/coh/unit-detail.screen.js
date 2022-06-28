
const { CohEntityModel } = require("../../models/CohEntityModel");
const { CommanderModel } = require("../../models/CommanderModel")
const { EntityResourceModel } = require("../../models/EntityResourceModel")
const { commandersScreenTabs, commandersTabTitle, screens, widgets } = require("./coh.type")


const getScreen = async (payload) => {
    let { id } = payload
    var resultData = []
    let unit = await CohEntityModel.findOne({_id: id })
    let resourceUnit = await EntityResourceModel.findOne({_id: id })
 
    resultData.push({
        type: widgets.commanderDesc,
        data: {
            title:"Description",
            content: unit.description
        }
    })

    resultData.push({
        type: widgets.commanderDesc,
        data: {
            title:"bio",
            content: unit.bio
        }
    })

    resultData.push({
        type: widgets.unitAction,
        data: { 
        }
    })

    if (resourceUnit.produces && resourceUnit.produces.length > 0) {
        let produces = await CohEntityModel.find({
            '_id': { $in: resourceUnit.produces.map(m=>m.id) }
        })

        let resultX1 = [];
        for (var k in produces) {
            let item = produces[k].toJSON();;
            let screen = null
            if (item.type == "UNIT" || item.type == "TANK") {
                screen = screens.unitDetail
            } else  if (item.type == "BUILDING") {
                screen = screens.buildingDetail
            }

            resultX1.push({
                title: item.name,
                description: item.description,
                content: item.content,
                thumb: item.thumb,
                manpower: resourceUnit.produces[k].manpower,
                pop_cap: resourceUnit.produces[k].pop_cap,
                munition: resourceUnit.produces[k].munition,
                fuel: resourceUnit.produces[k].fuel,
                level: resourceUnit.produces[k].level,
                screen: screen,
                payload: {
                    id: item._id
                }
            })
        }
        
        resultData.push({
            type: widgets.unitGroups,
            data:  produces
        })
    }

    if (resourceUnit.abilities && resourceUnit.abilities.length > 0) {
        let abilities = await CohEntityModel.find({
            '_id': { $in: resourceUnit.abilities.map(m=>m.id)}
        })
        
        let resultX1 = [];
        for (var k in abilities) {
            let item = abilities[k].toJSON();;
            let screen = null
            if (item.type == "UNIT" || item.type == "TANK") {
                screen = screens.unitDetail
            } else  if (item.type == "BUILDING") {
                screen = screens.buildingDetail
            }

            resultX1.push({
                title: item.name,
                description: item.description,
                content: item.content,
                thumb: item.thumb,
                manpower: resourceUnit.abilities[k].manpower,
                pop_cap: resourceUnit.abilities[k].pop_cap,
                munition: resourceUnit.abilities[k].munition,
                fuel: resourceUnit.abilities[k].fuel,
                level: resourceUnit.abilities[k].level,
                screen: screen,
                payload: {
                    id: item._id
                }
            })
        }

        resultData.push({
            type: widgets.unitGroups,
            data:  resultX1
        })
    }

    if (resourceUnit.upgrades && resourceUnit.upgrades.length > 0) {
        let upgrades = await CohEntityModel.find({
            '_id': { $in: resourceUnit.upgrades.map(m=>m.id) }
        })

        let resultX1 = [];
        for (var k in upgrades) {
            let item = upgrades[k].toJSON();;
            let screen = null
            if (item.type == "UNIT" || item.type == "TANK") {
                screen = screens.unitDetail
            } else  if (item.type == "BUILDING") {
                screen = screens.buildingDetail
            }

            resultX1.push({
                title: item.name,
                description: item.description,
                content: item.content,
                thumb: item.thumb,
                manpower: resourceUnit.upgrades[k].manpower,
                pop_cap: resourceUnit.upgrades[k].pop_cap,
                munition: resourceUnit.upgrades[k].munition,
                fuel: resourceUnit.upgrades[k].fuel,
                level: resourceUnit.upgrades[k].level,
                screen: screen,
                payload: {
                    id: item._id
                }
            })
        }

        resultData.push({
            type: widgets.unitGroups,
            data:  resultX1
        })
    }

 

    return {
        screen: screens.unitDetail, 
        info: unit,
        data: resultData,
        header: {
            title: unit.name,
            thumb: unit.thumb,
            button: {
                title: "State",
                icon:"btn-state",
                color:"#643CB9", 
                action: "bottom-sheet",
                payload:{
                    id: unit._id,
                    type: "view.state"
                }
            }
        }
    }
}

const getScreenMoreData = async (payload) => {

}


module.exports = {
    getScreen,
    getScreenMoreData
}