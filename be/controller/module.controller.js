const { TemplateModel } = require("../models/TemplateModel");
const { VulnerabilityModel } = require("../models/VulnerabilityModel");
const { successResponse, errorResponse } = require("../services/response.service");
const { exportFromTemplate } = require("./docx.controller");


const getVulnerability = async (req,res) => {
    let value = await VulnerabilityModel.find({});
    return res.json( successResponse(value) )
}



const exportDocx = async (req,res) => {
 
    checkAddVol( req.body.nodes)
    let buffer = await  exportFromTemplate(req.body.template, req.body.nodes, req.body.name)
    if (buffer == null) {
        res.json(errorResponse(""))
        return 
    } 
    var fileName="output"
 
    res.set('Content-disposition', 'attachment; filename=' + `${fileName}.docx`);
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    res.end(new Buffer(buffer, 'base64'));
}

const checkAddVol = async (nodes) => {
    for (var k of nodes) {
        for ( item of k.children) {
            let name = item["name"]
            let oldItem = await VulnerabilityModel.find({name: name})
            if (oldItem == null) {
                let newItem = new VulnerabilityModel({
                    name:  item["name"],
                    level: item.attributes["level"],
                    description: item.attributes["description"],
                })
                await newItem.save() 
           }
        }
    }
}

const addOrUpdateTemplate = async (req, res) => {
    let id  = req.body["id"]
    if (id != null) {
       await TemplateModel.findByIdAndUpdate({_id: id}, {
            file: req.body["file"],
            name: req.body["name"]
        })
    } else {
        let template = new TemplateModel( {
            file: req.body["file"],
            name: req.body["name"]
        }) 
        await template.save()
    }
    return res.json(successResponse({}))
}

const getListTemplate = async (req, res) => {
    let templates = await TemplateModel.find({})
    return res.json(successResponse(templates))
}

const uploadTemplateFile = async (req, res) => {
    const file = req.file
    const name = req.body["name"]

    if (!file || !name) {  
        return res.json(errorResponse('Please upload a file and give a name'))
    } 

    if (file.ext != null && file.ext != ".docx") {
        return res.json(errorResponse('Please upload a docx file'))
    }
    
    let template = new TemplateModel( {
        file: file.path,
        name: name
    })
    let saved =  await template.save()
    
    res.json(successResponse(saved))
}

const deleteTemplate =  async (req,res) => {
    var id = req.query.id;
    await TemplateModel.findOneAndDelete({_id: id})
    res.json(successResponse({}))
}

const addVulnerability = async (req,res) => {
    var vulnearbility = new VulnerabilityModel(req.body);
    await vulnearbility.save();
    res.json(successResponse({}))
}
const deleteVulnerability = async (req,res) => {
    var id = req.query.id;
    await VulnerabilityModel.findOneAndDelete({_id: id})
    res.json(successResponse({}))
}

module.exports = {
    getVulnerability,
    exportDocx,
    getListTemplate,
    addOrUpdateTemplate, 
    uploadTemplateFile,

    deleteTemplate,
    addVulnerability,
    deleteVulnerability
}