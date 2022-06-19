import { Type } from "@angular/core";
import { TreeNode } from "src/data";
import { IDisplayComponent } from "../components/display-builder-component";
import { ColumnComponent, DefaultComponent, LabelComponent } from "../components/input-components";

export function getUniqueId(parts: number): string {
    const stringArr = [];
    for(let i = 0; i< parts; i++){
      // tslint:disable-next-line:no-bitwise
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }

export interface ConponentConfig {
    name: String
    icon: String
    component: VoidFunction;
 
}
export abstract class ComponentBuild implements TreeNode {
    isContainer: boolean = false;
    id: string; 
    content: any;
    index: number
    children: TreeNode[] = [];
    view: Type<IDisplayComponent> = DefaultComponent 
    attributes: any = {};
    type = "Node"
    getName(){
        return "" + this.id;
    }
    setName(name) {
        
    }
}


export  class ColumnComponentBuild extends ComponentBuild {
    isContainer: boolean = true;
    view = ColumnComponent
    name = ""
    type="column"
    constructor(){
        super();
        this.id = getUniqueId(10); 
        this.attributes["flex"] = 1
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name   
        }
}
 

export class LabelComponentBuild extends ComponentBuild {
    isContainer: boolean = false;
    view = LabelComponent 
    name = ""
    type="label"
    constructor(){
        super();
        this.id = getUniqueId(10); 
    }
    getName() {
        return this.name;
    }
    setName(name) {
    this.name = name   
    }
}
 
export const inputTargets:ConponentConfig[]  = [
    
    {
        name: "Ứng dụng",
        icon: "border_clear",
        component: () => {
            return new ColumnComponentBuild()
        }
    }, 
    {
        name: "Lỗi",
        icon: "format_size",
        component: () => {
            return new LabelComponentBuild()
        }
    } 
]

export const parseFromJson = (json) => {
    var items = [];
    for (var element of json) {
        var component = null
        if (element.type == "label"){
            component = new LabelComponentBuild()
            
        } else if (element.type == "column"){
            component = new ColumnComponentBuild()
        } else {
            continue 
        }
        component.attributes = element.attributes
        component.content = element.content
        component.index = element.index
        component.name = element.name
        if (element.children && element.children.length > 0) {
            component.children = parseFromJson(element.children);
        } 
        items.push(component)
    }
    return items;
}

export const getVulnerabilites = (name = null): any[] => {
if (name != null) {
    return[
        {
          name:"So 1",
          desc:"2",
          level:"Cao"
        }]
}
  return [
    {
      name:"So 1",
      desc:"2",
      level:"Cao"
    }, {
      name:"So 2",
      desc:"2",
      level:"Cao"
    }
  ]
}