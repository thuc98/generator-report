const {
    getVulnerability,
    exportDocx,
    getListTemplate,
    addOrUpdateTemplate, 
    uploadTemplateFile,

    deleteTemplate,
    addVulnerability,
    deleteVulnerability

} = require("../controller/module.controller");

const multer = require('multer');
var path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'template')
    },
    filename: function (req, file, cb) {
       let ext =  path.extname(file.originalname)
       file.ext = ext
       cb(null,  "template-"+ Date.now()  +  ext)
       
    }
  })
   
var upload = multer({ storage: storage })
 
function Routes(app) {
    app.get("/get-vulnerability",getVulnerability)
    app.post("/export-docx",exportDocx)
    app.get("/templates",getListTemplate)
    app.post("/update-template", addOrUpdateTemplate)
    app.post("/upload-template", upload.single('file') ,uploadTemplateFile)

    app.delete("/delete-template", deleteTemplate)
    app.delete("/delete-vulnerability", deleteVulnerability)
    app.post("/add-vulnerability", addVulnerability)
    

}


module.exports = Routes;
