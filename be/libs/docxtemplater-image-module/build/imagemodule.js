(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ImageModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var DocUtils = require("docxtemplater").DocUtils;
DocUtils.convertPixelsToEmus = function (pixel) {
	return Math.round(pixel * 9525);
};
module.exports = DocUtils;
},{"docxtemplater":8}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DocUtils = require("./docUtils");
var extensionRegex = /[^.]+\.([^.]+)/;

var rels = {
	getPrefix: function getPrefix(fileType) {
		return fileType === "docx" ? "word" : "ppt";
	},
	getFileTypeName: function getFileTypeName(fileType) {
		return fileType === "docx" ? "document" : "presentation";
	},
	getRelsFileName: function getRelsFileName(fileName) {
		return fileName.replace(/^.*?([a-zA-Z0-9]+)\.xml$/, "$1") + ".xml.rels";
	},
	getRelsFilePath: function getRelsFilePath(fileName, fileType) {
		var relsFileName = rels.getRelsFileName(fileName);
		var prefix = fileType === "pptx" ? "ppt/slides" : "word";
		return prefix + "/_rels/" + relsFileName;
	}
};

module.exports = function () {
	function ImgManager(zip, fileName, xmlDocuments, fileType) {
		_classCallCheck(this, ImgManager);

		this.fileName = fileName;
		this.prefix = rels.getPrefix(fileType);
		this.zip = zip;
		this.xmlDocuments = xmlDocuments;
		this.fileTypeName = rels.getFileTypeName(fileType);
		this.mediaPrefix = fileType === "pptx" ? "../media" : "media";
		var relsFilePath = rels.getRelsFilePath(fileName, fileType);
		this.relsDoc = xmlDocuments[relsFilePath] || this.createEmptyRelsDoc(xmlDocuments, relsFilePath);
	}

	_createClass(ImgManager, [{
		key: "createEmptyRelsDoc",
		value: function createEmptyRelsDoc(xmlDocuments, relsFileName) {
			var mainRels = this.prefix + "/_rels/" + this.fileTypeName + ".xml.rels";
			var doc = xmlDocuments[mainRels];
			if (!doc) {
				var err = new Error("Could not copy from empty relsdoc");
				err.properties = {
					mainRels: mainRels,
					relsFileName: relsFileName,
					files: Object.keys(this.zip.files)
				};
				throw err;
			}
			var relsDoc = DocUtils.str2xml(DocUtils.xml2str(doc));
			var relationships = relsDoc.getElementsByTagName("Relationships")[0];
			var relationshipChilds = relationships.getElementsByTagName("Relationship");
			for (var i = 0, l = relationshipChilds.length; i < l; i++) {
				relationships.removeChild(relationshipChilds[i]);
			}
			xmlDocuments[relsFileName] = relsDoc;
			return relsDoc;
		}
	}, {
		key: "loadImageRels",
		value: function loadImageRels() {
			var iterable = this.relsDoc.getElementsByTagName("Relationship");
			return Array.prototype.reduce.call(iterable, function (max, relationship) {
				var id = relationship.getAttribute("Id");
				if (/^rId[0-9]+$/.test(id)) {
					return Math.max(max, parseInt(id.substr(3), 10));
				}
				return max;
			}, 0);
		}
		// Add an extension type in the [Content_Types.xml], is used if for example you want word to be able to read png files (for every extension you add you need a contentType)

	}, {
		key: "addExtensionRels",
		value: function addExtensionRels(contentType, extension) {
			var contentTypeDoc = this.xmlDocuments["[Content_Types].xml"];
			var defaultTags = contentTypeDoc.getElementsByTagName("Default");
			var extensionRegistered = Array.prototype.some.call(defaultTags, function (tag) {
				return tag.getAttribute("Extension") === extension;
			});
			if (extensionRegistered) {
				return;
			}
			var types = contentTypeDoc.getElementsByTagName("Types")[0];
			var newTag = contentTypeDoc.createElement("Default");
			newTag.namespaceURI = null;
			newTag.setAttribute("ContentType", contentType);
			newTag.setAttribute("Extension", extension);
			types.appendChild(newTag);
		}
		// Add an image and returns it's Rid

	}, {
		key: "addImageRels",
		value: function addImageRels(imageName, imageData, i) {
			if (i == null) {
				i = 0;
			}
			var realImageName = i === 0 ? imageName : imageName + ("(" + i + ")");
			var imagePath = this.prefix + "/media/" + realImageName;
			if (this.zip.files[imagePath] != null) {
				return this.addImageRels(imageName, imageData, i + 1);
			}
			var image = {
				name: imagePath,
				data: imageData,
				options: {
					binary: true
				}
			};
			this.zip.file(image.name, image.data, image.options);
			var extension = realImageName.replace(extensionRegex, "$1");
			this.addExtensionRels("image/" + extension, extension);
			var relationships = this.relsDoc.getElementsByTagName("Relationships")[0];
			var newTag = this.relsDoc.createElement("Relationship");
			newTag.namespaceURI = null;
			var maxRid = this.loadImageRels() + 1;
			newTag.setAttribute("Id", "rId" + maxRid);
			newTag.setAttribute("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image");
			newTag.setAttribute("Target", this.mediaPrefix + "/" + realImageName);
			relationships.appendChild(newTag);
			return maxRid;
		}
	}]);

	return ImgManager;
}();
},{"./docUtils":1}],3:[function(require,module,exports){
"use strict";

module.exports = {
	getImageXml: function getImageXml(rId, size) {
		return ("<w:drawing>\n\t\t<wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">\n\t\t\t<wp:extent cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t<wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>\n\t\t\t<wp:docPr id=\"2\" name=\"Image 2\" descr=\"image\"/>\n\t\t\t<wp:cNvGraphicFramePr>\n\t\t\t\t<a:graphicFrameLocks xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" noChangeAspect=\"1\"/>\n\t\t\t</wp:cNvGraphicFramePr>\n\t\t\t<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t\t\t<a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t<pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:cNvPr id=\"0\" name=\"Picture 1\" descr=\"image\"/>\n\t\t\t\t\t\t\t<pic:cNvPicPr>\n\t\t\t\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t\t\t\t</pic:cNvPicPr>\n\t\t\t\t\t\t</pic:nvPicPr>\n\t\t\t\t\t\t<pic:blipFill>\n\t\t\t\t\t\t\t<a:blip r:embed=\"rId" + rId + "\">\n\t\t\t\t\t\t\t\t<a:extLst>\n\t\t\t\t\t\t\t\t\t<a:ext uri=\"{28A0092B-C50C-407E-A947-70E740481C1C}\">\n\t\t\t\t\t\t\t\t\t\t<a14:useLocalDpi xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" val=\"0\"/>\n\t\t\t\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t\t\t\t</a:extLst>\n\t\t\t\t\t\t\t</a:blip>\n\t\t\t\t\t\t\t<a:srcRect/>\n\t\t\t\t\t\t\t<a:stretch>\n\t\t\t\t\t\t\t\t<a:fillRect/>\n\t\t\t\t\t\t\t</a:stretch>\n\t\t\t\t\t\t</pic:blipFill>\n\t\t\t\t\t\t<pic:spPr bwMode=\"auto\">\n\t\t\t\t\t\t\t<a:xfrm>\n\t\t\t\t\t\t\t\t<a:off x=\"0\" y=\"0\"/>\n\t\t\t\t\t\t\t\t<a:ext cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t\t\t\t<a:avLst/>\n\t\t\t\t\t\t\t</a:prstGeom>\n\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t<a:ln>\n\t\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t</a:ln>\n\t\t\t\t\t\t</pic:spPr>\n\t\t\t\t\t</pic:pic>\n\t\t\t\t</a:graphicData>\n\t\t\t</a:graphic>\n\t\t</wp:inline>\n\t</w:drawing>\n\t\t").replace(/\t|\n/g, "");
	},
	getImageXmlCentered: function getImageXmlCentered(rId, size) {
		return ("<w:p>\n\t\t\t<w:pPr>\n\t\t\t\t<w:jc w:val=\"center\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:r>\n\t\t\t\t<w:rPr/>\n\t\t\t\t<w:drawing>\n\t\t\t\t\t<wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">\n\t\t\t\t\t<wp:extent cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t\t\t<wp:docPr id=\"0\" name=\"Picture\" descr=\"\"/>\n\t\t\t\t\t<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t\t\t\t\t<a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t\t<pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:cNvPr id=\"0\" name=\"Picture\" descr=\"\"/>\n\t\t\t\t\t\t\t<pic:cNvPicPr>\n\t\t\t\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t\t\t\t</pic:cNvPicPr>\n\t\t\t\t\t\t\t</pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:blipFill>\n\t\t\t\t\t\t\t<a:blip r:embed=\"rId" + rId + "\"/>\n\t\t\t\t\t\t\t<a:stretch>\n\t\t\t\t\t\t\t\t<a:fillRect/>\n\t\t\t\t\t\t\t</a:stretch>\n\t\t\t\t\t\t\t</pic:blipFill>\n\t\t\t\t\t\t\t<pic:spPr bwMode=\"auto\">\n\t\t\t\t\t\t\t<a:xfrm>\n\t\t\t\t\t\t\t\t<a:off x=\"0\" y=\"0\"/>\n\t\t\t\t\t\t\t\t<a:ext cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t\t\t\t<a:avLst/>\n\t\t\t\t\t\t\t</a:prstGeom>\n\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t<a:ln w=\"9525\">\n\t\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t\t<a:miter lim=\"800000\"/>\n\t\t\t\t\t\t\t\t<a:headEnd/>\n\t\t\t\t\t\t\t\t<a:tailEnd/>\n\t\t\t\t\t\t\t</a:ln>\n\t\t\t\t\t\t\t</pic:spPr>\n\t\t\t\t\t\t</pic:pic>\n\t\t\t\t\t\t</a:graphicData>\n\t\t\t\t\t</a:graphic>\n\t\t\t\t\t</wp:inline>\n\t\t\t\t</w:drawing>\n\t\t\t</w:r>\n\t\t</w:p>\n\t\t").replace(/\t|\n/g, "");
	},
	getPptxImageXml: function getPptxImageXml(rId, size, offset) {
		return ("<p:pic>\n\t\t\t<p:nvPicPr>\n\t\t\t\t<p:cNvPr id=\"6\" name=\"Picture 2\"/>\n\t\t\t\t<p:cNvPicPr>\n\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t</p:cNvPicPr>\n\t\t\t\t<p:nvPr/>\n\t\t\t</p:nvPicPr>\n\t\t\t<p:blipFill>\n\t\t\t\t<a:blip r:embed=\"rId" + rId + "\" cstate=\"print\">\n\t\t\t\t\t<a:extLst>\n\t\t\t\t\t\t<a:ext uri=\"{28A0092B-C50C-407E-A947-70E740481C1C}\">\n\t\t\t\t\t\t\t<a14:useLocalDpi xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" val=\"0\"/>\n\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t</a:extLst>\n\t\t\t\t</a:blip>\n\t\t\t\t<a:srcRect/>\n\t\t\t\t<a:stretch>\n\t\t\t\t\t<a:fillRect/>\n\t\t\t\t</a:stretch>\n\t\t\t</p:blipFill>\n\t\t\t<p:spPr bwMode=\"auto\">\n\t\t\t\t<a:xfrm>\n\t\t\t\t\t<a:off x=\"" + offset.x + "\" y=\"" + offset.y + "\"/>\n\t\t\t\t\t<a:ext cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t\t</a:xfrm>\n\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t<a:avLst/>\n\t\t\t\t</a:prstGeom>\n\t\t\t\t<a:noFill/>\n\t\t\t\t<a:ln>\n\t\t\t\t\t<a:noFill/>\n\t\t\t\t</a:ln>\n\t\t\t\t<a:effectLst/>\n\t\t\t\t<a:extLst>\n\t\t\t\t\t<a:ext uri=\"{909E8E84-426E-40DD-AFC4-6F175D3DCCD1}\">\n\t\t\t\t\t\t<a14:hiddenFill xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\">\n\t\t\t\t\t\t\t<a:solidFill>\n\t\t\t\t\t\t\t\t<a:schemeClr val=\"accent1\"/>\n\t\t\t\t\t\t\t</a:solidFill>\n\t\t\t\t\t\t</a14:hiddenFill>\n\t\t\t\t\t</a:ext>\n\t\t\t\t\t<a:ext uri=\"{91240B29-F687-4F45-9708-019B960494DF}\">\n\t\t\t\t\t\t<a14:hiddenLine xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" w=\"9525\">\n\t\t\t\t\t\t\t<a:solidFill>\n\t\t\t\t\t\t\t\t<a:schemeClr val=\"tx1\"/>\n\t\t\t\t\t\t\t</a:solidFill>\n\t\t\t\t\t\t\t<a:miter lim=\"800000\"/>\n\t\t\t\t\t\t\t<a:headEnd/>\n\t\t\t\t\t\t\t<a:tailEnd/>\n\t\t\t\t\t\t</a14:hiddenLine>\n\t\t\t\t\t</a:ext>\n\t\t\t\t\t<a:ext uri=\"{AF507438-7753-43E0-B8FC-AC1667EBCBE1}\">\n\t\t\t\t\t\t<a14:hiddenEffects xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\">\n\t\t\t\t\t\t\t<a:effectLst>\n\t\t\t\t\t\t\t\t<a:outerShdw dist=\"35921\" dir=\"2700000\" algn=\"ctr\" rotWithShape=\"0\">\n\t\t\t\t\t\t\t\t\t<a:schemeClr val=\"bg2\"/>\n\t\t\t\t\t\t\t\t</a:outerShdw>\n\t\t\t\t\t\t\t</a:effectLst>\n\t\t\t\t\t\t</a14:hiddenEffects>\n\t\t\t\t\t</a:ext>\n\t\t\t\t</a:extLst>\n\t\t\t</p:spPr>\n\t\t</p:pic>\n\t\t").replace(/\t|\n/g, "");
	}
};
},{}],4:[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
	var XMLReader = require('./sax').XMLReader;
	var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
	exports.XMLSerializer = require('./dom').XMLSerializer ;
	exports.DOMParser = DOMParser;
//}

},{"./dom":5,"./sax":6}],5:[function(require,module,exports){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9?this.documentElement:this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE???
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}

},{}],6:[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: ???????????????sax??????????????????????????????
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//????????????
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;


},{}],7:[function(require,module,exports){
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DOMParser = require("xmldom").DOMParser;
var XMLSerializer = require("xmldom").XMLSerializer;
var Errors = require("./errors");

var DocUtils = {};

function parser(tag) {
	return _defineProperty({}, "get", function get(scope) {
		if (tag === ".") {
			return scope;
		}
		return scope[tag];
	});
}

DocUtils.defaults = {
	nullGetter: function nullGetter(part) {
		if (!part.module) {
			return "undefined";
		}
		if (part.module === "rawxml") {
			return "";
		}
		return "";
	},

	parser: parser,
	delimiters: {
		start: "{",
		end: "}"
	}
};

DocUtils.mergeObjects = function () {
	var resObj = {};
	var obj = void 0,
	    keys = void 0;
	for (var i = 0; i < arguments.length; i += 1) {
		obj = arguments[i];
		keys = Object.keys(obj);
		for (var j = 0; j < keys.length; j += 1) {
			resObj[keys[j]] = obj[keys[j]];
		}
	}
	return resObj;
};

DocUtils.xml2str = function (xmlNode) {
	var a = new XMLSerializer();
	return a.serializeToString(xmlNode);
};

DocUtils.decodeUtf8 = function (s) {
	try {
		if (s === undefined) {
			return undefined;
		}
		// replace Ascii 160 space by the normal space, Ascii 32
		return decodeURIComponent(escape(DocUtils.convertSpaces(s)));
	} catch (e) {
		var err = new Error("End");
		err.properties.data = s;
		err.properties.explanation = "Could not decode string to UTF8";
		throw err;
	}
};

DocUtils.encodeUtf8 = function (s) {
	return unescape(encodeURIComponent(s));
};

DocUtils.str2xml = function (str, errorHandler) {
	var parser = new DOMParser({ errorHandler: errorHandler });
	return parser.parseFromString(str, "text/xml");
};

DocUtils.charMap = {
	"&": "&amp;",
	"'": "&apos;",
	"<": "&lt;",
	">": "&gt;"
};

var regexStripRegexp = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
DocUtils.escapeRegExp = function (str) {
	return str.replace(regexStripRegexp, "\\$&");
};

DocUtils.charMapRegexes = Object.keys(DocUtils.charMap).map(function (endChar) {
	var startChar = DocUtils.charMap[endChar];
	return {
		rstart: new RegExp(DocUtils.escapeRegExp(startChar), "g"),
		rend: new RegExp(DocUtils.escapeRegExp(endChar), "g"),
		start: startChar,
		end: endChar
	};
});

DocUtils.wordToUtf8 = function (string) {
	var r = void 0;
	for (var i = 0, l = DocUtils.charMapRegexes.length; i < l; i++) {
		r = DocUtils.charMapRegexes[i];
		string = string.replace(r.rstart, r.end);
	}
	return string;
};

DocUtils.utf8ToWord = function (string) {
	if (typeof string !== "string") {
		string = string.toString();
	}
	var r = void 0;
	for (var i = 0, l = DocUtils.charMapRegexes.length; i < l; i++) {
		r = DocUtils.charMapRegexes[i];
		string = string.replace(r.rend, r.start);
	}
	return string;
};

DocUtils.cloneDeep = function (obj) {
	return JSON.parse(JSON.stringify(obj));
};

DocUtils.concatArrays = function (arrays) {
	return arrays.reduce(function (result, array) {
		Array.prototype.push.apply(result, array);
		return result;
	}, []);
};

var spaceRegexp = new RegExp(String.fromCharCode(160), "g");
DocUtils.convertSpaces = function (s) {
	return s.replace(spaceRegexp, " ");
};

DocUtils.pregMatchAll = function (regex, content) {
	/* regex is a string, content is the content. It returns an array of all matches with their offset, for example:
 	 regex=la
 	 content=lolalolilala
 returns: [{array: {0: 'la'},offset: 2},{array: {0: 'la'},offset: 8},{array: {0: 'la'} ,offset: 10}]
 */
	var matchArray = [];
	var match = void 0;
	while ((match = regex.exec(content)) != null) {
		matchArray.push({ array: match, offset: match.index });
	}
	return matchArray;
};

DocUtils.sizeOfObject = function (obj) {
	return Object.keys(obj).length;
};

function throwXmlTagNotFound(options) {
	var err = new Errors.XTTemplateError("No tag '" + options.element + "' was found at the " + options.position);
	err.properties = {
		id: "no_xml_tag_found_at_" + options.position,
		explanation: "No tag '" + options.element + "' was found at the " + options.position,
		parsed: options.parsed,
		index: options.index,
		element: options.element
	};
	throw err;
}

DocUtils.getRight = function (parsed, element, index) {
	for (var i = index, l = parsed.length; i < l; i++) {
		var part = parsed[i];
		if (part.value === "</" + element + ">") {
			return i;
		}
	}
	throwXmlTagNotFound({ position: "right", element: element, parsed: parsed, index: index });
};

DocUtils.getLeft = function (parsed, element, index) {
	for (var i = index; i >= 0; i--) {
		var part = parsed[i];
		if (part.value.indexOf("<" + element) === 0 && [">", " "].indexOf(part.value[element.length + 1]) !== -1) {
			return i;
		}
	}
	throwXmlTagNotFound({ position: "left", element: element, parsed: parsed, index: index });
};

module.exports = DocUtils;
},{"./errors":9,"xmldom":25}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DocUtils = require("./doc-utils");
DocUtils.traits = require("./traits");
DocUtils.moduleWrapper = require("./module-wrapper");
var wrapper = DocUtils.moduleWrapper;

var Docxtemplater = function () {
	function Docxtemplater() {
		_classCallCheck(this, Docxtemplater);

		if (arguments.length > 0) {
			throw new Error("The constructor with parameters have been removed in docxtemplater 3.0, please check the upgrade guide.");
		}
		this.compiled = {};
		this.modules = [];
		this.setOptions({});
	}

	_createClass(Docxtemplater, [{
		key: "setModules",
		value: function setModules(obj) {
			this.modules.forEach(function (module) {
				module.set(obj);
			});
		}
	}, {
		key: "attachModule",
		value: function attachModule(module) {
			this.modules.push(wrapper(module));
			return this;
		}
	}, {
		key: "setOptions",
		value: function setOptions(options) {
			var _this = this;

			this.options = options;
			Object.keys(DocUtils.defaults).forEach(function (key) {
				var defaultValue = DocUtils.defaults[key];
				_this[key] = _this.options[key] != null ? _this.options[key] : defaultValue;
			});
			if (this.zip) {
				this.updateFileTypeConfig();
			}
			return this;
		}
	}, {
		key: "loadZip",
		value: function loadZip(zip) {
			if (zip.loadAsync) {
				throw new Error("Docxtemplater doesn't handle JSZip version >=3, see changelog");
			}
			this.zip = zip;
			this.updateFileTypeConfig();
			return this;
		}
	}, {
		key: "compileFile",
		value: function compileFile(fileName) {
			var currentFile = this.createTemplateClass(fileName);
			currentFile.parse();
			this.compiled[fileName] = currentFile;
		}
	}, {
		key: "compile",
		value: function compile() {
			var _this2 = this;

			this.options.xmlFileNames = [];
			this.modules = this.fileTypeConfig.baseModules.map(function (moduleFunction) {
				return moduleFunction();
			}).concat(this.modules);
			this.options = this.modules.reduce(function (options, module) {
				return module.optionsTransformer(options, _this2);
			}, this.options);
			this.xmlDocuments = this.options.xmlFileNames.reduce(function (xmlDocuments, fileName) {
				var content = _this2.zip.files[fileName].asText();
				xmlDocuments[fileName] = DocUtils.str2xml(content);
				return xmlDocuments;
			}, {});
			this.setModules({ zip: this.zip, xmlDocuments: this.xmlDocuments, data: this.data });
			this.getTemplatedFiles();
			this.setModules({ compiled: this.compiled });
			// Loop inside all templatedFiles (ie xml files with content).
			// Sometimes they don't exist (footer.xml for example)
			this.templatedFiles.forEach(function (fileName) {
				if (_this2.zip.files[fileName] != null) {
					_this2.compileFile(fileName);
				}
			});

			this.mapper = this.modules.reduce(function (value, module) {
				return module.getRenderedMap(value);
			}, {});
			return this;
		}
	}, {
		key: "updateFileTypeConfig",
		value: function updateFileTypeConfig() {
			this.fileType = this.zip.files["word/document.xml"] ? "docx" : "pptx";
			this.fileTypeConfig = this.options.fileTypeConfig || Docxtemplater.FileTypeConfig[this.fileType];
			return this;
		}
	}, {
		key: "render",
		value: function render() {
			var _this3 = this;

			this.compile();

			Object.keys(this.mapper).forEach(function (to) {
				var mapped = _this3.mapper[to];
				var from = mapped.from;
				var currentFile = _this3.compiled[from];
				currentFile.setTags(mapped.data);
				currentFile.render(to);
				_this3.zip.file(to, currentFile.content);
			});

			Object.keys(this.xmlDocuments).forEach(function (fileName) {
				_this3.zip.remove(fileName);
				var content = DocUtils.xml2str(_this3.xmlDocuments[fileName]);
				return _this3.zip.file(fileName, content, {});
			});
			return this;
		}
	}, {
		key: "setData",
		value: function setData(data) {
			this.data = data;
			return this;
		}
	}, {
		key: "getZip",
		value: function getZip() {
			return this.zip;
		}
	}, {
		key: "createTemplateClass",
		value: function createTemplateClass(path) {
			var usedData = this.zip.files[path].asText();
			return this.createTemplateClassFromContent(usedData, path);
		}
	}, {
		key: "createTemplateClassFromContent",
		value: function createTemplateClassFromContent(content, filePath) {
			var _this4 = this;

			var xmltOptions = {
				filePath: filePath
			};
			Object.keys(DocUtils.defaults).forEach(function (key) {
				xmltOptions[key] = _this4[key];
			});
			xmltOptions.fileTypeConfig = this.fileTypeConfig;
			xmltOptions.modules = this.modules;
			return new Docxtemplater.XmlTemplater(content, xmltOptions);
		}
	}, {
		key: "getFullText",
		value: function getFullText(path) {
			return this.createTemplateClass(path || this.fileTypeConfig.textPath).getFullText();
		}
	}, {
		key: "getTemplatedFiles",
		value: function getTemplatedFiles() {
			this.templatedFiles = this.fileTypeConfig.getTemplatedFiles(this.zip);
			return this.templatedFiles;
		}
	}]);

	return Docxtemplater;
}();

Docxtemplater.DocUtils = require("./doc-utils");
Docxtemplater.Errors = require("./errors");
Docxtemplater.XmlTemplater = require("./xml-templater");
Docxtemplater.FileTypeConfig = require("./file-type-config");
Docxtemplater.XmlMatcher = require("./xml-matcher");
module.exports = Docxtemplater;
},{"./doc-utils":7,"./errors":9,"./file-type-config":10,"./module-wrapper":13,"./traits":22,"./xml-matcher":23,"./xml-templater":24}],9:[function(require,module,exports){
"use strict";

function XTError(message) {
	this.name = "GenericError";
	this.message = message;
	this.stack = new Error(message).stack;
}
XTError.prototype = Error.prototype;

function XTTemplateError(message) {
	this.name = "TemplateError";
	this.message = message;
	this.stack = new Error(message).stack;
}
XTTemplateError.prototype = new XTError();

function XTScopeParserError(message) {
	this.name = "ScopeParserError";
	this.message = message;
	this.stack = new Error(message).stack;
}
XTScopeParserError.prototype = new XTError();

function XTInternalError(message) {
	this.name = "InternalError";
	this.properties = { explanation: "InternalError" };
	this.message = message;
	this.stack = new Error(message).stack;
}
XTInternalError.prototype = new XTError();

function throwMultiError(errors) {
	var err = new XTTemplateError("Multi error");
	err.properties = {
		errors: errors,
		id: "multi_error",
		explanation: "The template has multiple errors"
	};
	throw err;
}

module.exports = {
	XTError: XTError,
	XTTemplateError: XTTemplateError,
	XTInternalError: XTInternalError,
	XTScopeParserError: XTScopeParserError,
	throwMultiError: throwMultiError
};
},{}],10:[function(require,module,exports){
"use strict";

var loopModule = require("./modules/loop");
var spacePreserveModule = require("./modules/space-preserve");
var rawXmlModule = require("./modules/rawxml");
var expandPairTrait = require("./modules/expand-pair-trait");
var render = require("./modules/render");

var PptXFileTypeConfig = {
	getTemplatedFiles: function getTemplatedFiles(zip) {
		var slideTemplates = zip.file(/ppt\/(slides|slideMasters)\/(slide|slideMaster)\d+\.xml/).map(function (file) {
			return file.name;
		});
		return slideTemplates.concat(["ppt/presentation.xml"]);
	},

	textPath: "ppt/slides/slide1.xml",
	tagsXmlTextArray: ["a:t", "m:t"],
	tagsXmlLexedArray: ["p:sp", "a:tc", "a:tr", "a:table", "a:p", "a:r"],
	tagRawXml: "p:sp",
	tagTextXml: "a:t",
	baseModules: [render, expandPairTrait, rawXmlModule, loopModule]
};

var DocXFileTypeConfig = {
	getTemplatedFiles: function getTemplatedFiles(zip) {
		var slideTemplates = zip.file(/word\/(header|footer)\d+\.xml/).map(function (file) {
			return file.name;
		});
		return slideTemplates.concat(["word/document.xml"]);
	},

	textPath: "word/document.xml",
	tagsXmlTextArray: ["w:t", "m:t"],
	tagsXmlLexedArray: ["w:tc", "w:tr", "w:table", "w:p", "w:r"],
	tagRawXml: "w:p",
	tagTextXml: "w:t",
	baseModules: [render, spacePreserveModule, expandPairTrait, rawXmlModule, loopModule]
};

module.exports = {
	docx: DocXFileTypeConfig,
	pptx: PptXFileTypeConfig
};
},{"./modules/expand-pair-trait":14,"./modules/loop":15,"./modules/rawxml":16,"./modules/render":17,"./modules/space-preserve":18}],11:[function(require,module,exports){
"use strict";

var Errors = require("./errors");
var DocUtils = require("./doc-utils");

function inRange(range, match) {
	return range[0] <= match.offset && match.offset < range[1];
}

function updateInTextTag(part, inTextTag) {
	if (part.type === "tag" && part.position === "start" && part.text) {
		if (inTextTag) {
			throw new Error("Malformed xml : Already in text tag");
		}
		return true;
	}
	if (part.type === "tag" && part.position === "end" && part.text) {
		if (!inTextTag) {
			throw new Error("Malformed xml : Already not in text tag");
		}
		return false;
	}
	return inTextTag;
}

function offsetSort(a, b) {
	return a.offset - b.offset;
}

function getTag(tag) {
	var start = 1;
	if (tag[1] === "/") {
		start = 2;
	}
	var index = tag.indexOf(" ");
	var end = index === -1 ? tag.length - 1 : index;
	return {
		tag: tag.slice(start, end),
		position: start === 1 ? "start" : "end"
	};
}

function tagMatcher(content, textMatchArray, othersMatchArray) {
	var cursor = 0;
	var contentLength = content.length;
	var allMatches = DocUtils.concatArrays([textMatchArray.map(function (tag) {
		return { tag: tag, text: true };
	}), othersMatchArray.map(function (tag) {
		return { tag: tag, text: false };
	})]).reduce(function (allMatches, t) {
		allMatches[t.tag] = t.text;
		return allMatches;
	}, {});
	var totalMatches = [];

	while (cursor < contentLength) {
		cursor = content.indexOf("<", cursor);
		if (cursor === -1) {
			break;
		}
		var offset = cursor;
		cursor = content.indexOf(">", cursor);
		var tagText = content.slice(offset, cursor + 1);

		var _getTag = getTag(tagText),
		    tag = _getTag.tag,
		    position = _getTag.position;

		var text = allMatches[tag];
		if (text == null) {
			continue;
		}
		totalMatches.push({ type: "tag", position: position, text: text, offset: offset, value: tagText });
	}

	return totalMatches;
}

function getUnopenedTagException(options) {
	var err = new Errors.XTTemplateError("Unopened tag");
	err.properties = {
		xtag: options.xtag.split(" ")[0],
		id: "unopened_tag",
		context: options.xtag,
		offset: options.offset,
		lIndex: options.lIndex,
		explanation: "The tag beginning with '" + options.xtag.substr(0, 10) + "' is unopened"
	};
	return err;
}

function getUnclosedTagException(options) {
	var err = new Errors.XTTemplateError("Unclosed tag");
	err.properties = {
		xtag: options.xtag.split(" ")[0].substr(1),
		id: "unclosed_tag",
		context: options.xtag,
		offset: options.offset,
		lIndex: options.lIndex,
		explanation: "The tag beginning with '" + options.xtag.substr(0, 10) + "' is unclosed"
	};
	return err;
}

function getDelimiterErrors(delimiterMatches, fullText, ranges) {
	if (delimiterMatches.length === 0) {
		return [];
	}
	var errors = [];
	var inDelimiter = false;
	var lastDelimiterMatch = { offset: 0 };
	var xtag = void 0;
	var rangeIndex = 0;
	var range = ranges[rangeIndex];
	var lIndex = range.lIndex;
	delimiterMatches.forEach(function (delimiterMatch) {
		while (ranges[rangeIndex + 1]) {
			if (ranges[rangeIndex + 1].offset > delimiterMatch.offset) {
				break;
			}
			rangeIndex++;
			range = ranges[rangeIndex];
			lIndex = range.lIndex;
		}
		xtag = fullText.substr(lastDelimiterMatch.offset, delimiterMatch.offset - lastDelimiterMatch.offset);
		if (delimiterMatch.position === "start" && inDelimiter || delimiterMatch.position === "end" && !inDelimiter) {
			if (delimiterMatch.position === "start") {
				errors.push(getUnclosedTagException({ xtag: xtag, offset: delimiterMatch.offset }));
				delimiterMatch.error = true;
			} else {
				errors.push(getUnopenedTagException({ xtag: xtag, offset: delimiterMatch.offset }));
				delimiterMatch.error = true;
			}
		} else {
			inDelimiter = !inDelimiter;
			lastDelimiterMatch = delimiterMatch;
		}
	});
	var delimiterMatch = { offset: fullText.length };
	xtag = fullText.substr(lastDelimiterMatch.offset, delimiterMatch.offset - lastDelimiterMatch.offset);
	if (inDelimiter) {
		errors.push(getUnclosedTagException({ xtag: xtag, offset: lastDelimiterMatch.offset }));
		delimiterMatch.error = true;
	}
	return errors;
}

function getAllIndexes(arr, val, position) {
	var indexes = [];
	var offset = -1;
	do {
		offset = arr.indexOf(val, offset + 1);
		if (offset !== -1) {
			indexes.push({ offset: offset, position: position });
		}
	} while (offset !== -1);
	return indexes;
}

function Reader(innerContentParts) {
	var _this = this;

	this.innerContentParts = innerContentParts;
	this.full = "";
	this.parseDelimiters = function (delimiters) {
		_this.full = _this.innerContentParts.map(function (p) {
			return p.value;
		}).join("");
		var delimiterMatches = DocUtils.concatArrays([getAllIndexes(_this.full, delimiters.start, "start"), getAllIndexes(_this.full, delimiters.end, "end")]).sort(offsetSort);

		var offset = 0;
		var ranges = _this.innerContentParts.map(function (part) {
			offset += part.value.length;
			return { offset: offset - part.value.length, lIndex: part.lIndex };
		});

		var errors = getDelimiterErrors(delimiterMatches, _this.full, ranges);
		var delimiterLength = { start: delimiters.start.length, end: delimiters.end.length };
		var cutNext = 0;
		var delimiterIndex = 0;

		_this.parsed = ranges.map(function (p, i) {
			var offset = p.offset;
			var range = [offset, offset + this.innerContentParts[i].value.length];
			var partContent = this.innerContentParts[i].value;
			var delimitersInOffset = [];
			while (delimiterIndex < delimiterMatches.length && inRange(range, delimiterMatches[delimiterIndex])) {
				delimitersInOffset.push(delimiterMatches[delimiterIndex]);
				delimiterIndex++;
			}
			var parts = [];
			var cursor = 0;
			if (cutNext > 0) {
				cursor = cutNext;
				cutNext = 0;
			}
			delimitersInOffset.forEach(function (delimiterInOffset) {
				var value = partContent.substr(cursor, delimiterInOffset.offset - offset - cursor);
				if (value.length > 0) {
					parts.push({ type: "content", value: value });
				}
				var p = { type: "delimiter" };
				p.position = delimiterInOffset.position;
				if (delimiterInOffset.error) {
					p.error = delimiterInOffset.error;
				}
				parts.push(p);
				cursor = delimiterInOffset.offset - offset + delimiterLength[delimiterInOffset.position];
			});
			cutNext = cursor - partContent.length;
			var value = partContent.substr(cursor);
			if (value.length > 0) {
				parts.push({ type: "content", value: value });
			}
			return parts;
		}, _this);
		_this.errors = errors;
	};
}

module.exports = {
	parse: function parse(xmlparsed, delimiters) {
		var inTextTag = false;
		var innerContentParts = [];
		xmlparsed.forEach(function (part) {
			inTextTag = updateInTextTag(part, inTextTag);
			if (inTextTag && part.type === "content") {
				innerContentParts.push(part);
			}
		});
		var reader = new Reader(innerContentParts);
		reader.parseDelimiters(delimiters);

		var lexed = [];
		var index = 0;
		xmlparsed.forEach(function (part) {
			inTextTag = updateInTextTag(part, inTextTag);
			if (part.type === "content") {
				part.position = inTextTag ? "insidetag" : "outsidetag";
			}
			if (inTextTag && part.type === "content") {
				Array.prototype.push.apply(lexed, reader.parsed[index].map(function (p) {
					if (p.type === "content") {
						p.position = "insidetag";
					}
					return p;
				}));
				index++;
			} else {
				lexed.push(part);
			}
		});
		return { errors: reader.errors, lexed: lexed };
	},
	xmlparse: function xmlparse(content, xmltags) {
		var matches = tagMatcher(content, xmltags.text, xmltags.other);
		var cursor = 0;
		var parsed = matches.reduce(function (parsed, match) {
			var value = content.substr(cursor, match.offset - cursor);
			if (value.length > 0) {
				parsed.push({ type: "content", value: value });
			}
			cursor = match.offset + match.value.length;
			delete match.offset;
			if (match.value.length > 0) {
				parsed.push(match);
			}
			return parsed;
		}, []).map(function (p, i) {
			p.lIndex = i;
			return p;
		});
		var value = content.substr(cursor);
		if (value.length > 0) {
			parsed.push({ type: "content", value: value });
		}
		return parsed;
	}
};
},{"./doc-utils":7,"./errors":9}],12:[function(require,module,exports){
"use strict";

function getMinFromArrays(arrays, state) {
	var minIndex = -1;
	for (var i = 0, l = arrays.length; i < l; i++) {
		if (state[i] >= arrays[i].length) {
			continue;
		}
		if (minIndex === -1 || arrays[i][state[i]].offset < arrays[minIndex][state[minIndex]].offset) {
			minIndex = i;
		}
	}
	if (minIndex === -1) {
		throw new Error("minIndex negative");
	}
	return minIndex;
}

module.exports = function (arrays) {
	var totalLength = arrays.reduce(function (sum, array) {
		return sum + array.length;
	}, 0);
	arrays = arrays.filter(function (array) {
		return array.length > 0;
	});

	var resultArray = new Array(totalLength);

	var state = arrays.map(function () {
		return 0;
	});

	var i = 0;

	while (i <= totalLength - 1) {
		var arrayIndex = getMinFromArrays(arrays, state);
		resultArray[i] = arrays[arrayIndex][state[arrayIndex]];
		state[arrayIndex]++;
		i++;
	}

	return resultArray;
};
},{}],13:[function(require,module,exports){
"use strict";

function emptyFun() {}
function identity(i) {
	return i;
}
module.exports = function (module) {
	var defaults = {
		set: emptyFun,
		parse: emptyFun,
		render: emptyFun,
		getTraits: emptyFun,
		optionsTransformer: identity,
		errorsTransformer: identity,
		getRenderedMap: identity,
		postparse: identity
	};
	if (Object.keys(defaults).every(function (key) {
		return !module[key];
	})) {
		throw new Error("This module cannot be wrapped, because it doesn't define any of the necessary functions");
	}
	Object.keys(defaults).forEach(function (key) {
		module[key] = module[key] || defaults[key];
	});
	return module;
};
},{}],14:[function(require,module,exports){
"use strict";

var traitName = "expandPair";
var mergeSort = require("../mergesort");
var DocUtils = require("../doc-utils");
var wrapper = require("../module-wrapper");

var _require = require("../traits"),
    getExpandToDefault = _require.getExpandToDefault;

var Errors = require("../errors");

function getUnmatchedLoopException(options) {
	var location = options.location;
	var t = location === "start" ? "unclosed" : "unopened";
	var T = location === "start" ? "Unclosed" : "Unopened";

	var err = new Errors.XTTemplateError(T + " loop");
	var tag = options.part.value;
	err.properties = {
		id: t + "_loop",
		explanation: "The loop with tag " + tag + " is " + t,
		xtag: tag
	};
	return err;
}

function getClosingTagNotMatchOpeningTag(options) {
	var tags = options.tags;

	var err = new Errors.XTTemplateError("Closing tag does not match opening tag");
	err.properties = {
		id: "closing_tag_does_not_match_opening_tag",
		explanation: "The tag \"" + tags[0].value + "\" is closed by the tag \"" + tags[1].value + "\"",
		openingtag: tags[0].value,
		closingtag: tags[1].value
	};
	return err;
}

function getOpenCountChange(part) {
	switch (part.location) {
		case "start":
			return 1;
		case "end":
			return -1;
		default:
			throw new Error("Location should be one of 'start' or 'end' (given : " + part.location + ")");
	}
}

function getPairs(traits) {
	var errors = [];
	var pairs = [];
	if (traits.length === 0) {
		return { pairs: pairs, errors: errors };
	}
	var countOpen = 1;
	var firstTrait = traits[0];
	if (firstTrait.part.location === "start") {
		for (var i = 1; i < traits.length; i++) {
			var currentTrait = traits[i];
			countOpen += getOpenCountChange(currentTrait.part);
			if (countOpen === 0) {
				var _outer = getPairs(traits.slice(i + 1));
				if (currentTrait.part.value !== firstTrait.part.value && currentTrait.part.value !== "") {
					errors.push(getClosingTagNotMatchOpeningTag({ tags: [firstTrait.part, currentTrait.part] }));
				} else {
					pairs = [[firstTrait, currentTrait]];
				}
				return { pairs: pairs.concat(_outer.pairs), errors: errors.concat(_outer.errors) };
			}
		}
	}
	var part = firstTrait.part;
	errors.push(getUnmatchedLoopException({ part: part, location: part.location }));
	var outer = getPairs(traits.slice(1));
	return { pairs: outer.pairs, errors: errors.concat(outer.errors) };
}

var expandPairTrait = {
	name: "ExpandPairTrait",
	postparse: function postparse(postparsed, _ref) {
		var getTraits = _ref.getTraits,
		    _postparse = _ref.postparse;

		var traits = getTraits(traitName, postparsed);
		traits = traits.map(function (trait) {
			return trait || [];
		});
		traits = mergeSort(traits);

		var _getPairs = getPairs(traits),
		    pairs = _getPairs.pairs,
		    errors = _getPairs.errors;

		var expandedPairs = pairs.map(function (pair) {
			var expandTo = pair[0].part.expandTo;
			if (expandTo === "auto") {
				expandTo = getExpandToDefault(postparsed.slice(pair[0].offset, pair[1].offset));
			}
			if (!expandTo) {
				return [pair[0].offset, pair[1].offset];
			}
			var left = DocUtils.getLeft(postparsed, expandTo, pair[0].offset);
			var right = DocUtils.getRight(postparsed, expandTo, pair[1].offset);
			return [left, right];
		});

		var currentPairIndex = 0;
		var innerParts = void 0;
		var newParsed = postparsed.reduce(function (newParsed, part, i) {
			var inPair = currentPairIndex < pairs.length && expandedPairs[currentPairIndex][0] <= i;
			var pair = pairs[currentPairIndex];
			var expandedPair = expandedPairs[currentPairIndex];
			if (!inPair) {
				newParsed.push(part);
				return newParsed;
			}
			if (expandedPair[0] === i) {
				innerParts = [];
			}
			if (pair[0].offset !== i && pair[1].offset !== i) {
				innerParts.push(part);
			}
			if (expandedPair[1] === i) {
				var basePart = postparsed[pair[0].offset];
				delete basePart.location;
				delete basePart.expandTo;
				basePart.subparsed = _postparse(innerParts);
				newParsed.push(basePart);
				currentPairIndex++;
			}
			return newParsed;
		}, []);
		return { postparsed: newParsed, errors: errors };
	}
};

module.exports = function () {
	return wrapper(expandPairTrait);
};
},{"../doc-utils":7,"../errors":9,"../mergesort":12,"../module-wrapper":13,"../traits":22}],15:[function(require,module,exports){
"use strict";

var DocUtils = require("../doc-utils");
var dashInnerRegex = /^-([^\s]+)\s(.+)$/;
var wrapper = require("../module-wrapper");

var moduleName = "loop";

var loopModule = {
	name: "LoopModule",
	parse: function parse(placeHolderContent) {
		var module = moduleName;
		var type = "placeholder";
		if (placeHolderContent[0] === "#") {
			return { type: type, value: placeHolderContent.substr(1), expandTo: "auto", module: module, location: "start", inverted: false };
		}
		if (placeHolderContent[0] === "^") {
			return { type: type, value: placeHolderContent.substr(1), expandTo: "auto", module: module, location: "start", inverted: true };
		}
		if (placeHolderContent[0] === "/") {
			return { type: type, value: placeHolderContent.substr(1), module: module, location: "end" };
		}
		if (placeHolderContent[0] === "-") {
			var value = placeHolderContent.replace(dashInnerRegex, "$2");
			var expandTo = placeHolderContent.replace(dashInnerRegex, "$1");
			return { type: type, value: value, expandTo: expandTo, module: module, location: "start", inverted: false };
		}
		return null;
	},
	getTraits: function getTraits(traitName, parsed) {
		if (traitName !== "expandPair") {
			return;
		}

		return parsed.reduce(function (tags, part, offset) {
			if (part.type === "placeholder" && part.module === moduleName) {
				tags.push({ part: part, offset: offset });
			}
			return tags;
		}, []);
	},
	render: function render(part, options) {
		if (!part.type === "placeholder" || part.module !== moduleName) {
			return null;
		}
		var totalValue = [];
		function loopOver(scope) {
			var scopeManager = options.scopeManager.createSubScopeManager(scope, part.value);
			totalValue.push(options.render(DocUtils.mergeObjects({}, options, {
				compiled: part.subparsed,
				tags: {},
				scopeManager: scopeManager
			})));
		}
		options.scopeManager.loopOver(part.value, loopOver, part.inverted);
		return { value: totalValue.join("") };
	}
};

module.exports = function () {
	return wrapper(loopModule);
};
},{"../doc-utils":7,"../module-wrapper":13}],16:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DocUtils = require("../doc-utils");
var Errors = require("../errors");

