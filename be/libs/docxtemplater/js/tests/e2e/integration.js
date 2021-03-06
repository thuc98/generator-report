"use strict";

var _require = require("../utils.js"),
    expectToThrow = _require.expectToThrow,
    createDoc = _require.createDoc,
    createDocV4 = _require.createDocV4,
    shouldBeSame = _require.shouldBeSame,
    expect = _require.expect,
    createXmlTemplaterDocxNoRender = _require.createXmlTemplaterDocxNoRender,
    captureLogs = _require.captureLogs;

var printy = require("../printy.js");

var expectedPrintedPostParsed = require("../data/printy-postparsed.js");

var angularParser = require("../angular-parser.js");

var Errors = require("../../errors.js");

describe("Simple templating", function () {
  describe("text templating", function () {
    it("should change values with template data", function () {
      var tags = {
        first_name: "Hipp",
        last_name: "Edgar",
        phone: "0652455478",
        description: "New Website"
      };
      var doc = createDocV4("tag-example.docx");
      doc.setData(tags);
      doc.render();
      expect(doc.getFullText()).to.be.equal("Edgar Hipp");
      expect(doc.getFullText("word/header1.xml")).to.be.equal("Edgar Hipp0652455478New Website");
      expect(doc.getFullText("word/footer1.xml")).to.be.equal("EdgarHipp0652455478");
      shouldBeSame({
        doc: doc,
        expectedName: "expected-tag-example.docx"
      });
    });
  });
  it("should replace custom properties text", function () {
    var doc = createDoc("properties.docx");
    var app = doc.getZip().files["docProps/app.xml"].asText();
    var core = doc.getZip().files["docProps/core.xml"].asText();
    expect(app).to.contain("{tag1}");
    expect(core).to.contain("{tag1}");
    expect(core).to.contain("{tag2}");
    expect(core).to.contain("{tag3}");
    expect(app).to.contain("{tag4}");
    expect(app).to.contain("{tag5}");
    expect(core).to.contain("{tag6}");
    expect(core).to.contain("{tag7}");
    expect(core).to.contain("{tag8}");
    expect(app).to.contain("{tag9}");
    doc.setData({
      tag1: "resolvedvalue1",
      tag2: "resolvedvalue2",
      tag3: "resolvedvalue3",
      tag4: "resolvedvalue4",
      tag5: "resolvedvalue5",
      tag6: "resolvedvalue6",
      tag7: "resolvedvalue7",
      tag8: "resolvedvalue8",
      tag9: "resolvedvalue9"
    }).render();
    app = doc.getZip().files["docProps/app.xml"].asText();
    core = doc.getZip().files["docProps/core.xml"].asText();
    expect(app).to.contain("resolvedvalue1");
    expect(core).to.contain("resolvedvalue1");
    expect(core).to.contain("resolvedvalue2");
    expect(core).to.contain("resolvedvalue3");
    expect(app).to.contain("resolvedvalue4");
    expect(app).to.contain("resolvedvalue5");
    expect(core).to.contain("resolvedvalue6");
    expect(core).to.contain("resolvedvalue7");
    expect(core).to.contain("resolvedvalue8");
    expect(app).to.contain("resolvedvalue9");
  });
});
describe("Docxtemplater internal properties", function () {
  it("should calculate filesContentTypes and invertedContentTypes", function () {
    var doc = createDocV4("tag-example.docx");
    expect(doc.filesContentTypes).to.deep.equal({
      "_rels/.rels": "application/vnd.openxmlformats-package.relationships+xml",
      "word/_rels/document.xml.rels": "application/vnd.openxmlformats-package.relationships+xml",
      "docProps/app.xml": "application/vnd.openxmlformats-officedocument.extended-properties+xml",
      "docProps/core.xml": "application/vnd.openxmlformats-package.core-properties+xml",
      "word/document.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
      "word/endnotes.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml",
      "word/fontTable.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml",
      "word/footer1.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml",
      "word/footnotes.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml",
      "word/header1.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml",
      "word/settings.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml",
      "word/styles.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml",
      "word/stylesWithEffects.xml": "application/vnd.ms-word.stylesWithEffects+xml",
      "word/theme/theme1.xml": "application/vnd.openxmlformats-officedocument.theme+xml",
      "word/webSettings.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"
    });
    expect(doc.invertedContentTypes).to.deep.equal({
      "application/vnd.openxmlformats-package.relationships+xml": ["_rels/.rels", "word/_rels/document.xml.rels"],
      "application/vnd.ms-word.stylesWithEffects+xml": ["word/stylesWithEffects.xml"],
      "application/vnd.openxmlformats-officedocument.extended-properties+xml": ["docProps/app.xml"],
      "application/vnd.openxmlformats-officedocument.theme+xml": ["word/theme/theme1.xml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": ["word/document.xml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": ["word/endnotes.xml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml": ["word/fontTable.xml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": ["word/footer1.xml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": ["word/footnotes.xml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml": ["word/header1.xml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": ["word/settings.xml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": ["word/styles.xml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml": ["word/webSettings.xml"],
      "application/vnd.openxmlformats-package.core-properties+xml": ["docProps/core.xml"]
    });
  });
  it("should calculate filesContentTypes and invertedContentTypes", function () {
    var doc = createDocV4("cond-image.docx");
    var jpegImages = doc.invertedContentTypes["image/jpeg"];
    expect(jpegImages).to.deep.equal(["word/media/image1.jpeg"]);
    expect(doc.invertedContentTypes["application/vnd.openxmlformats-package.relationships+xml"]).to.deep.equal(["_rels/.rels", "word/_rels/document.xml.rels"]);
  });
  it("should load relationships with xmlDocuments", function () {
    var xmlDocs = null;
    var mod = {
      name: "XmlDocumentsModule",
      set: function set(options) {
        if (options.xmlDocuments) {
          xmlDocs = options.xmlDocuments;
        }
      }
    };
    createDocV4("with-default-contenttype.docx", {
      modules: [mod]
    });
    var keys = Object.keys(xmlDocs);
    var ct = "[Content_Types].xml";
    expect(keys).to.deep.equal([ct]);
    var mainDoc = xmlDocs[ct];
    expect(mainDoc.getElementsByTagName("Override")[0].getAttribute("PartName")).to.equal("/docProps/core.xml");
    expect(mainDoc.getElementsByTagName("parsererror").length).to.equal(0);
  });
});
describe("Special characters", function () {
  it("should not escape tab character", function () {
    shouldBeSame({
      doc: createDocV4("tab-character.pptx").render(),
      expectedName: "expected-tab-character.pptx"
    });
  });
  it("should not double escape loop containing hebrew", function () {
    var tags = {
      title: "Default title",
      products: [{
        title: "Duk",
        name: "DukSoftware",
        reference: "DS0"
      }, {
        title: "Tingerloo",
        name: "Tingerlee",
        reference: "T00"
      }, {
        title: "Tingerloo",
        name: "Tingerlee",
        reference: "T00"
      }, {
        title: "Tingerloo",
        name: "Tingerlee",
        reference: "T00"
      }]
    };
    var doc = createDocV4("loop-hebrew.docx");
    doc.render(tags);
    shouldBeSame({
      doc: doc,
      expectedName: "expected-loop-hebrew.docx"
    });
  });
});
describe("Spacing/Linebreaks", function () {
  it("should show spaces with linebreak option", function () {
    var doc = createDoc("tag-multiline.docx");
    doc.setData({
      description: "hello there\n    deep indentation\n       goes here\n    end"
    });
    doc.setOptions({
      linebreaks: true
    });
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-multiline-indent.docx"
    });
  });
  it("should be possible to have linebreaks if setting the option", function () {
    var doc = createDoc("tag-multiline.docx");
    doc.setData({
      description: "The description,\nmultiline"
    });
    doc.setOptions({
      linebreaks: true
    });
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-multiline.docx"
    });
  });
  it("should not remove section if having normal loop just before", function () {
    var doc = createDoc("loop-with-section-break-after.docx");
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-loop-with-section-break-after.docx"
    });
  });
  it("should not remove section if having paragraph loop just before", function () {
    var doc = createDoc("paragraph-loop-with-section-break-after.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-paragraph-loop-with-section-break-after.docx"
    });
  });
  it("should work with linebreaks and copy the run style onto new lines in docx", function () {
    var doc = createDocV4("multi-tags.docx", {
      linebreaks: true
    });
    return doc.renderAsync({
      test: "The tag1,\nmultiline\nfoobaz",
      test2: "The tag2,\nmultiline\nfoobar"
    }).then(function () {
      shouldBeSame({
        doc: doc,
        expectedName: "expected-two-multiline.docx"
      });
    });
  });
  it("should work with linebreaks and copy the run style onto new lines in pptx", function () {
    var doc = createDoc("tag-multiline.pptx");
    doc.setData({
      description: "The description,\nmultiline"
    });
    doc.setOptions({
      linebreaks: true
    });
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-multiline.pptx"
    });
  });
  it("should not fail when using linebreaks and tagvalue not a string", function () {
    var doc = createDoc("tag-multiline.pptx");
    doc.setData({
      description: true
    });
    doc.setOptions({
      linebreaks: true
    });
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-regression-multiline.pptx"
    });
  });
});
describe("Assignment", function () {
  it("should be possible to assign a value from the template", function () {
    var doc = createDoc("assignment.docx");
    doc.setData({
      first_name: "Jane",
      last_name: "Doe"
    });
    doc.setOptions({
      paragraphLoop: true,
      parser: angularParser
    });
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-assignment.docx"
    });
  });
});
describe("Unusual document extensions", function () {
  it("should work with docm", function () {
    var tags = {
      user: "John"
    };
    var doc = createDoc("input.docm");
    doc.render(tags);
    shouldBeSame({
      doc: doc,
      expectedName: "expected-docm.docx"
    });
  });
  it("should work with pptm", function () {
    var tags = {
      user: "John"
    };
    var doc = createDoc("input.pptm");
    doc.render(tags);
    shouldBeSame({
      doc: doc,
      expectedName: "expected-pptm.pptx"
    });
  });
  it("should work with dotx", function () {
    var tags = {
      user: "John"
    };
    var doc = createDoc("input.dotx");
    doc.render(tags);
    shouldBeSame({
      doc: doc,
      expectedName: "expected-dotx.docx"
    });
  });
  it("should work with dotm", function () {
    var tags = {
      user: "John"
    };
    var doc = createDoc("input.dotm");
    doc.render(tags);
    shouldBeSame({
      doc: doc,
      expectedName: "expected-dotm.docx"
    });
  });
});
describe("Dash Loop", function () {
  it("should work on simple table -> w:tr", function () {
    var tags = {
      os: [{
        type: "linux",
        price: "0",
        reference: "Ubuntu10"
      }, {
        type: "DOS",
        price: "500",
        reference: "Win7"
      }, {
        type: "apple",
        price: "1200",
        reference: "MACOSX"
      }]
    };
    var doc = createDoc("tag-dash-loop.docx");
    doc.setData(tags);
    doc.render();
    var expectedText = "linux0Ubuntu10DOS500Win7apple1200MACOSX";
    var text = doc.getFullText();
    expect(text).to.be.equal(expectedText);
  });
  it("should work on simple table -> w:table", function () {
    var tags = {
      os: [{
        type: "linux",
        price: "0",
        reference: "Ubuntu10"
      }, {
        type: "DOS",
        price: "500",
        reference: "Win7"
      }, {
        type: "apple",
        price: "1200",
        reference: "MACOSX"
      }]
    };
    var doc = createDoc("tag-dash-loop-table.docx");
    doc.setData(tags);
    doc.render();
    var expectedText = "linux0Ubuntu10DOS500Win7apple1200MACOSX";
    var text = doc.getFullText();
    expect(text).to.be.equal(expectedText);
  });
  it("should work on simple list -> w:p", function () {
    var tags = {
      os: [{
        type: "linux",
        price: "0",
        reference: "Ubuntu10"
      }, {
        type: "DOS",
        price: "500",
        reference: "Win7"
      }, {
        type: "apple",
        price: "1200",
        reference: "MACOSX"
      }]
    };
    var doc = createDoc("tag-dash-loop-list.docx");
    doc.setData(tags);
    doc.render();
    var expectedText = "linux 0 Ubuntu10 DOS 500 Win7 apple 1200 MACOSX ";
    var text = doc.getFullText();
    expect(text).to.be.equal(expectedText);
  });
  it("should not corrupt document if using empty {-a:p} inside table cell", function () {
    var doc = createDoc("regression-dash-loop-in-table-cell.pptx");
    doc.setData().render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-table-3-cells.pptx"
    });
  });
  it("should not corrupt document if using empty {-a:p} inside table cell", function () {
    var doc = createDoc("regression-dash-loop-in-table-cell.pptx");
    doc.setData({
      cond: [1, 2, 3]
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-table-3-true-cells.pptx"
    });
  });
});
describe("Section breaks inside loops", function () {
  it("should work at beginning of paragraph loop with 3 elements", function () {
    // Warning : In libreoffice, this is not rendered correctly, use WPS or Word
    var doc = createDoc("page-break-inside-condition.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      cond: [1, 2, 3]
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-with-page-break-3-els.docx"
    });
  });
  it("should work at beginning of paragraph loop with false", function () {
    // Warning : In libreoffice, this is not rendered correctly, use WPS or Word
    var doc = createDoc("page-break-inside-condition.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      cond: false
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-with-page-break-falsy.docx"
    });
  });
  it("should work at beginning of std loop with false", function () {
    // Warning : In libreoffice, this is not rendered correctly, use WPS or Word
    var doc = createDoc("page-break-inside-condition.docx");
    doc.setData({
      cond: false
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-page-break-falsy-std-loop.docx"
    });
  });
  it("should work at beginning of std loop with 3 elements", function () {
    // Warning : In libreoffice, this is not rendered correctly, use WPS or Word
    var doc = createDoc("page-break-inside-condition.docx");
    doc.setData({
      cond: [1, 2, 3]
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-page-break-3-els-std-loop.docx"
    });
  });
  it("should work at beginning of std loop with truthy", function () {
    // Warning : In libreoffice, this is not rendered correctly, use WPS or Word
    var doc = createDoc("page-break-inside-condition.docx");
    doc.setData({
      cond: true
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-page-break-truthy-std-loop.docx"
    });
  });
  it("should work with table inside paragraph loop", function () {
    var doc = createDoc("pagebreak-table-loop.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      loop: [1, 2, 3]
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-pagebreak-table-loop.docx"
    });
  });
  it("should work at end of std loop", function () {
    var doc = createDoc("paragraph-loop-with-pagebreak.docx");
    doc.setData({
      users: [{
        name: "Bar"
      }, {
        name: "John"
      }, {
        name: "Baz"
      }]
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-noparagraph-loop-with-pagebreak.docx"
    });
  });
  it("should work at end of paragraph loop", function () {
    var doc = createDoc("paragraph-loop-with-pagebreak.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      users: [{
        name: "Bar"
      }, {
        name: "John"
      }, {
        name: "Baz"
      }]
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-paragraph-loop-with-pagebreak.docx"
    });
  });
  it("should work with pagebreak afterwards with falsy value", function () {
    var doc = createDoc("paragraph-loop-with-pagebreak.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      users: false
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-paragraph-loop-empty-with-pagebreak.docx"
    });
  });
  it("should make first section break of the file continuous", function () {
    var tags = {
      loop: [1, 2, 3]
    };
    var doc = createDocV4("loop-with-continuous-section-break.docx", {
      paragraphLoop: true,
      parser: angularParser
    });
    doc.setData(tags);
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-loop-with-continuous-section-break.docx"
    });
  });
  it("should work with delimiters << >> when saved in word as &gt;&gt;test>>", function () {
    var tags = {
      my_tag: "Hello John"
    };
    var doc = createDocV4("gt-delimiters.docx", {
      parser: angularParser,
      delimiters: {
        start: "<<",
        end: ">>"
      }
    });
    doc.setData(tags);
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-rendered-hello.docx"
    });
  });
  it("should make first section break of the file continuous", function () {
    var tags = {
      loop: [1, 2, 3]
    };
    var doc = createDocV4("loop-with-continuous-section-break.docx", {
      parser: angularParser
    });
    doc.setData(tags);
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-loop-with-continuous-section-break-2.docx"
    });
  });
});
describe("ParagraphLoop", function () {
  it("should work with docx", function () {
    var doc = createDoc("users.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      users: ["John", "Jane", "Louis"]
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-users.docx"
    });
  });
  it("should not drop image with text", function () {
    var doc = createDoc("cond-image.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      cond: true
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-cond-image.docx"
    });
  });
  it("should not drop image without text", function () {
    var doc = createDoc("cond-image-no-innertext.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      cond: true
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-cond-image-no-innertext.docx"
    });
  });
  it("should not drop image without text at beginning", function () {
    var doc = createDoc("cond-image-no-innertext-before.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      cond: true
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-cond-image-no-innertext-before.docx"
    });
  });
  it("should work without removing extra text", function () {
    var doc = createDoc("paragraph-loops.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.render({
      condition: [1, 2],
      l1: [{
        l2: ["a", "b", "c"]
      }, {
        l2: ["d", "e", "f"]
      }],
      placeholder: "placeholder-value"
    });
    shouldBeSame({
      doc: doc,
      expectedName: "expected-paragraph-loop.docx"
    });
  });
  it("should work with pptx", function () {
    var doc = createDoc("paragraph-loop.pptx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      users: [{
        age: 10,
        name: "Bar"
      }, {
        age: 18,
        name: "Bar"
      }, {
        age: 22,
        name: "Bar"
      }]
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-paragraph-loop.pptx"
    });
  });
  it("should fail if trying to attach a module that has none of the properties", function () {
    var expectedError = {
      name: "InternalError",
      message: "This module cannot be wrapped, because it doesn't define any of the necessary functions",
      properties: {
        id: "module_cannot_be_wrapped"
      }
    };
    expectToThrow(function () {
      createDocV4("regression-par-in-par.docx", {
        modules: [Promise.resolve(1)]
      });
    }, Error, expectedError);
  });
  it("should not fail when having paragraph in paragraph", function () {
    var doc = createDoc("regression-par-in-par.docx");
    var printedPostparsed = [];
    var filePath = "";
    doc.attachModule({
      name: "MyModule",
      set: function set(obj) {
        if (obj.inspect) {
          if (obj.inspect.filePath) {
            filePath = obj.inspect.filePath;
          }

          if (obj.inspect.postparsed) {
            printedPostparsed[filePath] = printy(obj.inspect.postparsed);
          }
        }
      }
    });
    doc.setOptions({
      paragraphLoop: true,
      parser: function parser() {
        return {
          get: function get() {
            return "foo";
          }
        };
      }
    });
    doc.render();
    expect(printedPostparsed["word/document.xml"]).to.be.equal(expectedPrintedPostParsed);
    shouldBeSame({
      doc: doc,
      expectedName: "expected-rendered-par-in-par.docx"
    });
  });
  it("should work with spacing at the end", function () {
    var doc = createDoc("spacing-end.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      name: "John"
    }).render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-spacing-end.docx"
    });
  });
  it("should throw specific error if calling .render() on document with invalid tags", function () {
    var doc = createDoc("errors-footer-and-header.docx");
    doc.setOptions({
      paragraphLoop: true,
      parser: angularParser
    });
    var catched = false;
    var capture = captureLogs();

    try {
      doc.compile();
    } catch (e) {
      catched = true;
      var expectedError = {
        name: "InternalError",
        message: "You should not call .render on a document that had compilation errors",
        properties: {
          id: "render_on_invalid_template"
        }
      };
      capture.stop();
      expectToThrow(function () {
        return doc.render();
      }, Errors.XTInternalError, expectedError);
      /* handle error */
    }

    expect(catched).to.equal(true);
  });
  it("should fail with errors from header and footer", function () {
    var doc = createDoc("errors-footer-and-header.docx");
    doc.setOptions({
      paragraphLoop: true,
      parser: angularParser
    });
    var expectedError = {
      message: "Multi error",
      name: "TemplateError",
      properties: {
        id: "multi_error",
        errors: [{
          name: "TemplateError",
          message: "Closing tag does not match opening tag",
          properties: {
            closingtag: "bang",
            openingtag: "users",
            file: "word/document.xml",
            id: "closing_tag_does_not_match_opening_tag",
            offset: [8, 16]
          }
        }, {
          name: "TemplateError",
          message: "Duplicate close tag, expected one close tag",
          properties: {
            file: "word/header1.xml",
            xtag: "itle}}",
            id: "duplicate_close_tag",
            context: "itle}}",
            offset: 15
          }
        }, {
          name: "TemplateError",
          message: "Unclosed tag",
          properties: {
            file: "word/footer1.xml",
            xtag: "footer",
            id: "unclosed_tag",
            context: "{footer",
            offset: 2
          }
        }]
      }
    };
    var create = doc.render.bind(doc);
    expectToThrow(create, Errors.XTTemplateError, expectedError);
  });
  it("should fail properly when having lexed + postparsed errors", function () {
    var doc = createDoc("multi-errors.docx");
    doc.setOptions({
      paragraphLoop: true,
      parser: angularParser
    });
    doc.setData({
      users: [{
        age: 10,
        name: "Bar"
      }, {
        age: 18,
        name: "Bar"
      }, {
        age: 22,
        name: "Bar"
      }]
    });
    var expectedError = {
      message: "Multi error",
      name: "TemplateError",
      properties: {
        id: "multi_error",
        errors: [{
          name: "TemplateError",
          message: "Unclosed tag",
          properties: {
            file: "word/document.xml",
            xtag: "firstName",
            id: "unclosed_tag",
            context: "{firstName ",
            offset: 0
          }
        }, {
          name: "TemplateError",
          message: "Unclosed tag",
          properties: {
            file: "word/document.xml",
            xtag: "error",
            id: "unclosed_tag",
            context: "{error  ",
            offset: 22
          }
        }, {
          name: "TemplateError",
          message: "Duplicate close tag, expected one close tag",
          properties: {
            file: "word/document.xml",
            xtag: "{tag}}",
            id: "duplicate_close_tag",
            context: "{tag}}",
            offset: 34
          }
        }, {
          name: "TemplateError",
          message: "Duplicate open tag, expected one open tag",
          properties: {
            file: "word/document.xml",
            xtag: "{{bar}",
            id: "duplicate_open_tag",
            context: "{{bar}",
            offset: 42
          }
        }]
      }
    };
    var create = doc.render.bind(doc);
    expectToThrow(create, Errors.XTTemplateError, expectedError);
  });
  it("should fail when placing paragraph loop inside normal loop", function () {
    var doc = createDoc("paragraph-loop-error.docx");
    var expectedError = {
      message: "Multi error",
      name: "TemplateError",
      properties: {
        id: "multi_error",
        errors: [{
          name: "TemplateError",
          message: 'No tag "w:p" was found at the left',
          properties: {
            file: "word/document.xml",
            id: "no_xml_tag_found_at_left",
            element: "w:p",
            index: 1,
            parsedLength: 4,
            offset: 12,
            part: {
              endLindex: 17,
              expandTo: "w:p",
              inverted: false,
              lIndex: 17,
              location: "start",
              module: "loop",
              offset: 12,
              raw: "-w:p loop",
              type: "placeholder",
              value: "loop"
            }
          }
        }, {
          name: "TemplateError",
          message: 'No tag "w:p" was found at the right',
          properties: {
            file: "word/document.xml",
            id: "no_xml_tag_found_at_right",
            element: "w:p",
            index: 3,
            parsedLength: 4,
            offset: 26,
            part: {
              endLindex: 21,
              lIndex: 21,
              location: "end",
              module: "loop",
              offset: 26,
              raw: "/",
              type: "placeholder",
              value: ""
            }
          }
        }]
      }
    };
    var create = doc.compile.bind(doc);
    expectToThrow(create, Errors.XTTemplateError, expectedError);
  });
});
describe("Prefixes", function () {
  it("should be possible to change the prefix of the loop module", function () {
    var content = "<w:t>{##tables}{user}{/tables}</w:t>";
    var scope = {
      tables: [{
        user: "John"
      }, {
        user: "Jane"
      }]
    };
    var doc = createXmlTemplaterDocxNoRender(content, {
      tags: scope
    });
    doc.modules.forEach(function (module) {
      if (module.name === "LoopModule") {
        module.prefix.start = "##";
      }
    });
    doc.render();
    expect(doc.getFullText()).to.be.equal("JohnJane");
  });
  it("should be possible to change the prefix of the loop module to a regexp", function () {
    var content = "<w:t>{##tables}{user}{/tables}{#tables}{user}{/tables}</w:t>";
    var scope = {
      tables: [{
        user: "A"
      }, {
        user: "B"
      }]
    };
    var doc = createXmlTemplaterDocxNoRender(content, {
      tags: scope
    });
    doc.modules.forEach(function (module) {
      if (module.name === "LoopModule") {
        module.prefix.start = /^##?(.*)$/;
      }
    });
    doc.render();
    expect(doc.getFullText()).to.be.equal("ABAB");
  });
  it("should be possible to change the prefix of the raw xml module to a regexp", function () {
    var content = "<w:p><w:t>{!!raw}</w:t></w:p>";
    var scope = {
      raw: "<w:p><w:t>HoHo</w:t></w:p>"
    };
    var doc = createXmlTemplaterDocxNoRender(content, {
      tags: scope
    });
    doc.modules.forEach(function (module) {
      if (module.name === "RawXmlModule") {
        module.prefix = /^!!?(.*)$/;
      }
    });
    doc.render();
    expect(doc.getFullText()).to.be.equal("HoHo");
  });
});
describe("Load Office 365 file", function () {
  it("should handle files with word/document2.xml", function () {
    var doc = createDoc("office365.docx");
    doc.setOptions({
      paragraphLoop: true
    });
    doc.setData({
      test: "Value",
      test2: "Value2"
    }).render();
    expect(doc.getFullText()).to.be.equal("Value Value2");
    shouldBeSame({
      doc: doc,
      expectedName: "expected-office365.docx"
    });
  });
  it("should template header.xml (without digit like header1.xml)", function () {
    var doc = createDoc("header-without-digit.docx");
    doc.render({
      name: "John"
    });
    shouldBeSame({
      doc: doc,
      expectedName: "expected-header-without-digit.docx"
    });
  });
});