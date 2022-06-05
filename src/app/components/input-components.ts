import { IDisplayComponent } from "./display-builder-component";
import { Component, Input } from '@angular/core';
import { ComponentBuild } from "../models/component-build";
 
@Component({
  template: `
    <div   class="column">
      <ng-content></ng-content>
    </div>
  `
})
export class ColumnComponent implements IDisplayComponent {
    data: any 
    index: number;
    build: ComponentBuild;
    getFlex() {
      if (this.build == null || this.build.attributes == null ){
        return "1";
      }
      return this.build.attributes["flex"];
    }
}

@Component({
  template: `
    <div  [class]="getClass()">  
      <ng-content></ng-content>
    </div>
  `
})
export class DefaultComponent implements IDisplayComponent {
    build: ComponentBuild;
    data: any = ""
    index: number;

    getClass(){
      if (this.build == null || this.build.attributes == null) {
        return "row";
      }
     
      if (this.build.attributes["inline"] == true) {
        return "row inline"
      } 
      return "row"
    }
    getFlex() {
      if (this.build == null || this.build.attributes == null ){
        return "1";
      }
      return this.build.attributes["flex"];
    }
}




@Component({
  template: `
    <div class="label"   [style.fontWeight]="getTextWeight()" [style.fontStyle]="getTextStyle()" [style.textAlign]="getTextAligment()" [style.color] ="getTextColor()"  [style.fontSize] = "getTextSize()">  
      {{getDisplayData()}}
    </div>
  `
})
export class LabelComponent implements IDisplayComponent {
    build: ComponentBuild;
    index: number;
    data: any 

    getDisplayData(){ 
      this.data = this.build.content
      if (this.data == null && this.index != null) {
        this.data = "Text " + this.index;
      }
      
      return this.data
    }

    getTextColor(){
      if (this.build == null || this.build.attributes == null ){
        return "black";
      }
      return this.build.attributes["color"] 
    }
    getTextSize() {
      if (this.build == null || this.build.attributes == null ){
        return "14px";
      }
      return this.build.attributes["font-size"]+"px";
    }

    getTextAligment() {
      if (this.build == null || this.build.attributes == null ){
        return "left";
      }
      return this.build.attributes["aligment"];
    }


    getTextStyle() {
      if (this.build == null || this.build.attributes == null ){
        return "normal";
      }
      return this.build.attributes["font-style"];
    }

    getTextWeight() {
      if (this.build == null || this.build.attributes == null ){
        return "normal";
      }
      return this.build.attributes["font-weight"];
    }

    getFlex() {
      if (this.build == null || this.build.attributes == null ){
        return "1";
      }
      return this.build.attributes["flex"];
    }

}