var moduleName = "rawxml";
var wrapper = require("../module-wrapper");

function throwRawTagShouldBeOnlyTextInParagraph(options) {
	var err = new Errors.XTTemplateError("Raw tag should be the only text in paragraph");
	var tag = options.part.value;
	err.properties = {
		id: "raw_xml_tag_should_be_only_text_in_paragraph",
		explanation: "The tag " + tag,
		xtag: options.part.value,
		paragraphParts: options.paragraphParts
	};
	throw err;
}

function getInner(_ref) {
	var part = _ref.part,
	    left = _ref.left,
	    right = _ref.right,
	    postparsed = _ref.postparsed,
	    index = _ref.index;

	var paragraphParts = postparsed.slice(left + 1, right);
	paragraphParts.forEach(function (p, i) {
		if (i === index - left - 1) {
			return;
		}
		if (p.type === "placeholder" || p.type === "content" && p.position === "insidetag") {
			throwRawTagShouldBeOnlyTextInParagraph({ paragraphParts: paragraphParts, part: part });
		}
	});
	return part;
}

var RawXmlModule = function () {
	function RawXmlModule() {
		_classCallCheck(this, RawXmlModule);

		this.name = "RawXmlModule";
	}

	_createClass(RawXmlModule, [{
		key: "optionsTransformer",
		value: function optionsTransformer(options, docxtemplater) {
			this.fileTypeConfig = docxtemplater.fileTypeConfig;
			return options;
		}
	}, {
		key: "parse",
		value: function parse(placeHolderContent) {
			var type = "placeholder";
			if (placeHolderContent[0] !== "@") {
				return null;
			}
			return { type: type, value: placeHolderContent.substr(1), module: moduleName };
		}
	}, {
		key: "postparse",
		value: function postparse(postparsed) {
			return DocUtils.traits.expandToOne(postparsed, { moduleName: moduleName, getInner: getInner, expandTo: this.fileTypeConfig.tagRawXml });
		}
	}, {
		key: "render",
		value: function render(part, options) {
			if (part.module !== moduleName) {
				return null;
			}
			var value = options.scopeManager.getValue(part.value);
			if (value == null) {
				value = options.nullGetter(part);
			}
			return { value: value };
		}
	}]);

	return RawXmlModule;
}();

