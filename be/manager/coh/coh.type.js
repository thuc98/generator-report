

const screens = {
    home:  "home.screen",
    news:  "news.screen",
    commanders: "commander.screen",
    commanderDetail: "commander-detail.screen",
    unitDetail: "unit-detail.screen",
    buildingDetail: "building-detail.screen"
}

const codDetailTabs = {
    profile:"commander.profile",
    ability:"commander.ability",
    guiding:"commander.guiding",
    advstr: "commander.avdstr"
}

const codDetailTabsTitle = {
    "commander.profile":{
        title: "Profile",
        status: "enable"
    },
    "commander.ability":{
        title: "Ability",
        status: "enable"
    },
    "commander.guiding":{
        title: "Guiding",
        status: "enable"
    },
    "commander.avdstr":{
        title: "Advanced Strategy",
        status: "lock"
    },
    
}
const commandersScreenTabs = {
    commanders: "commander.commanders",
    units:"commander.units",
    bulding: "commander.building"
}


const commandersTabTitle ={
    "commander.commanders":{
        title: "Commanders",
        status: "enable"
    },
    "commander.units":{
        title:  "Unit",
        status: "enable"
    },
    "commander.building":{
        title: "Building",
        status: "enable"
    }
}

const widgets =  {
    homeBanner : "home.banner",
    homeCommanders: "home.commanders",
    homeFactions: "home.factions",
    homeDonate: "home.donate",
    homeNews: "home.news",
    commanderChart: "commander.chart",
    commanderDesc: "commander.description", 
    commanderNav: "commander.navigator", 
    unitAction: "unit.actions",
    unitGroups: "unit.groups"
}

const getBannerWidget = (news) => {
    return {
        thumb: news.thumb,
        title: news.title,
        description: news.description,
        order: news.order,
        screen: screens.news,
        created_at: news.created_at,
        payload: {id: news.id}
    }
}


const getFactionWiget = (faction) => {
    return {
        thumb: faction.thumb,
        title: faction.name,
        description: faction.description,
        order: 0,
        screen: screens.commanders,
        created_at: faction.created_at,
        payload: {id: faction._id}
    }
}

const getNewsWidget = (news)=>{
    return {
        thumb: news.thumb,
        title: news.title,
        description: news.description, 
        screen: screens.news,
        created_at: news.created_at,
        payload: {id: news.id}
    }
}



const getCommanderWidget = (commander) => {
    return {
        thumb: commander.thumb,
        title: commander.name,
        description: commander.description,
        order: 0,
        screen: screens.commanderDetail,
        created_at: commander.created_at,
        payload: {id: commander._id}
    }
}

module.exports = {
    codDetailTabs,
    codDetailTabsTitle,
    commandersTabTitle,
    commandersScreenTabs,
    screens,
    widgets,
    getBannerWidget,
    getFactionWiget,
    getNewsWidget,
    getCommanderWidget
}

