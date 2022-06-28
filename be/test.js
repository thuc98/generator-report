const ENV = require('./utils/env');
const express = require('express');
const Routes = require("./routes");
var path = require("path");
const { CommanderModel } = require('./models/CommanderModel');
const { FactionModel } = require('./models/FactionModel');
const { CohEntityModel } = require('./models/CohEntityModel');
const { EntityResourceModel } = require('./models/EntityResourceModel');
const { NewsModel } = require('./models/NewsModel');
require("./start/db")();
const sf = (func) => {
    try {
        func()
    }catch { 
    }
}

const main = async () => {


    sf(async ()=>{
     /*   await new FactionModel( {
            thumb:"https://coh2.win/sites/default/files/2020-05/soviet.png",
            _id: "621917bc52834e2e29f41731",
            description:"Regimental Field Headquarters - base building of Soviet Army. The Combat Engineer Squad can produce 4 buildings in the base area",
            name: "Soviet Army"
        }).save(); 

        await new FactionModel( {
            thumb:"https://coh2.win/sites/default/files/2020-05/wermacht.png",
            _id:"621917bc52834e2e29f4173b",
            name: "Wehrmacht Ostheer",
            description: "Wehrmacht Ostheer starts with Kampfgruppe Headquarters (main building) that allows you to make phase escalation. "
        }).save(); 
    
        await new FactionModel( {
            thumb:"https://coh2.win/sites/default/files/2020-05/OKW.png",
            _id: "621917bc52834e2e29f4173c",
            name: "Oberkommando West",
            description:"Command Headquarters - the main building of Oberkommando West, capable of building an sWS Supply Half-track."
        }).save(); 
    
        await new FactionModel( {
            thumb:"https://coh2.win/sites/default/files/2020-05/americans.png",
            _id: "621917bc52834e2e29f41732",
            description:"Barracks is the main building of US Forces. The American base is a camp surrounded by bunkers, weapon packs and sandbags",
            name: "US Forces"
        }).save(); 
    
        await new FactionModel( {
            thumb:"https://coh2.win/sites/default/files/2020-05/british.png",
            _id: "621917bc52834e2e29f41733",
            description:"The British forces base is a complex of three buildings: the Field Headquarters - the main building, the Platoon Command Post (2nd building - can be activated in the Field Headquarters) and the Company Command Post (3rd building - can be activated in the Field Headquarters, but after activating the Platoon Command Post)",
            name: "British Forces"
        }).save(); 
    
     
        await new CohEntityModel({
            _id:"321917bc52834e2e29f41722",
            code:"secure-mode",
            name: "Secure Mode",
            description: "Allows to capture strategic points but cannot fire",
           }).save()
    
           await new CohEntityModel({
            _id:"321917bc52834e2e29f41721",
            code:"vehicle-crew-self-repair",
            name: "Vehicle Crew Self Repair",
            description: "Vehicle crews can repair battlefield damage on their vehicles once they leave combat with a repair rate of 10 HP/s."
        }).save()
        
    
           
       await new CohEntityModel({
        _id:"321917bc52834e2e29f41733",
        code:"radio-intercept",
        name: "Radio Intercept",
        description: "Intercepts enemy radio transmissions, providing valuable intel on enemy actions.",
       }).save()
    
    
       await new CohEntityModel({
        factionId:"621917bc52834e2e29f41731",
        type:"TANK",
        _id:"321917bc52834e2e29f41731",
        code:"radio-intercept",
        name: "t-3485-medium-tank",
        description: "The addition of a larger turret and more powerful ZiS-S-53 85mm gun to the robust and mobile T-34 gives this medium tank improved performance against enemy armor.",
        content:  "The addition of a larger turret and more powerful ZiS-S-53 85mm gun to the robust and mobile T-34 gives this medium tank improved performance against enemy armor, noi dung dai hon",
        manpower: 380,
        munition:14,
        fuel: 130,
       }).save()
    
       await EntityResourceModel( {
        _id:"321917bc52834e2e29f41731",
        photos:["https://coh2.win/sites/default/files/2020-06/Icons_portraits_vehicle_soviet_t34_85_s_portrait.png"],
        ablities:[
            "321917bc52834e2e29f41722",
            "321917bc52834e2e29f41721"
        ]
       }).save()
    */
        let commander = new CommanderModel( { 
                factionId:"621917bc52834e2e29f41731",
                code:"advanced-warfare-tactics",
                name: "Advanced Warfare Tactics",
                bio:"",
                description: "Gain vital intelligence and exploit enemy movements with PPSH equipped conscripts and the most powerful incarnation of the vaunted T-34 tank armed with a hard hitting 85mm cannon.",
                thumb:"https://coh2.win/sites/default/files/2021-10/sov-advanced-warfare.png",
                abilities:[
                    "321917bc52834e2e29f41733",
                    "321917bc52834e2e29f41731"
                ]
        })
       await commander.save()
    }) 
   
   /* sf( async ()=>{

        new NewsModel({
            title:"Halo Infinite -- Xbox Boss Discusses High-Level Staff Departures",
            thumb:"https://www.gamespot.com/a/uploads/screen_kubrick/1179/11799911/3909922-halomp.6fa9529a-fce4-4f4f-b24e-31c1fee3ce93.jpg"
        }).save()

        new NewsModel({
            title:"Destiny 2's New Trials Of Osiris Is Great, But Needs One Big Change",
            thumb:"https://www.gamespot.com/a/uploads/screen_kubrick_large/1581/15811374/3879613-trialsthumb.jpg"
        }).save()
        new NewsModel({
            title:"Street Fighter's Ryu, Chun-Li, And Akuma Come To Brawlhalla",
            thumb:" https://www.gamespot.com/a/uploads/original/1179/11799911/3909879-bhxsf_ryu2.png"
        }).save()

        new NewsModel({
            title:"Dying Light 1 Gets A Next-Gen Patch Improving Performance On PS5 And PS4 Pro",
            thumb:"https://www.gamespot.com/a/uploads/screen_petite/1694/16945412/3950547-horizonforbiddenwest2.jpg"
        }).save()
         
    })*/
    
}
main().then(()=>console.log("done"))