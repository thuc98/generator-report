const { CohEntityModel } = require("../../models/CohEntityModel")
const { CommanderGuiModel } = require("../../models/ComanderGuiModel")
const { CommanderModel } = require("../../models/CommanderModel")
const { codDetailTabs, codDetailTabsTitle, screens, widgets } = require("./coh.type")

const getScreen = async (payload) => {
    let { subtab, id } = payload  
    var resultData = []

    if (subtab == null) {
        subtab = codDetailTabs.profile
    } 

    let commander = await CommanderModel.findOne({_id: id});

    if (subtab ==  codDetailTabs.profile) {
        resultData.push({
            type: widgets.commanderChart,
            data: commander.parameter
        })
    
        resultData.push({
            type: widgets.commanderDesc,
            data: {
                title:"Description",
                content: commander.description
            }
        })

        resultData.push({
            type: widgets.commanderDesc,
            data: {
                title:"Bio",
                content: commander.bio
            }
        })
     } 
     else if (subtab ==  codDetailTabs.ability) {
        resultData.push({
            type: widgets.commanderNav
        })
        
        let listAblity = await CohEntityModel.find({
            '_id': { $in: commander.abilities.map(m=>m.id)}
        }) 

        
        for (var k in listAblity) {
            let item = listAblity[k].toJSON();
            let screen = null

            if (item.type == "UNIT" || item.type == "TANK") {
                screen = screens.unitDetail
            } else  if (item.type == "BUILDING") {
                screen = screens.buildingDetail
            } 
            resultData.push({type: "ablity.widget" , data: {
                title: item.name,
                description: item.description,
                content: item.content,
                thumb: item.thumb,
                manpower: commander.abilities[k].manpower,
                pop_cap: commander.abilities[k].pop_cap,
                munition: commander.abilities[k].munition,
                fuel: commander.abilities[k].fuel,
                level: commander.abilities[k].level,
                screen: screen,
                payload: {
                    id: item._id
                }
            }})
        }


     } else if (subtab ==  codDetailTabs.guiding) {
        
        let guiding = await CommanderGuiModel.findOne({_id: id})
        if (guiding != null)  { 
            resultData.push({
                type: widgets.commanderDesc,
                data: {
                    title:"Common",
                    content: guiding.content
                }
            })  
            let ids =  guiding.units.map(m=>m.id)

            let units = await CohEntityModel.find({
                '_id': { $in: ids}
            });

            for (var k in guiding.units) {
                let item = guiding.units[k]
                let unit = units[k]
                resultData.push( {
                    type: "guiding.widget",
                    data: {
                        id: item.id,
                        title: unit.name,
                        description : unit.description,
                        thumb: unit.thumb,
                        guiding: item.content
                    }
                })
            } 
        } 
     }

     var tabs = {...codDetailTabsTitle};

     for (var tab in tabs) { 
        tabs[tab].payload  = {
            "id": id,
		    "subtab": tab
        }
     }
    return {  
        screen: screens.commanderDetail, 
        subtab: subtab,
        tabs: tabs,
        data: resultData, 
        info:  commander,
        header: {
            title: commander.name,
            thumb: commander.thumb,
            button: {
                title: "Add Loadout",
                icon:"btn-add-layout",
                color:"#643CB9", 
                action: "add-layout",
                payload:{
                    id: commander._id, 
                }
            },
            tags: commander.tags
        }
    } 
}

const getScreenMoreData = async (payload) => {

}


module.exports = {
    getScreen,
    getScreenMoreData
}