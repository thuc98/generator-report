"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function isArray(thing) {
  return thing instanceof Array;
}

function isObject(thing) {
  return thing instanceof Object && !isArray(thing);
}

function isString(thing) {
  return typeof thing === "string";
}

var AssertionModule = /*#__PURE__*/function () {
  function AssertionModule() {
    _classCallCheck(this, AssertionModule);

    this.name = "AssertionModule";
  }

  _createClass(AssertionModule, [{
    key: "optionsTransformer",
    value: function optionsTransformer(options, docxtemplater) {
      docxtemplater.modules.forEach(function (module) {
        if (!module.name) {
          throw new Error("Unnamed module");
        }
      });
      return options;
    }
  }, {
    key: "preparse",
    value: function preparse(parsed) {
      if (!isArray(parsed)) {
        throw new Error("Parsed should be an array");
      }
    }
  }, {
    key: "matchers",
    value: function matchers(options) {
      if (!isArray(options.modules)) {
        throw new Error("Options.modules should be an array");
      }

      return [];
    }
  }, {
    key: "parse",
    value: function parse(placeholderContent, options) {
      if (!isString(placeholderContent)) {
        throw new Error("placeholderContent should be a string");
      }

      var type = options.type,
          position = options.position,
          filePath = options.filePath,
          contentType = options.contentType,
          lIndex = options.lIndex;

      if (typeof type !== "string") {
        throw new Error("parsed contains part without type");
      }

      if (type !== "delimiter") {
        throw new Error("parsed contains part with invalid type : '".concat(type, "'"));
      }

      if (position !== "end") {
        throw new Error("parsed contains part with invalid position : '".concat(position, "'"));
      }

      if (typeof filePath !== "string" || filePath.length === 0) {
        throw new Error("parsed contains part without filePath");
      }

      if (typeof contentType !== "string" || contentType.length === 0) {
        throw new Error("parsed contains part without contentType");
      }

      if (!lIndex) {
        throw new Error("parsed contains part without lIndex");
      }
    }
  }, {
    key: "postparse",
    value: function postparse(parsed, _ref) {
      var filePath = _ref.filePath,
          contentType = _ref.contentType;

      if (!isArray(parsed)) {
        throw new Error("Parsed should be an array");
      }

      if (!isString(filePath)) {
        throw new Error("filePath should be a string");
      }

      if (!isString(contentType)) {
        throw new Error("contentType should be a string");
      }

      function logContext(parsed, i) {
        var context = parsed.slice(i - 2, i + 2); // eslint-disable-next-line no-console

        console.log(JSON.stringify({
          context: context
        }));
      }

      parsed.forEach(function (part, i) {
        if (part == null) {
          logContext(parsed, i);
          throw new Error("postparsed contains nullish value");
        }

        if (!part) {
          logContext(parsed, i);
          throw new Error("postparsed contains falsy value");
        }

        if (typeof part.type !== "string") {
          logContext(parsed, i);
          throw new Error("postparsed contains part without type");
        }

        if (["content", "tag", "placeholder"].indexOf(part.type) === -1) {
          logContext(parsed, i);
          throw new Error("postparsed contains part with invalid type : '".concat(part.type, "'"));
        }
      });
    }
  }, {
    key: "render",
    value: function render(part, _ref2) {
      var filePath = _ref2.filePath,
          contentType = _ref2.contentType;

      if (!isObject(part)) {
        throw new Error("part should be an object");
      }

      if (!isString(filePath)) {
        throw new Error("filePath should be a string");
      }

      if (!isString(contentType)) {
        throw new Error("contentType should be a string");
      }
    }
  }, {
    key: "postrender",
    value: function postrender(parts) {
      if (!isArray(parts)) {
        throw new Error("Parts should be an array");
      }

      return parts;
    }
  }]);

  return AssertionModule;
}();

module.exports = AssertionModule;