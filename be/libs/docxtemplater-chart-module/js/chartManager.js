var ChartManager, DocUtils;

DocUtils = require('./docUtils');

module.exports = ChartManager = class ChartManager {
  constructor(zip, fileName) {
    this.zip = zip;
    this.fileName = fileName;
    this.endFileName = this.fileName.replace(/^.*?([a-z0-9]+)\.xml$/, "$1");
    this.relsLoaded = false;
  }

  /**
   * load relationships
   * @return {ChartManager} for chaining
   */
  loadChartRels() {
    var RidArray, content, file, loadFile, tag;
    // console.log('loadChartRels')
    /**
     * load file, save path
     * @param  {String} filePath path to current file
     * @return {Object}          file
     */
    loadFile = (filePath) => {
      this.filePath = filePath;
      // console.log('loading file: ' + @filePath)
      return this.zip.files[this.filePath];
    };
    file = loadFile(`word/_rels/${this.endFileName}.xml.rels`) || loadFile("word/_rels/document.xml.rels"); //duct tape hack, doesn't work otherwise
    if (file === void 0) {
      return;
    }
    content = DocUtils.decodeUtf8(file.asText());
    this.xmlDoc = DocUtils.Str2xml(content);
    RidArray = (function() {
      var i, len, ref, results;
      ref = this.xmlDoc.getElementsByTagName('Relationship');
      //Get all Rids
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        tag = ref[i];
        results.push(parseInt(tag.getAttribute("Id").substr(3)));
      }
      return results;
    }).call(this);
    this.maxRid = DocUtils.maxArray(RidArray);
    // console.log @xmlDoc
    this.chartRels = [];
    this.relsLoaded = true;
    return this;
  }

  addChartRels(chartName) {
    // console.log('addChartRels')
    // console.log('name: ' + chartName)
    if (!this.relsLoaded) {
      return;
    }
    this.maxRid++;
    this._addChartRelationship(this.maxRid, chartName);
    this._addChartContentType(chartName);
    this.zip.file(this.filePath, DocUtils.encodeUtf8(DocUtils.xml2Str(this.xmlDoc)), {});
    return this.maxRid;
  }

  /**
   * add relationship tag to relationships
   * @param {Number} id   relationship ID
   * @param {String} name target file name
   */
  _addChartRelationship(id, name) {
    var newTag, relationships;
    relationships = this.xmlDoc.getElementsByTagName("Relationships")[0];
    newTag = this.xmlDoc.createElement('Relationship');
    newTag.namespaceURI = null;
    newTag.setAttribute('Id', `rId${id}`);
    newTag.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart');
    newTag.setAttribute('Target', `charts/${name}.xml`);
    return relationships.appendChild(newTag);
  }

  /**
   * add override to [Content_Types].xml
   * @param {String} name filename
   */
  _addChartContentType(name) {
    var content, file, newTag, path, types, xmlDoc;
    path = '[Content_Types].xml';
    file = this.zip.files[path];
    content = DocUtils.decodeUtf8(file.asText());
    xmlDoc = DocUtils.Str2xml(content);
    types = xmlDoc.getElementsByTagName("Types")[0];
    newTag = xmlDoc.createElement('Override');
    newTag.namespaceURI = 'http://schemas.openxmlformats.org/package/2006/content-types';
    newTag.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.drawingml.chart+xml');
    newTag.setAttribute('PartName', `/word/charts/${name}.xml`);
    types.appendChild(newTag);
    return this.zip.file(path, DocUtils.encodeUtf8(DocUtils.xml2Str(xmlDoc)), {});
  }

};
