"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var wrapper = require("../module-wrapper.js");

var _require = require("../errors.js"),
    getScopeCompilationError = _require.getScopeCompilationError;

var _require2 = require("../doc-utils.js"),
    utf8ToWord = _require2.utf8ToWord,
    hasCorruptCharacters = _require2.hasCorruptCharacters;

var _require3 = require("../errors.js"),
    getCorruptCharactersException = _require3.getCorruptCharactersException;

var ftprefix = {
  docx: "w",
  pptx: "a"
};

var Render = /*#__PURE__*/function () {
  function Render() {
    _classCallCheck(this, Render);

    this.name = "Render";
    this.recordRun = false;
    this.recordedRun = [];
  }

  _createClass(Render, [{
    key: "optionsTransformer",
    value: function optionsTransformer(options, docxtemplater) {
      this.parser = docxtemplater.parser;
      this.fileType = docxtemplater.fileType;
      return options;
    }
  }, {
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
        mapper[from] = {
          from: from,
          data: _this.data
        };
        return mapper;
      }, mapper);
    }
  }, {
    key: "postparse",
    value: function postparse(postparsed, options) {
      var _this2 = this;

      var errors = [];
      postparsed.forEach(function (p) {
        if (p.type === "placeholder") {
          var tag = p.value;

          try {
            options.cachedParsers[p.lIndex] = _this2.parser(tag, {
              tag: p
            });
          } catch (rootError) {
            errors.push(getScopeCompilationError({
              tag: tag,
              rootError: rootError,
              offset: p.offset
            }));
          }
        }
      });
      return {
        postparsed: postparsed,
        errors: errors
      };
    }
  }, {
    key: "render",
    value: function render(part, _ref) {
      var scopeManager = _ref.scopeManager,
          linebreaks = _ref.linebreaks,
          nullGetter = _ref.nullGetter;

      if (linebreaks) {
        this.recordRuns(part);
      }

      if (part.type !== "placeholder" || part.module) {
        return;
      }

      var value;

      try {
        value = scopeManager.getValue(part.value, {
          part: part
        });
      } catch (e) {
        return {
          errors: [e]
        };
      }

      if (value == null) {
        value = nullGetter(part);
      }

      if (hasCorruptCharacters(value)) {
        return {
          errors: [getCorruptCharactersException({
            tag: part.value,
            value: value,
            offset: part.offset
          })]
        };
      }

      return {
        value: linebreaks && typeof value === "string" ? this.renderLineBreaks(value) : utf8ToWord(value)
      };
    }
  }, {
    key: "recordRuns",
    value: function recordRuns(part) {
      if (part.tag === "".concat(ftprefix[this.fileType], ":r")) {
        this.recordedRun = [];
      } else if (part.tag === "".concat(ftprefix[this.fileType], ":rPr")) {
        if (part.position === "start") {
          this.recordRun = true;
          this.recordedRun = [part.value];
        }

        if (part.position === "end") {
          this.recordedRun.push(part.value);
          this.recordRun = false;
        }
      } else if (this.recordRun) {
        this.recordedRun.push(part.value);
      }
    }
  }, {
    key: "renderLineBreaks",
    value: function renderLineBreaks(value) {
      var _this3 = this;

      var p = ftprefix[this.fileType];
      var br = this.fileType === "docx" ? "<w:r><w:br/></w:r>" : "<a:br/>";
      var lines = value.split("\n");
      var runprops = this.recordedRun.join("");
      return lines.map(function (line) {
        return utf8ToWord(line);
      }).reduce(function (result, line, i) {
        result.push(line);

        if (i < lines.length - 1) {
          result.push("</".concat(p, ":t></").concat(p, ":r>").concat(br, "<").concat(p, ":r>").concat(runprops, "<").concat(p, ":t").concat(_this3.fileType === "docx" ? ' xml:space="preserve"' : "", ">"));
        }

        return result;
      }, []);
    }
  }]);

  return Render;
}();

module.exports = function () {
  return wrapper(new Render());
};