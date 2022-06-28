var ChartMaker, ChartManager, ChartModule, SubContent, fs;

SubContent = require('docxtemplater').SubContent;

ChartManager = require('./chartManager');

ChartMaker = require('./chartMaker');

fs = require('fs');
moduleName = "chart-module"
ChartModule = (function() {
  class ChartModule {
   
    /**
     * initialize options with empty object if not recived
     * @manager = ModuleManager instance
     * @param  {Object} @options params for the module
     */
    constructor(options1 = {}) {
      this.options = options1;
    }
    parse(placeHolderContent){
      var module = moduleName;
			var type = "content";
			if (placeHolderContent.substring(0, 2) === "$") {
				return { type: type, value: placeHolderContent.substr(2), module: module };
			}
			if (placeHolderContent.substring(0, 1) === "$") {
				return { type: type, value: placeHolderContent.substr(1), module: module };
			}
			return null;
    }

    postparse(parsed) {

    }

    set(options) {
			if (options.zip) {
				this.zip = options.zip;
			}
			if (options.xmlDocuments) {
				this.xmlDocuments = options.xmlDocuments;
			}
		}


    render(part, options) {
      if (!part.type === "content" || part.module !== moduleName) {
				return null;
			} 
      var tagValue = options.scopeManager.getValue(part.value, {});
			if (!tagValue) {
				return { value: this.fileTypeConfig.tagTextXml };
			}
      var result = this.getChart(part,options) 
      console.log(result)
      return { value: result};
		}

    handleEvent(event, eventData) {
     
      if (event === 'rendering-file') {
       
        this.renderingFileName = eventData; 
        this.chartManager = new ChartManager(this.zip, this.renderingFileName);
        return this.chartManager.loadChartRels();
      } else if (event === 'rendered') {
        console.log('render')
        return this.finished();
      }
    }
  

    on(event, data) {
      if (event === 'error') {
        throw data;
      } 
    }

    replaceBy(text, outsideElement) {
      var subContent, templaterState, xmlTemplater;
      xmlTemplater = this.manager.getInstance('xmlTemplater');
      templaterState = this.manager.getInstance('templaterState');
      subContent = new SubContent(xmlTemplater.content).getInnerTag(templaterState).getOuterXml(outsideElement);
      return xmlTemplater.replaceXml(subContent, text);
    }

    convertPixelsToEmus(pixel) {
      return Math.round(pixel * 9525);
    }

    extendDefaults(options) {
      var deepMerge, defaultOptions, result;
      deepMerge = function(target, source) {
        var key, next, original;
        for (key in source) {
          original = target[key];
          next = source[key];
          if (original && next && typeof next === 'object') {
            deepMerge(original, next);
          } else {
            target[key] = next;
          }
        }
        return target;
      };
      defaultOptions = {
        width: 5486400 / 9525,
        height: 3200400 / 9525,
        grid: true,
        border: true,
        title: false, // works only for single-line charts
        legend: {
          position: 'r' // 'l', 'r', 'b', 't'
        },
        axis: {
          x: {
            orientation: 'minMax', // 'maxMin'
            min: void 0, // number
            max: void 0,
            type: void 0, // 'date'
            date: {
              format: 'unix',
              code: 'mm/yy', // "m/yy;@"
              unit: 'months', // "days"
              step: '1'
            }
          },
          y: {
            orientation: 'minMax',
            mix: void 0,
            max: void 0
          }
        }
      };
      result = deepMerge({}, defaultOptions);
      result = deepMerge(result, options);
      return result;
    }

    convertUnixTo1900(chartData, axName) {
      var convertOption, data, i, j, len, len1, line, ref, ref1, unixTo1900;
      unixTo1900 = function(value) {
        return Math.round(value / 86400 + 25569);
      };
      convertOption = function(name) {
        if (chartData.options.axis[axName][name]) {
          return chartData.options.axis[axName][name] = unixTo1900(chartData.options.axis[axName][name]);
        }
      };
      convertOption('min');
      convertOption('max');
      ref = chartData.lines;
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        ref1 = line.data;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          data = ref1[j];
          data[axName] = unixTo1900(data[axName]);
        }
      }
      return chartData;
    }

    replaceTag() {
      var ax, chart, chartData, chartId, filename, gen, imageRels, name, newText, options, scopeManager, tag, tagXml, templaterState;
      scopeManager = this.manager.getInstance('scopeManager');
      templaterState = this.manager.getInstance('templaterState');
      gen = this.manager.getInstance('gen');
      tag = templaterState.textInsideTag.substr(1); // tag to be replaced
      chartData = scopeManager.getValueFromScope(tag); // data to build chart from
      if (chartData == null) {
        return;
      }
      // create a unique filename so we can have multiple charts from one tag, via the loop functionality in docxtemplater
      // Note the +1 isn't really required, it just makes the number the same as the associated rel, handy for debugging the resulting docx	
      filename = tag + (this.chartManager.maxRid + 1);
      imageRels = this.chartManager.loadChartRels();
      if (!imageRels) { // break if no Relationships loaded
        return;
      }
      chartId = this.chartManager.addChartRels(filename);
      options = this.extendDefaults(chartData.options);
      for (name in options.axis) {
        ax = options.axis[name];
        if (ax.type === 'date' && ax[ax.type].format === 'unix') {
          chartData = this.convertUnixTo1900(chartData, name);
        }
      }
      chart = new ChartMaker(this.zip, options);
      chart.makeChartFile(chartData.lines);
      chart.writeFile(filename);
      tagXml = this.manager.getInstance('xmlTemplater').fileTypeConfig.tagsXmlArray[0];
      newText = this.getChartXml({
        chartID: chartId,
        width: this.convertPixelsToEmus(options.width),
        height: this.convertPixelsToEmus(options.height)
      });
      return this.replaceBy(newText, tagXml);
    }

    getChart(part, options) {
      var tag = part.value;
      var chartData = options.scopeManager.getValue(tag, {})
      this.chartManager = new ChartManager(this.zip, "chart");

      if (!chartData) {
				return { value: this.fileTypeConfig.tagTextXml };
			}

     
      var imageRels = this.chartManager.loadChartRels();
      var  filename = tag + (this.chartManager.maxRid + 1);
      if (!imageRels) { // break if no Relationships loaded
        return   { value: this.fileTypeConfig.tagTextXml };
      }

      var chartId = this.chartManager.addChartRels(filename);
      options = this.extendDefaults(chartData.options);
      for (var name in options.axis) {
        var ax = options.axis[name];
        if (ax.type === 'date' && ax[ax.type].format === 'unix') {
          chartData = this.convertUnixTo1900(chartData, name);
        }
      }

      var chart = new ChartMaker(this.zip, options);
      chart.makeChartFile(chartData.lines);
      chart.writeFile(filename);
    
      return this.getChartXml({
        chartID: chartId,
        width: this.convertPixelsToEmus(options.width),
        height: this.convertPixelsToEmus(options.height)
      });
      

    }

    getChartXml({chartID, width, height}) {
      return `<w:drawing><wp:inline distB="0" distL="0" distR="0" distT="0"><wp:extent cx="${width}" cy="${height}"/><wp:effectExtent b="0" l="0" r="0" t="0"/><wp:docPr id="1" name="Диаграмма 1"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart r:id="rId${chartID}" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></a:graphicData></a:graphic></wp:inline></w:drawing>`;
    }


    optionsTransformer(options, docxtemplater) {
			var relsFiles = docxtemplater.zip.file(/\.xml\.rels/).concat(docxtemplater.zip.file(/\[Content_Types\].xml/)).map(function (file) {
				return file.name;
			});
			this.fileTypeConfig = docxtemplater.fileTypeConfig;
			this.fileType = docxtemplater.fileType;
			this.zip = docxtemplater.zip;
			options.xmlFileNames = options.xmlFileNames.concat(relsFiles);
			return options;
		} 

  };

  /**
   * self name for self-identification, variable for fast changing;
   * @type {String}
   */
  ChartModule.prototype.name = 'chart';

  return ChartModule;
  

}).call(this);

module.exports = ChartModule;