module.exports = function () {
	return wrapper(new RawXmlModule());
};
},{"../doc-utils":7,"../errors":9,"../module-wrapper":13}],17:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var wrapper = require("../module-wrapper");
var Errors = require("../errors");

var Render = function () {
	function Render() {
		_classCallCheck(this, Render);

		this.name = "Render";
	}

	_createClass(Render, [{
		key: "set",
		value: function set(obj) {
			if (obj.compiled) {
				this.compiled = obj.compiled;
			}
			if (obj.data != null) {
				this.data = obj.data;
			}
		}
	}, {
		key: "getRenderedMap",
		value: function getRenderedMap(mapper) {
			var _this = this;

			return Object.keys(this.compiled).reduce(function (mapper, from) {
				mapper[from] = { from: from, data: _this.data };
				return mapper;
			}, mapper);
		}
	}, {
		key: "optionsTransformer",
		value: function optionsTransformer(options, docxtemplater) {
			this.parser = docxtemplater.parser;
			return options;
		}
	}, {
		key: "postparse",
		value: function postparse(postparsed) {
			var _this2 = this;

			var errors = [];
			postparsed.map(function (p) {
				if (p.type === "placeholder") {
					var tag = p.value;
					try {
						_this2.parser(tag);
					} catch (rootError) {
						var err = new Errors.XTScopeParserError("Scope parser compilation failed");
						err.properties = {
							id: "scopeparser_compilation_failed",
							tag: tag,
							explanation: "The scope parser for the tag " + tag + " failed to compile",
							rootError: rootError
						};
						errors.push(err);
					}
				}
			});
			return { postparsed: postparsed, errors: errors };
		}
	}]);

	return Render;
}();

