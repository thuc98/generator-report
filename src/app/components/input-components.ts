import { IDisplayComponent } from "./display-builder-component";
import { Component, Inject, Input } from '@angular/core';
import { ComponentBuild, getVulnerabilites } from "../models/component-build";
import { Observable } from "rxjs";
import { DataService } from "../data.service";

@Component({
  template: `
    <div   class="column">
      <div class="title"> Tên ứng dụng 
        <input  [value]="getName()" (keyup) = "changeName($event.target.value)" />
      </div>
     
      <div class="app-tool">
        <button mat-button (click)="expansion = !expansion">
        <mat-icon aria-hidden="false" >{{expansion ? "visibility_off" : "visibility" }}</mat-icon>
        </button>
      </div>
      <div [style.display]="getDisplay()" >
      <div  >
      <div>
        Chi tiết:
      <textarea style="width:100%" dnd-nodrag [ngModel] = "getAttribute('description')" (ngModelChange) = "setAttribute('description',$event)" ></textarea>
      </div>
        <div class="group-input">
        <div>
         <label> Phiên bản:</label> <input [ngModel] = "getAttribute('version')" (ngModelChange) = "setAttribute('version',$event)"/>
        </div>
        <div>
        <label> Loại: </label>  <input [ngModel] = "getAttribute('type')" (ngModelChange) = "setAttribute('type',$event)" />
          </div>
         
        </div>
        <div class="group-input">
          <div>
           <label> Phạm vi:</label>  <input [ngModel] = "getAttribute('region')" (ngModelChange) = "setAttribute('region',$event)" />
          </div>
       
          <div>
          <label> Môi trường:</label>  <input [ngModel] = "getAttribute('env')" (ngModelChange) = "setAttribute('env',$event)" />
          </div> 
        </div>
        <div class="flex-full">
          <label> Link tải:</label>  <input [ngModel] = "getAttribute('download')" (ngModelChange) = "setAttribute('download',$event)" />
        </div>
      </div>
      <div class="title-section-error" >Danh sách lỗi</div>
      <div class="list-vol"  > 
        <ng-content ></ng-content>
      <div>
        <div *ngIf="!isContainValue()">
          <div class ="placholder">  Kéo lỗi vào đây!</div>
        </div>
    </div>
</div>
    </div>
  `
})

export class ColumnComponent implements IDisplayComponent {
  data: any
  index: number;
  build: ComponentBuild ;
  expansion = true
  getName() {
    if (this.build == null || this.build.getName() == null || this.build.getName() == "") {
      return ""
    }

    return this.build.getName();
  }

  changeName(name) {
    this.build.setName(name)
  }

  isContainValue() {
    if (this.build == null) {
      return false;
    }
    return this.build.children != null && this.build.children.length > 0
  }

  getDisplay(){
    return this.expansion ? 'block':'none'
  }

  getAttribute(name) {
    if (this.build == null){
      return null;
    }
    if (this.build.attributes == null) {
      this.build.attributes = {}
    }
    return this.build.attributes[name]
  }
  setAttribute(name, value) {
    if (this.build == null){
      return null;
    }
    if (this.build.attributes == null) {
      this.build.attributes = {}
    }
    this.build.attributes[name] = value;
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

  getClass() {
    if (this.build == null || this.build.attributes == null) {
      return "row";
    }

    if (this.build.attributes["inline"] == true) {
      return "row inline"
    }
    return "row"
  }
  getFlex() {
    if (this.build == null || this.build.attributes == null) {
      return "1";
    }
    return this.build.attributes["flex"];
  }
}




@Component({
  template: `
    <div class="label"  >  
   
      <div class ="title"> 
        Tên: <input [value]="getName()" (keyup) = "changeName($event.target.value)"  
           [matAutocomplete]="auto">
        <mat-autocomplete autoActiveFirstOption #auto="matAutocomplete" (optionSelected)='getVulnerabity($event.option.value)'>
          <mat-option *ngFor="let option of vulnerabilites | async" [value]="option.name">
            {{option.name}}
          </mat-option>
        </mat-autocomplete>
      </div>
      <div class="app-tool">
        <button mat-button (click)="expansion = !expansion">
        <mat-icon aria-hidden="false" >{{expansion ? "visibility_off" : "visibility" }}</mat-icon>
        </button>
      </div>
      <div [style.display]="getDisplay()">
        
      <div>
        Chi tiết:
      <textarea dnd-nodrag [ngModel] = "getAttribute('description')" (ngModelChange) = "setAttribute('description',$event)" ></textarea>
      </div>
      <div>
        Thông tin khác:
      <div class="group-input">
          <div>
          <label> Số lượng:</label>  <input [ngModel] = "getAttribute('count')" (ngModelChange) = "setAttribute('count',$event)" type="number"/>
          </div>
          <div>
          <label> Trạng thái:</label>  <input [ngModel] = "getAttribute('status')" (ngModelChange) = "setAttribute('status',$event)" />
          </div>
          <div>
          <label> Ghi chú:</label>  <input [ngModel] = "getAttribute('note')" (ngModelChange) = "setAttribute('note',$event)" />
          </div>
          <div>
          <label> Mức độ:</label>  <select [ngModel] = "getAttribute('level')" (ngModelChange) = "setAttribute('level',$event)" >
            <option>Bình thường</option>
            <option>Trung bình</option>
            <option>Nguy hiểm</option>
          </select>
          </div>
        </div>
      </div>
</div>
    </div>
  `
})
export class LabelComponent implements IDisplayComponent {
  build: ComponentBuild;
  index: number;
  data: any
  expansion = true
  vulnerabilites: Observable<any[]> 
   observerName = null;
  constructor(@Inject(DataService) private _dataService: DataService) {
    this.vulnerabilites =  new Observable((observer) => {
        observer.next( this._dataService.data);
        this.observerName = observer 
     });//getVulnerabilites();
  }

  getVulnerabity(name) {
   let vol = this._dataService.getVulnerabityByName(name)
   this.setAttribute("level", vol.level)
   this.setAttribute("description", vol.description)
   this.changeName(name)
   
  }

 
  getDisplayData() {
    this.data = this.build.content
    if (this.data == null && this.index != null) {
      this.data = "Text " + this.index;
    }
    return this.data  
  }

  getDisplay() {
    return this.expansion ? 'block':'none'
  }
 
 
  getName() {
    if (this.build == null || this.build.getName() == null || this.build.getName() == "") {
      return ""
    }

    return this.build.getName();
  }

  changeName(name) {
    this.build.setName(name)
    this.observerName.next(this._dataService.filterVulnerabilites(name))
  }

  getAttribute(name) {
    if (this.build == null){
      return null;
    }
    if (this.build.attributes == null) {
      this.build.attributes = {}
    }
    return this.build.attributes[name]
  }
  setAttribute(name, value) {
    if (this.build == null){
      return null;
    }
    if (this.build.attributes == null) {
      this.build.attributes = {}
    }
    this.build.attributes[name] = value;
  }

}

