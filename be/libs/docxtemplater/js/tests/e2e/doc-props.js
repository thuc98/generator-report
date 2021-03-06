"use strict";

var _require = require("../utils.js"),
    createDoc = _require.createDoc,
    shouldBeSame = _require.shouldBeSame,
    expect = _require.expect;

describe("Docx docprops", function () {
  it("should change values in doc-props", function () {
    var tags = {
      first_name: "Hipp",
      last_name: "Edgar",
      phone: "0652455478",
      description: "New Website"
    };
    var doc = createDoc("tag-docprops.docx");
    doc.setData(tags);
    expect(doc.getFullText("docProps/app.xml")).to.be.equal("TitleName: {first_name}");
    doc.render();
    expect(doc.getFullText()).to.be.equal("Edgar Hipp");
    expect(doc.getFullText("word/header1.xml")).to.be.equal("Edgar Hipp0652455478New Website");
    expect(doc.getFullText("word/footer1.xml")).to.be.equal("EdgarHipp0652455478");
    expect(doc.getFullText("docProps/app.xml")).to.be.equal("TitleName: Hipp");
    shouldBeSame({
      doc: doc,
      expectedName: "expected-tag-docprops.docx"
    });
  });
  it("should change custom values inside '<vt:lpwstr>' in file docProps/custom.xml", function () {
    var doc = createDoc("tag-docprops-in-doc.docx");
    doc.render({
      first_name: "Hipp",
      email: "john@acme.com",
      last_name: "Edgar",
      phone: "0652455478",
      description: "New Website"
    });
    shouldBeSame({
      doc: doc,
      expectedName: "expected-tag-docprops-in-doc.docx"
    });
  });
});