"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("../utils.js"),
    expect = _require.expect,
    makeDocxV4 = _require.makeDocxV4,
    makePptxV4 = _require.makePptxV4,
    cleanRecursive = _require.cleanRecursive,
    errorVerifier = _require.errorVerifier,
    captureLogs = _require.captureLogs;

var fixtures = require("./fixtures.js");

var inspectModule = require("../../inspect-module.js");

var AssertionModule = require("../assertion-module.js");

var utf8decode = require("../../uintarray-to-string.js");

function expectations(iModule, fixture) {
  cleanRecursive(iModule.inspect);

  if (fixture.error) {
    throw new Error("Fixture should have failed but did not fail");
  }

  if (fixture.result !== null) {
    var content = iModule.inspect.content;

    if (iModule.inspect.content instanceof Uint8Array) {
      content = utf8decode(content);
    }

    expect(content).to.be.deep.equal(fixture.result, "Content incorrect");
  }

  if (fixture.lexed !== null) {
    expect(iModule.inspect.lexed).to.be.deep.equal(fixture.lexed, "Lexed incorrect");
  }

  if (fixture.parsed !== null) {
    expect(iModule.inspect.parsed).to.be.deep.equal(fixture.parsed, "Parsed incorrect");
  }

  if (fixture.postparsed !== null) {
    expect(iModule.inspect.postparsed).to.be.deep.equal(fixture.postparsed, "Postparsed incorrect");
  }

  if (fixture.xmllexed != null) {
    expect(iModule.inspect.xmllexed).to.be.deep.equal(fixture.xmllexed, "Xmllexed incorrect");
  }
}

function runTest(fixture) {
  var async = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  fixture.options = fixture.options || {};
  var modules = [];
  var iModule = inspectModule();
  modules.push(iModule, new AssertionModule());

  if (fixture.options.modules) {
    fixture.options.modules().forEach(function (mod) {
      modules.push(mod);
    });
  }

  var doc;
  var capture = captureLogs();

  try {
    doc = fixture.pptx ? makePptxV4("temp.docx", fixture.content, _objectSpread(_objectSpread({}, fixture.options), {}, {
      modules: modules
    })) : makeDocxV4("temp.docx", fixture.content, _objectSpread(_objectSpread({}, fixture.options), {}, {
      modules: modules
    }));
    doc.setData(fixture.scope);
    capture.stop();
  } catch (error) {
    capture.stop();

    if (!fixture.error) {
      throw error;
    }

    errorVerifier(error, fixture.errorType, fixture.error);
    return;
  }

  var capture2 = captureLogs();

  if (async === false) {
    try {
      doc.render();
      capture2.stop();
    } catch (error) {
      capture2.stop();

      if (!fixture.error) {
        throw error;
      }

      errorVerifier(error, fixture.errorType, fixture.error);
      return;
    }

    capture2.stop();
    expectations(iModule, fixture);
  } else {
    return doc.renderAsync(fixture.scope).then(function () {
      capture2.stop();
      expectations(iModule, fixture);

      if (fixture.resolved) {
        expect(iModule.inspect.resolved).to.be.deep.equal(fixture.resolved, "Resolved incorrect");
      }
    }, function (error) {
      capture2.stop();

      if (!fixture.error) {
        throw error;
      }

      errorVerifier(error, fixture.errorType, fixture.error);
    });
  }
}

describe("Algorithm", function () {
  fixtures.forEach(function (fixture) {
    (fixture.onlySync ? it.only : it)(fixture.it, function () {
      return runTest(fixture, false);
    });
    (fixture.only ? it.only : it)("Async ".concat(fixture.it), function () {
      // Return is important to make the test fail if there is an async error
      return runTest(fixture, true);
    });
  });
});