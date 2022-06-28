

const mongoose = require('mongoose');
const Schema = mongoose.Schema
 
const TemplateCollecitonName =  'template'
const TemplateSchema = Schema({ 
    name:{
        type:String,
        required:true,
    }, 
    file: String, 
}, {
    toJSON: {
        virtuals: true,
    },
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }});
 
 
const TemplateModel = mongoose.model(TemplateCollecitonName,TemplateSchema)


module.exports = {
    TemplateModel,
    TemplateCollecitonName
}
