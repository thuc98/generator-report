var ChartMaker, DocUtils;

DocUtils = require('./docUtils');

module.exports = ChartMaker = (function() {
  class ChartMaker {
    getTemplateTop() {
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
	<c:lang val="ru-RU"/>
	<c:chart>
		${this.options.title ? "" : "<c:autoTitleDeleted val=\"1\"/>"}
		<c:plotArea>
			<c:layout/>
			<c:lineChart>
				<c:grouping val="standard"/>`;
    }

    getFormatCode() {
      if (this.options.axis.x.type === 'date') {
        return "<c:formatCode>m/d/yyyy</c:formatCode>";
      } else {
        return "";
      }
    }

    getLineTemplate(line, i) {
      var elem, j, k, len, len1, ref, ref1, result;
      result = `<c:ser>
	<c:idx val="${i}"/>
	<c:order val="${i}"/>
	<c:tx>
		<c:v>${line.name}</c:v>
	</c:tx>
	<c:marker>
		<c:symbol val="none"/>
	</c:marker>
	<c:cat>

		<c:${this.ref}>
			<c:${this.cache}>
				${this.getFormatCode()}
				<c:ptCount val="${line.data.length}"/>
	`;
      ref = line.data;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        elem = ref[i];
        result += `<c:pt idx="${i}">
	<c:v>${elem.x}</c:v>
</c:pt>`;
      }
      result += `		</c:${this.cache}>
	</c:${this.ref}>
</c:cat>
<c:val>
	<c:numRef>
		<c:numCache>
			<c:formatCode>General</c:formatCode>
			<c:ptCount val="${line.data.length}"/>`;
      ref1 = line.data;
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        elem = ref1[i];
        result += `<c:pt idx="${i}">
	<c:v>${elem.y}</c:v>
</c:pt>`;
      }
      result += `			</c:numCache>
		</c:numRef>
	</c:val>
</c:ser>`;
      return result;
    }

    getScaling(opts) {
      return `<c:scaling>
	<c:orientation val="${opts.orientation}"/>
	${opts.max !== void 0 ? `<c:max val=\"${opts.max}\"/>` : ""}
	${opts.min !== void 0 ? `<c:min val=\"${opts.min}\"/>` : ""}
</c:scaling>`;
    }

    getAxOpts() {
      return `<c:axId val="${this.id1}"/>
${this.getScaling(this.options.axis.x)}
<c:axPos val="b"/>
<c:tickLblPos val="nextTo"/>
<c:txPr>
	<a:bodyPr/>
	<a:lstStyle/>
	<a:p>
		<a:pPr>
			<a:defRPr sz="800"/>
		</a:pPr>
		<a:endParaRPr lang="ru-RU"/>
	</a:p>
</c:txPr>
<c:crossAx val="${this.id2}"/>
<c:crosses val="autoZero"/>
<c:auto val="1"/>
<c:lblOffset val="100"/>`;
    }

    getCatAx() {
      return `<c:catAx>
	${this.getAxOpts()}
	<c:lblAlgn val="ctr"/>
</c:catAx>`;
    }

    getDateAx() {
      return `<c:dateAx>
	${this.getAxOpts()}
	<c:delete val="0"/>
	<c:numFmt formatCode="${this.options.axis.x.date.code}" sourceLinked="0"/>
	<c:majorTickMark val="out"/>
	<c:minorTickMark val="none"/>
	<c:baseTimeUnit val="days"/>
	<c:majorUnit val="${this.options.axis.x.date.step}"/>
	<c:majorTimeUnit val="${this.options.axis.x.date.unit}"/>
</c:dateAx>`;
    }

    getBorder() {
      if (!this.options.border) {
        return `<c:spPr>
	<a:ln>
		<a:noFill/>
	</a:ln>
</c:spPr>`;
      } else {
        return '';
      }
    }

    getTemplateBottom() {
      var result;
      result = `	<c:marker val="1"/>
	<c:axId val="${this.id1}"/>
	<c:axId val="${this.id2}"/>
</c:lineChart>`;
      switch (this.options.axis.x.type) {
        case 'date':
          result += this.getDateAx();
          break;
        default:
          result += this.getCatAx();
      }
      result += `			<c:valAx>
				<c:axId val="${this.id2}"/>
				${this.getScaling(this.options.axis.y)}
				<c:axPos val="l"/>
				${this.options.grid ? "<c:majorGridlines/>" : ""}
				<c:numFmt formatCode="General" sourceLinked="1"/>
				<c:tickLblPos val="nextTo"/>
				<c:txPr>
					<a:bodyPr/>
					<a:lstStyle/>
					<a:p>
						<a:pPr>
							<a:defRPr sz="600"/>
						</a:pPr>
						<a:endParaRPr lang="ru-RU"/>
					</a:p>
				</c:txPr>
				<c:crossAx val="${this.id1}"/>
				<c:crosses val="autoZero"/>
				<c:crossBetween val="between"/>
			</c:valAx>
		</c:plotArea>
		<c:legend>
			<c:legendPos val="${this.options.legend.position}"/>
			<c:layout/>
		</c:legend>
		<c:plotVisOnly val="1"/>
	</c:chart>
	${this.getBorder()}
</c:chartSpace>`;
      return result;
    }

    constructor(zip, options) {
      this.zip = zip;
      this.options = options;
      if (this.options.axis.x.type === 'date') {
        this.ref = "numRef";
        this.cache = "numCache";
      } else {
        this.ref = "strRef";
        this.cache = "strCache";
      }
    }

    makeChartFile(lines) {
      var i, j, len, line, result;
      result = this.getTemplateTop();
      for (i = j = 0, len = lines.length; j < len; i = ++j) {
        line = lines[i];
        result += this.getLineTemplate(line, i);
      }
      result += this.getTemplateBottom();
      this.chartContent = result;
      return this.chartContent;
    }

    writeFile(path) {
      this.zip.file(`word/charts/${path}.xml`, this.chartContent, {});
    }

  };

  ChartMaker.prototype.id1 = 142309248;

  ChartMaker.prototype.id2 = 142310784;

  return ChartMaker;

}).call(this);