module.exports = function () {
	return wrapper(new Render());
};
},{"../errors":9,"../module-wrapper":13}],18:[function(require,module,exports){
"use strict";

var wrapper = require("../module-wrapper");
var spacePreserve = {
	name: "SpacePreserveModule",
	postparse: function postparse(postparsed) {
		var chunk = [];
		var inChunk = false;
		var result = postparsed.reduce(function (postparsed, part) {
			if (part.type === "tag" && part.position === "start" && part.text && part.value === "<w:t>") {
				inChunk = true;
			}
			if (inChunk) {
				if (part.type === "placeholder" && !part.module) {
					chunk[0].value = '<w:t xml:space="preserve">';
				}
				chunk.push(part);
			} else {
				postparsed.push(part);
			}
			if (part.type === "tag" && part.position === "end" && part.text && part.value === "</w:t>") {
				Array.prototype.push.apply(postparsed, chunk);
				inChunk = false;
				chunk = [];
			}
			return postparsed;
		}, []);
		Array.prototype.push.apply(result, chunk);
		return result;
	}
};
module.exports = function () {
	return wrapper(spacePreserve);
};
},{"../module-wrapper":13}],19:[function(require,module,exports){
"use strict";

var DocUtils = require("./doc-utils");

var parser = {
	postparse: function postparse(postparsed, modules) {
		function getTraits(traitName, postparsed) {
			return modules.map(function (module) {
				return module.getTraits(traitName, postparsed);
			});
		}
		var errors = [];
		function postparse(postparsed) {
			return modules.reduce(function (postparsed, module) {
				var r = module.postparse(postparsed, { postparse: postparse, getTraits: getTraits });
				if (r.errors) {
					errors = DocUtils.concatArrays([errors, r.errors]);
					return r.postparsed;
				}
				return r;
			}, postparsed);
		}
		return { postparsed: postparse(postparsed), errors: errors };
	},
	parse: function parse(lexed, modules) {
		function moduleParse(placeHolderContent, parsed) {
			var moduleParsed = void 0;
			for (var i = 0, l = modules.length; i < l; i++) {
				var _module = modules[i];
				moduleParsed = _module.parse(placeHolderContent);
				if (moduleParsed) {
					parsed.push(moduleParsed);
					return moduleParsed;
				}
			}
			return null;
		}

		var inPlaceHolder = false;
		var placeHolderContent = void 0;
		var tailParts = [];
		return lexed.reduce(function (parsed, token) {
			if (token.error) {
				return parsed;
			}
			if (token.type === "delimiter") {
				inPlaceHolder = token.position === "start";
				if (token.position === "end") {
					placeHolderContent = DocUtils.wordToUtf8(placeHolderContent);
					if (!moduleParse(placeHolderContent, parsed)) {
						parsed.push({ type: "placeholder", value: placeHolderContent });
					}
					Array.prototype.push.apply(parsed, tailParts);
					tailParts = [];
					return parsed;
				}
				placeHolderContent = "";
				return parsed;
			}
			if (inPlaceHolder) {
				if (token.type === "content" && token.position === "insidetag") {
					placeHolderContent += token.value;
				} else {
					tailParts.push(token);
				}
				return parsed;
			}
			parsed.push(token);
			return parsed;
		}, []);
	}
};

module.exports = parser;
},{"./doc-utils":7}],20:[function(require,module,exports){
"use strict";

var ScopeManager = require("./scope-manager");
var DocUtils = require("./doc-utils");

function moduleRender(part, options) {
	var moduleRendered = void 0;
	for (var i = 0, l = options.modules.length; i < l; i++) {
		var _module = options.modules[i];
		moduleRendered = _module.render(part, options);
		if (moduleRendered) {
			return moduleRendered;
		}
	}
	return false;
}

function render(options) {
	options.render = render;
	options.modules = options.modules;
	if (!options.scopeManager) {
		options.scopeManager = ScopeManager.createBaseScopeManager(options);
	}
	return options.compiled.map(function (part) {
		var moduleRendered = moduleRender(part, options);
		if (moduleRendered) {
			return moduleRendered.value;
		}
		if (part.type === "placeholder") {
			var value = options.scopeManager.getValue(part.value);
			if (value == null) {
				value = options.nullGetter(part);
			}
			return DocUtils.utf8ToWord(value);
		}
		if (part.type === "content" || part.type === "tag") {
			return part.value;
		}

		var err = new Error("Unimplemented tag type \"" + part.type + "\"");
		console.log(JSON.stringify({ part: part }));
		err.properties = {
			part: part
		};
		throw err;
	}).join("");
}

module.exports = render;
},{"./doc-utils":7,"./scope-manager":21}],21:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Errors = require("./errors");

