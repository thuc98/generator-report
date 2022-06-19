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
  dataChange: Observable<TreeNode[]>;
  constructor( 
    @Inject(HttpClient) private http: HttpClient, 
    ) { 
     
    
  }

  getVul() { 
    return this.http.get(this.HOSTS +"/get-vulnerability" ).subscribe((data) => {
      this.data = data["data"];
    })
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
}

