import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, INJECTOR, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { TreeNode } from 'src/data';
import { DragDropService } from './drag-drop.service';
import { parseFromJson } from './models/component-build';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  HOSTS = "http://localhost:3000"
  data: any[]
  templates: any[]
  dataChange: Observable<TreeNode[]>;
  constructor( 
    @Inject(HttpClient) private http: HttpClient, 
    ) { 
     
    
  }

  uploadTemplate(name, file) {
    let formData:FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', name); 
    return this.http.post(this.HOSTS +"/upload-template",formData)
  }
  getTemplates() {
    return this.http.get(this.HOSTS +"/templates") .subscribe((data) => {
      this.templates = data["data"];
    })
  }

  exportDocx(template, nodes, name) {
    console.log("123")
    return this.http.post(this.HOSTS +"/export-docx", {
      template:template,
      nodes: nodes,
      name: name
    } , {responseType: 'blob' }).subscribe((data)=>{

      const blob = data;
      const url= window.URL.createObjectURL(blob);
      window.open(url);
    })
  }

  getVul() { 
    return this.http.get(this.HOSTS +"/get-vulnerability" ).subscribe((data) => {
      this.data = data["data"];
    })
  }

  getAppResource() {
    this.getTemplates()
    this.getVul()
  }

  registDataChange(subscribe) {
    this.dataChange =  new Observable(subscribe);
    this.dataChange.subscribe((obs) => {
      console.log("save")
      this.save(obs);
    });

  }

  filterVulnerabilites(startsWith: string) {
    var lowStartWith = startsWith.toLowerCase();
    var data = this.data.filter(m=>m["name"].toLowerCase().indexOf(lowStartWith) >= 0)
    return data
  }

  getVulnerabityByName(name: string) {
   var filter =  this.data.filter(m=>m["name"] == name)
   if (filter .length < 1) {
    return null
   }
   return filter[0]
  }


  async save(nodes: TreeNode[]) {
    var jsonNodes= JSON.stringify(nodes);
    return await localStorage.setItem("save",jsonNodes)
  }

  async restore() {
   var lastNodesJson = await localStorage.getItem("save"); 
   if (lastNodesJson == null) return null;
   return  parseFromJson(JSON.parse(lastNodesJson));
  }

  async saveInfo(data) {
    var jsonNodes= JSON.stringify(data);
    return await localStorage.setItem("info",jsonNodes)
  }
  async restoreInfo() {
    var lastNodesJson = await localStorage.getItem("info"); 
    if (lastNodesJson == null) return null;
    return  JSON.parse(lastNodesJson);
   }


}