// This class responsibility is to manage the scope
var ScopeManager = function () {
	function ScopeManager(options) {
		_classCallCheck(this, ScopeManager);

		this.scopePath = options.scopePath;
		this.scopeList = options.scopeList;
		this.parser = options.parser;
	}

	_createClass(ScopeManager, [{
		key: "loopOver",
		value: function loopOver(tag, callback, inverted) {
			inverted = inverted || false;
			return this.loopOverValue(this.getValue(tag), callback, inverted);
		}
	}, {
		key: "functorIfInverted",
		value: function functorIfInverted(inverted, functor, value) {
			if (inverted) {
				functor(value);
			}
		}
	}, {
		key: "isValueFalsy",
		value: function isValueFalsy(value, type) {
			return value == null || !value || type === "[object Array]" && value.length === 0;
		}
	}, {
		key: "loopOverValue",
		value: function loopOverValue(value, functor, inverted) {
			var type = Object.prototype.toString.call(value);
			var currentValue = this.scopeList[this.num];
			if (this.isValueFalsy(value, type)) {
				return this.functorIfInverted(inverted, functor, currentValue);
			}
			if (type === "[object Array]") {
				for (var i = 0, scope; i < value.length; i++) {
					scope = value[i];
					this.functorIfInverted(!inverted, functor, scope);
				}
				return;
			}
			if (type === "[object Object]") {
				return this.functorIfInverted(!inverted, functor, value);
			}
			if (value === true) {
				return this.functorIfInverted(!inverted, functor, currentValue);
			}
		}
	}, {
		key: "getValue",
		value: function getValue(tag, num) {
			// search in the scopes (in reverse order) and keep the first defined value
			this.num = num == null ? this.scopeList.length - 1 : num;
			var err = void 0;
			var result = void 0;
			var scope = this.scopeList[this.num];
			var parser = this.parser(tag, { scopePath: this.scopePath });
			try {
				result = parser.get(scope, { num: this.num, scopeList: this.scopeList });
			} catch (error) {
				err = new Errors.XTScopeParserError("Scope parser execution failed");
				err.properties = {
					id: "scopeparser_execution_failed",
					explanation: "The scope parser for the tag " + tag + " failed to execute",
					scope: scope,
					tag: tag,
					rootError: error
				};
				throw err;
			}
			if (result == null && this.num > 0) {
				return this.getValue(tag, this.num - 1);
			}
			return result;
		}
	}, {
		key: "createSubScopeManager",
		value: function createSubScopeManager(scope, tag) {
			var options = {
				scopePath: this.scopePath.slice(0),
				scopeList: this.scopeList.slice(0)
			};

			options.parser = this.parser;
			options.scopeList = this.scopeList.concat(scope);
			options.scopePath = this.scopePath.concat(tag);
			return new ScopeManager(options);
		}
	}]);

	return ScopeManager;
}();

