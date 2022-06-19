import  { Component, renderToString , createElement} from 'jsx-xsl-fo';
import {
    Report,
    PageSequence,
    PageContent,
    PageHeader,
    PageFooter
} from 'jsx-xsl-fo/reporting';
 

export default class XmlUtils { 

    buildGetJsonXSLNode(item, inline = false, wrapBy = null ) {
        var children = []
       

        if (!item.isContainer)
        {
            children.push(item.content);
        }
        var props = {
            "min-height": "20pt"
        }

        if (item.attributes) {
            if (item.attributes["font-size"]) {
                props["font-size"] = item.attributes["font-size"] +"pt"
            }

            if (item.attributes["aligment"]) {
                props["text-align"] = item.attributes["aligment"]
            }

            if (item.attributes["color"]) {
                props["color"] = item.attributes["color"]
            }

            if (item.attributes["font-style"]&& item.attributes["font-style"] != "normal") {
                props["font-style"] = item.attributes["font-style"]
            }

        }
        var tag = "block"
        var needChildWrap = null
        var needTable = false
        var needInine = item.attributes['inline'] == true
        if (inline) {
            tag = "inline"
        }

        if (item.type == "row" && !needInine == true) {
            needChildWrap = (node) =>    createElement("table-cell", {}, node);
            tag = "table-row"
            needTable = true
        }
        for (var child of item.children) {
            children.push(this.buildGetJsonXSLNode(child, needInine, needChildWrap));
        }

        let component = createElement(tag, props, ...children);

        if (needTable) {
            var total = 0;
            var columns = []
            for (var child of item.children) {
                total += (child.attributes["flex"] || 0)
            }
            console.log(total)
            if (total != 0) {
                for (var child of item.children) {
                    let percent = Math.round((child.attributes["flex"] || 0) / total * 100); 
                    columns.push(createElement("table-column",{ "column-width":percent+"%"}))
                }
            } else {
                columns.push(createElement("table-column",{ "column-width":"100%"}))
            }
            columns.push(createElement("table-body", props,  component)) 
            component = createElement("table", {"table-layout":"fixed","width":"100%"}, columns );
        } 

       
        if (wrapBy != null) {
             return wrapBy(component)
        }
        return component ;
    }

    createWithRoot(nodes) {
        return createElement(
        "root", 
        {
            "font-family":"Times New Roman",
            "xmlns:fo": "http://www.w3.org/1999/XSL/Format"
        }, 
        createElement(
            "layout-master-set",
            {
                
            }
            ,
            
            createElement(
                "simple-page-master",
                {
                    "master-name":"73eb21ae-eb7d-4c47-9b83-050debbd10ea",
                    "margin-bottom":"0.2cm", "margin-left":"0.2cm", "margin-right":"0.2cm", "margin-top":"0.2cm",
                     "page-height":"20cm", "page-width":"28.7cm"
                }
                ,
                createElement("region-body", {"margin-bottom": "10mm"}) 
                )
            )
            ,
            ...nodes
        
        );
    }
    test(json){
        var items = []
        for (var item of json) {
            let component = this.buildGetJsonXSLNode(item);
            if (component!= null) { 
             items.push(component)
            }
        }
        
        var pageContent = createElement(PageContent, {}, ...items);
        
        
        var myReport = this.createWithRoot([createElement(PageSequence, {sequenceId:"73eb21ae-eb7d-4c47-9b83-050debbd10ea"}, createElement(PageHeader, {}, createElement("block", {}, "DEMO FORM") ), createElement(PageFooter, {}, createElement("block", {}, "V1.0")), pageContent)]);


       var data= renderToString(myReport);

        var element = document.createElement('a');
     var blob = new Blob([data], {
       type: 'text/xml'
     });
     var url = URL.createObjectURL(blob);
     element.href = url;
     element.setAttribute('download', 'form-apache-fo.xsl');
     document.body.appendChild(element); 
     element.click();
    }
}