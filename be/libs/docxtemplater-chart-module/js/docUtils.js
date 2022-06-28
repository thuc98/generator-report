var DOMParser, DocUtils, XMLSerializer,
  splice = [].splice;

DOMParser = require('xmldom').DOMParser;

XMLSerializer = require('xmldom').XMLSerializer;

DocUtils = {};

DocUtils.xml2Str = function(xmlNode) {
  var a;
  a = new XMLSerializer();
  return a.serializeToString(xmlNode);
};

DocUtils.Str2xml = function(str, errorHandler) {
  var parser, xmlDoc;
  parser = new DOMParser({errorHandler});
  return xmlDoc = parser.parseFromString(str, "text/xml");
};

DocUtils.maxArray = function(a) {
  return Math.max.apply(null, a);
};

DocUtils.decodeUtf8 = function(s) {
  var e;
  try {
    if (s === void 0) {
      return void 0;
    }
    return decodeURIComponent(escape(DocUtils.convertSpaces(s))); //replace Ascii 160 space by the normal space, Ascii 32
  } catch (error) {
    e = error;
    console.error(s);
    console.error('could not decode');
    throw new Error('end');
  }
};

DocUtils.encodeUtf8 = function(s) {
  return unescape(encodeURIComponent(s));
};

DocUtils.convertSpaces = function(s) {
  return s.replace(new RegExp(String.fromCharCode(160), "g"), " ");
};

DocUtils.pregMatchAll = function(regex, content) {
  var matchArray, replacer;
  if (!(typeof regex === 'object')) {
    regex = new RegExp(regex, 'g');
  }
  matchArray = [];
  replacer = function(match, ...pn) {
    var offset, ref, string;
    ref = pn, [...pn] = ref, [offset, string] = splice.call(pn, -2);
    pn.unshift(match); //add match so that pn[0] = whole match, pn[1]= first parenthesis,...
    pn.offset = offset;
    return matchArray.push(pn);
  };
  content.replace(regex, replacer);
  return matchArray;
};

module.exports = DocUtils;