ScopeManager.createBaseScopeManager = function (_ref) {
	var parser = _ref.parser,
	    tags = _ref.tags;

	var options = { parser: parser, tags: tags };
	options.scopePath = [];
	options.scopeList = [tags];
	return new ScopeManager(options);
};

module.exports = ScopeManager;
},{"./errors":9}],22:[function(require,module,exports){
"use strict";

var DocUtils = require("./doc-utils");
var Errors = require("./errors");

function throwRawTagNotInParagraph(options) {
	var err = new Errors.XTTemplateError("Raw tag not in paragraph");
	var tag = options.part.value;
	err.properties = {
		id: "raw_tag_outerxml_invalid",
		explanation: "The tag \"" + tag + "\"",
		rootError: options.rootError,
		xtag: tag,
		postparsed: options.postparsed,
		expandTo: options.expandTo,
		index: options.index
	};
	throw err;
}

function lastTagIsOpenTag(array, tag) {
	if (array.length === 0) {
		return false;
	}
	var lastTag = array[array.length - 1];
	var innerLastTag = lastTag.tag.substr(1);
	var innerCurrentTag = tag.substr(2, tag.length - 3);
	return innerLastTag.indexOf(innerCurrentTag) === 0;
}

function addTag(array, tag) {
	array.push({ tag: tag });
	return array;
}

function getListXmlElements(parts) {
	/*
 get the different closing and opening tags between two texts (doesn't take into account tags that are opened then closed (those that are closed then opened are returned)):
 returns:[{"tag":"</w:r>","offset":13},{"tag":"</w:p>","offset":265},{"tag":"</w:tc>","offset":271},{"tag":"<w:tc>","offset":828},{"tag":"<w:p>","offset":883},{"tag":"<w:r>","offset":1483}]
 */
	var tags = parts.filter(function (part) {
		return part.type === "tag";
	}).map(function (part) {
		return part.value;
	});

	var result = [];

	for (var i = 0, tag; i < tags.length; i++) {
		tag = tags[i];
		// closing tag
		if (tag[1] === "/") {
			if (lastTagIsOpenTag(result, tag)) {
				result.pop();
			} else {
				result = addTag(result, tag);
			}
		} else if (tag[tag.length - 1] !== "/") {
			result = addTag(result, tag);
		}
	}
	return result;
}

function getExpandToDefault(parts) {
	var xmlElements = getListXmlElements(parts);
	for (var i = 0; i < xmlElements.length; i++) {
		var xmlElement = xmlElements[i];
		if (xmlElement.tag.indexOf("<w:tc") === 0) {
			return "w:tr";
		}
		if (xmlElement.tag.indexOf("<a:tc") === 0) {
			return "a:tr";
		}
	}
	return false;
}

function expandOne(part, postparsed, options) {
	var expandTo = part.expandTo || options.expandTo;
	var index = postparsed.indexOf(part);
	if (!expandTo) {
		return postparsed;
	}
	var right = void 0,
	    left = void 0;
	try {
		right = DocUtils.getRight(postparsed, expandTo, index);
		left = DocUtils.getLeft(postparsed, expandTo, index);
	} catch (rootError) {
		if (rootError instanceof Errors.XTTemplateError) {
			throwRawTagNotInParagraph({ part: part, rootError: rootError, postparsed: postparsed, expandTo: expandTo, index: index });
		}
		throw rootError;
	}
	var leftParts = postparsed.slice(left, index);
	var rightParts = postparsed.slice(index + 1, right + 1);
	var inner = options.getInner({ index: index, part: part, leftParts: leftParts, rightParts: rightParts, left: left, right: right, postparsed: postparsed });
	if (!inner.length) {
		inner.expanded = [leftParts, rightParts];
		inner = [inner];
	}
	return DocUtils.concatArrays([postparsed.slice(0, left), inner, postparsed.slice(right + 1)]);
}

function expandToOne(postparsed, options) {
	var errors = [];
	if (postparsed.errors) {
		errors = postparsed.errors;
		postparsed = postparsed.postparsed;
	}
	var expandToElements = postparsed.reduce(function (elements, part) {
		if (part.type === "placeholder" && part.module === options.moduleName) {
			elements.push(part);
		}
		return elements;
	}, []);

	expandToElements.forEach(function (part) {
		try {
			postparsed = expandOne(part, postparsed, options);
		} catch (error) {
			if (error instanceof Errors.XTTemplateError) {
				errors.push(error);
			} else {
				throw error;
			}
		}
	});
	return { postparsed: postparsed, errors: errors };
}

module.exports = {
	expandToOne: expandToOne,
	getExpandToDefault: getExpandToDefault
};
},{"./doc-utils":7,"./errors":9}],23:[function(require,module,exports){
"use strict";
// res class responsibility is to parse the XML.

var DocUtils = require("./doc-utils");

function handleRecursiveCase(res) {
	/*
 	 Because xmlTemplater is recursive (meaning it can call it self), we need to handle special cases where the XML is not valid:
 	 For example with res string "I am</w:t></w:r></w:p><w:p><w:r><w:t>sleeping",
 	 - we need to match also the string that is inside an implicit <w:t> (that's the role of replacerUnshift) (in res case 'I am')
 	 - we need to match the string that is at the right of a <w:t> (that's the role of replacerPush) (in res case 'sleeping')
 	 the test: describe "scope calculation" it "should compute the scope between 2 <w:t>" makes sure that res part of code works
 	 It should even work if they is no XML at all, for example if the code is just "I am sleeping", in res case however, they should only be one match
 	 */

	function replacerUnshift() {
		var pn = { array: Array.prototype.slice.call(arguments) };
		pn.array.shift();
		var match = pn.array[0] + pn.array[1];
		// add match so that pn[0] = whole match, pn[1]= first parenthesis,...
		pn.array.unshift(match);
		pn.array.pop();
		var offset = pn.array.pop();
		pn.offset = offset;
		pn.first = true;
		// add at the beginning
		res.matches.unshift(pn);
	}

	if (res.content.indexOf("<") === -1 && res.content.indexOf(">") === -1) {
		res.content.replace(/^()([^<>]*)$/, replacerUnshift);
	}

	var r = new RegExp("^()([^<]+)</(?:" + res.tagsXmlArrayJoined + ")>");
	res.content.replace(r, replacerUnshift);

	function replacerPush() {
		var pn = { array: Array.prototype.slice.call(arguments) };
		pn.array.pop();
		var offset = pn.array.pop();
		pn.offset = offset;
		pn.last = true;
		// add at the end
		res.matches.push(pn);
	}

	r = new RegExp("(<(?:" + res.tagsXmlArrayJoined + ")[^>]*>)([^>]+)$");
	res.content.replace(r, replacerPush);
	return res;
}

function xmlMatcher(content, tagsXmlArray) {
	var res = {};
	res.content = content;
	res.tagsXmlArray = tagsXmlArray;
	res.tagsXmlArrayJoined = res.tagsXmlArray.join("|");
	var regexp = new RegExp("(<(?:" + res.tagsXmlArrayJoined + ")[^>]*>)([^<>]*)</(?:" + res.tagsXmlArrayJoined + ")>", "g");
	res.matches = DocUtils.pregMatchAll(regexp, res.content);
	return handleRecursiveCase(res);
}

module.exports = function (content, tagsXmlArray) {
	return xmlMatcher(content, tagsXmlArray);
};
},{"./doc-utils":7}],24:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DocUtils = require("./doc-utils");
var ScopeManager = require("./scope-manager");
var xmlMatcher = require("./xml-matcher");
var Errors = require("./errors");
var Lexer = require("./lexer");
var Parser = require("./parser.js");
var _render = require("./render.js");

