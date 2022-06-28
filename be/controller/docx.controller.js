
const path = require('path');
const PizZip = require('pizzip');
const fs = require('fs')
const util = require('util')
const asyncReadFile = util.promisify(fs.readFile);
const asyncWriteFile = util.promisify(fs.writeFile);
const pixcelUnit = 37.7952755906

const Docxtemplater = require('docxtemplater');
const ChartModule = require('../libs/docxtemplater-chart-module')
 
var imageModule= null//new ImageModule(imageOpts);
var chartModule= new ChartModule();


const main = async () => {
    const templateFile = await  asyncReadFile("temp2.docx")
  

    const zip = new PizZip(templateFile);   
    let outputDocument = new Docxtemplater(zip, {
        modules:[imageModule, chartModule]
    });
    
    var date = new Date(); 
	const dataToAdd = { 
        name:"KẾT QUẢ ĐÁNH GIÁ AN TOÀN THÔNG TIN ỨNG DỤNG",
        reportDate:  "Ngày "+ date.getDate() +" Tháng " + (date.getMonth() + 1) + " Năm " + date.getFullYear(),
        totalVulnerability: 10,
        logo: "logo.png",
        chart: {
            lines: [
              {
                name: 'line 1',
                data: [
                  {
                    x: 'day 1',
                    y: '4.3'
                  },
                  {
                    x: 'day 2',
                    y: '2.5'
                  },
                  {
                    x: 'day 3',
                    y: '3.5'
                  }
                ]
              },
              {
                name: 'line 2',
                data: [
                  {
                    x: 'day 1',
                    y: '2.4'
                  },
                  {
                    x: 'day 2',
                    y: '4.4'
                  },
                  {
                    x: 'day 3',
                    y: '1.8'
                  }
                ]
              }
            ]
          },
        apps:[{
            index: 0,
            name: "Ứng dụng số 1",
            ver:"1.0.1",
            type:"web",
            env:"UAT",
            region: "public",
            linkInstall:"asdasd adasd asd adad",
            linkSource:"adasd asd asd asd asd",
            revision:1,
            fixedRevision: 1,
            vulnerabilities: [
                {
                    name:"Injection", 
                    index: 1,
                    level:"Critical",
                    count: 1,
                    note:"Có",
                    status:"OK"
                }
            ]
        },
        {
            index: 1,
            name: "Ứng dụng số 2",
            ver:"1.0.0",
            type:"mobile",
            env:"UAT",
            region: "public",
            linkInstall:"asdasd adasd asd adad",
            linkSource:"adasd asd asd asd asd",
            revision:1,
            fixedRevision: 1
        }]   
    };
    
	outputDocument.setData(dataToAdd);
    outputDocument.render()
    outputDocumentBuffer = outputDocument.getZip().generate({ type: 'nodebuffer' });
    asyncWriteFile("output2.docx", outputDocumentBuffer)

}


const createAppsJSON = (nodes) => {
    var apps = []
    for (var app of nodes) {
        var vulnerabilities = []

        for (var vul of app.children) {
            vulnerabilities.push( {
                name: vul.name, 
                description: vul.attributes["description"]  || "", 
                index: vulnerabilities.length + 1,
                level:  vul.attributes["level"] || "", 
                count:  vul.attributes["count"] || "", 
                note:  vul.attributes["note"] || "", 
                status: vul.attributes["status"] || "", 
            })
        }
        
        apps.push({
            index: apps.length + 1,
            name: app["name"]|| "",
            description: app.attributes["description"]  || "", 
            ver: app.attributes["version"] || "",
            type: app.attributes["type"] || "",
            env: app.attributes["env"] | "",
            region: app.attributes["region"] | "",
            linkInstall: app.attributes["download"]| "",
            linkSource:  app.attributes["linkSource"]|| "",
            revision: app.attributes["revision"] || "",
            fixedRevision: app.attributes["fixedRevision"] || "",
            vulnerabilities: vulnerabilities
        })
    }
    return apps
}
const createAppChart = (nodes) => {
   
}

 

const exportFromTemplate = async (template, nodes, name) => {
    const templateFile = await  asyncReadFile(template.file)
    const zip = new PizZip(templateFile);   
    var outputDocument = {

    }
    try {
        outputDocument = new Docxtemplater(zip, {
            modules:[chartModule]
        });
    } catch(e) {
        outputDocument = new Docxtemplater(zip);
    }
    var date = new Date(); 
    var apps= createAppsJSON(nodes);

    const countVul = (apps) => {
        var total = 0;
        for (var app of apps) {
            total = total + app.vulnerabilities.length
        }
        return total;
    }
    dataToAdd = {
        name: name,
        reportDate:  "Ngày "+ date.getDate() +" Tháng " + (date.getMonth() + 1) + " Năm " + date.getFullYear(),
        totalVulnerability: countVul(apps),
        apps: apps,
        chart:  {
            lines: [
              {
                name: 'line 1',
                data: [
                  {
                    x: 'day 1',
                    y: '4.3'
                  },
                  {
                    x: 'day 2',
                    y: '2.5'
                  },
                  {
                    x: 'day 3',
                    y: '3.5'
                  }
                ]
              },
              {
                name: 'line 2',
                data: [
                  {
                    x: 'day 1',
                    y: '2.4'
                  },
                  {
                    x: 'day 2',
                    y: '4.4'
                  },
                  {
                    x: 'day 3',
                    y: '1.8'
                  }
                ]
              }
            ]
          }
    }

    outputDocument.setData(dataToAdd);
    outputDocument.render()
    outputDocumentBuffer = outputDocument.getZip().generate({ type: 'nodebuffer' });
    return outputDocumentBuffer

}

module.exports = {exportFromTemplate}