function _getFullText(content, tagsXmlArray) {
	var matcher = xmlMatcher(content, tagsXmlArray);
	var result = matcher.matches.map(function (match) {
		return match.array[2];
	});
	return DocUtils.wordToUtf8(DocUtils.convertSpaces(result.join("")));
}

module.exports = function () {
	function XmlTemplater(content, options) {
		_classCallCheck(this, XmlTemplater);

		this.fromJson(options);
		this.setModules({ inspect: { filePath: this.filePath } });
		this.load(content);
	}

	_createClass(XmlTemplater, [{
		key: "load",
		value: function load(content) {
			if (typeof content !== "string") {
				var err = new Errors.XTInternalError("Content must be a string");
				err.properties.id = "xmltemplater_content_must_be_string";
				throw err;
			}
			this.content = content;
		}
	}, {
		key: "setTags",
		value: function setTags(tags) {
			this.tags = tags != null ? tags : {};
			this.scopeManager = ScopeManager.createBaseScopeManager({ tags: this.tags, parser: this.parser });
			return this;
		}
	}, {
		key: "fromJson",
		value: function fromJson(options) {
			this.filePath = options.filePath;
			this.modules = options.modules;
			this.fileTypeConfig = options.fileTypeConfig;
			Object.keys(DocUtils.defaults).map(function (key) {
				this[key] = options[key] != null ? options[key] : DocUtils.defaults[key];
			}, this);
		}
	}, {
		key: "getFullText",
		value: function getFullText() {
			return _getFullText(this.content, this.fileTypeConfig.tagsXmlTextArray);
		}
	}, {
		key: "setModules",
		value: function setModules(obj) {
			this.modules.forEach(function (module) {
				module.set(obj);
			});
		}
	}, {
		key: "parse",
		value: function parse() {
			var allErrors = [];
			this.xmllexed = Lexer.xmlparse(this.content, { text: this.fileTypeConfig.tagsXmlTextArray, other: this.fileTypeConfig.tagsXmlLexedArray });
			this.setModules({ inspect: { xmllexed: this.xmllexed } });

			var _Lexer$parse = Lexer.parse(this.xmllexed, this.delimiters),
			    lexed = _Lexer$parse.lexed,
			    lexerErrors = _Lexer$parse.errors;

			allErrors = allErrors.concat(lexerErrors);
			this.lexed = lexed;
			this.setModules({ inspect: { lexed: this.lexed } });
			this.parsed = Parser.parse(this.lexed, this.modules);
			this.setModules({ inspect: { parsed: this.parsed } });

			var _Parser$postparse = Parser.postparse(this.parsed, this.modules),
			    postparsed = _Parser$postparse.postparsed,
			    postparsedErrors = _Parser$postparse.errors;

			this.postparsed = postparsed;
			allErrors = allErrors.concat(postparsedErrors);
			if (allErrors.length) {
				this.modules.forEach(function (module) {
					allErrors = module.errorsTransformer(allErrors);
				});
				Errors.throwMultiError(allErrors);
			}
			return this;
		}
		/*
  content is the whole content to be tagged
  scope is the current scope
  returns the new content of the tagged content
  */

	}, {
		key: "render",
		value: function render(to) {
			this.filePath = to;
			this.setModules({ inspect: { postparsed: this.postparsed } });
			var options = {
				compiled: this.postparsed,
				tags: this.tags,
				modules: this.modules,
				parser: this.parser,
				nullGetter: this.nullGetter,
				filePath: this.filePath
			};
			this.content = _render(options);
			this.setModules({ inspect: { content: this.content } });
			return this;
		}
	}]);

	return XmlTemplater;
}();
},{"./doc-utils":7,"./errors":9,"./lexer":11,"./parser.js":19,"./render.js":20,"./scope-manager":21,"./xml-matcher":23}],25:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"./dom":26,"./sax":27,"dup":4}],26:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],27:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],"/js/index.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var templates = require("./templates");
var DocUtils = require("docxtemplater").DocUtils;
var DOMParser = require("xmldom").DOMParser;

function isNaN(number) {
	return !(number === number);
}

var ImgManager = require("./imgManager");
var moduleName = "open-xml-templating/docxtemplater-image-module";

function getInnerDocx(_ref) {
	var part = _ref.part;

	return part;
}

function getInnerPptx(_ref2) {
	var part = _ref2.part,
	    left = _ref2.left,
	    right = _ref2.right,
	    postparsed = _ref2.postparsed;

	var xmlString = postparsed.slice(left + 1, right).reduce(function (concat, item) {
		return concat + item.value;
	}, "");
	var xmlDoc = new DOMParser().parseFromString("<xml>" + xmlString + "</xml>");
	var offset = xmlDoc.getElementsByTagName("a:off");
	var ext = xmlDoc.getElementsByTagName("a:ext");
	part.ext = {
		cx: parseInt(ext[0].getAttribute("cx"), 10),
		cy: parseInt(ext[0].getAttribute("cy"), 10)
	};
	part.offset = {
		x: parseInt(offset[0].getAttribute("x"), 10),
		y: parseInt(offset[0].getAttribute("y"), 10)
	};
	return part;
}

var ImageModule = function () {
	function ImageModule(options) {
		_classCallCheck(this, ImageModule);

		this.name = "ImageModule";
		this.options = options || {};
		this.imgManagers = {};
		if (this.options.centered == null) {
			this.options.centered = false;
		}
		if (this.options.getImage == null) {
			throw new Error("You should pass getImage");
		}
		if (this.options.getSize == null) {
			throw new Error("You should pass getSize");
		}
		this.imageNumber = 1;
	}

	_createClass(ImageModule, [{
		key: "optionsTransformer",
		value: function optionsTransformer(options, docxtemplater) {
			var relsFiles = docxtemplater.zip.file(/\.xml\.rels/).concat(docxtemplater.zip.file(/\[Content_Types\].xml/)).map(function (file) {
				return file.name;
			});
			this.fileTypeConfig = docxtemplater.fileTypeConfig;
			this.fileType = docxtemplater.fileType;
			this.zip = docxtemplater.zip;
			options.xmlFileNames = options.xmlFileNames.concat(relsFiles);
			return options;
		}
	}, {
		key: "set",
		value: function set(options) {
			if (options.zip) {
				this.zip = options.zip;
			}
			if (options.xmlDocuments) {
				this.xmlDocuments = options.xmlDocuments;
			}
		}
	}, {
		key: "parse",
		value: function parse(placeHolderContent) {
			var module = moduleName;
			var type = "placeholder";
			if (placeHolderContent.substring(0, 2) === "%%") {
				return { type: type, value: placeHolderContent.substr(2), module: module, centered: true };
			}
			if (placeHolderContent.substring(0, 1) === "%") {
				return { type: type, value: placeHolderContent.substr(1), module: module, centered: false };
			}
			return null;
		}
	}, {
		key: "postparse",
		value: function postparse(parsed) {
			var expandTo = void 0;
			var getInner = void 0;
			if (this.fileType === "pptx") {
				expandTo = "p:sp";
				getInner = getInnerPptx;
			} else {
				expandTo = this.options.centered ? "w:p" : "w:t";
				getInner = getInnerDocx;
			}
			return DocUtils.traits.expandToOne(parsed, { moduleName: moduleName, getInner: getInner, expandTo: expandTo });
		}
	}, {
		key: "render",
		value: function render(part, options) {
			this.imgManagers[options.filePath] = this.imgManagers[options.filePath] || new ImgManager(this.zip, options.filePath, this.xmlDocuments, this.fileType);
			var imgManager = this.imgManagers[options.filePath];
			if (!part.type === "placeholder" || part.module !== moduleName) {
				return null;
			}
			var tagValue = options.scopeManager.getValue(part.value);
			if (!tagValue) {
				return { value: this.fileTypeConfig.tagTextXml };
			}
			var imgBuffer = this.options.getImage(tagValue, part.value);
			if (!imgBuffer) {
				return { value: this.fileTypeConfig.tagTextXml };
			}
			var rId = imgManager.addImageRels(this.getNextImageName(), imgBuffer);
			var sizePixel = this.options.getSize(imgBuffer, tagValue, part.value);
			return this.getRenderedPart(part, rId, sizePixel);
		}
	}, {
		key: "getRenderedPart",
		value: function getRenderedPart(part, rId, sizePixel) {
			if (isNaN(rId)) {
				throw new Error("rId is NaN, aborting");
			}
			var size = [DocUtils.convertPixelsToEmus(sizePixel[0]), DocUtils.convertPixelsToEmus(sizePixel[1])];
			var centered = this.options.centered || part.centered;
			var newText = void 0;
			if (this.fileType === "pptx") {
				newText = this.getRenderedPartPptx(part, rId, size, centered);
			} else {
				newText = this.getRenderedPartDocx(rId, size, centered);
			}
			return { value: newText };
		}
	}, {
		key: "getRenderedPartPptx",
		value: function getRenderedPartPptx(part, rId, size, centered) {
			var offset = { x: part.offset.x, y: part.offset.y };
			var cellCX = part.ext.cx;
			var cellCY = part.ext.cy;
			var imgW = size[0];
			var imgH = size[1];

			if (centered) {
				offset.x += cellCX / 2 - imgW / 2;
				offset.y += cellCY / 2 - imgH / 2;
			}

			return templates.getPptxImageXml(rId, [imgW, imgH], offset);
		}
	}, {
		key: "getRenderedPartDocx",
		value: function getRenderedPartDocx(rId, size, centered) {
			return centered ? templates.getImageXmlCentered(rId, size) : templates.getImageXml(rId, size);
		}
	}, {
		key: "getNextImageName",
		value: function getNextImageName() {
			var name = "image_generated_" + this.imageNumber + ".png";
			this.imageNumber++;
			return name;
		}
	}]);

	return ImageModule;
}();

module.exports = ImageModule;
},{"./imgManager":2,"./templates":3,"docxtemplater":8,"xmldom":4}]},{},[])("/js/index.js")
});