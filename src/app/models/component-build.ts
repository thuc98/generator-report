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
        return "node" + this.id;
    }
}


export  class ColumnComponentBuild extends ComponentBuild {
    isContainer: boolean = true;
    view = ColumnComponent
    type="column"
    constructor(){
        super();
        this.id = getUniqueId(10); 
        this.attributes["flex"] = 1
    }
    getName() {
        return "cplumn_"+this.index;
    }
}

export class RowComponentBuild extends ComponentBuild {
    isContainer: boolean = true;
    type="row"
    constructor(){
        super();
        this.id = getUniqueId(10); 
        this.attributes["flex"] = 1
    }
    getName() {
        return "row_"+this.index;
    }
}


export class LabelComponentBuild extends ComponentBuild {
    isContainer: boolean = false;
    view = LabelComponent
    type="label"
    constructor(){
        super();
        this.id = getUniqueId(10); 
        this.attributes["font-size"] = 14
        this.attributes["font-style"] = 'normal'
        this.attributes["aligment"] = 'left'
        this.attributes["flex"] = 1
    }
    getName() {
        return "label_"+this.index;
    }
}
 
export const inputTargets:ConponentConfig[]  = [
    {
        name: "Dòng",
        icon: "border_clear",
        component: () => {
            return new RowComponentBuild()
        }
            
    }, 
    {
        name: "Cột",
        icon: "border_clear",
        component: () => {
            return new ColumnComponentBuild()
        }
    }, 
    {
        name: "Chữ ",
        icon: "format_size",
        component: () => {
            return new LabelComponentBuild()
        }
    },
    {
        name: "Bảng",
        icon: "table",
        component: () => {
            return null
        }
    },
    {
        name: "Hình ảnh",
        icon: "image",
        component: () => {
            return null
        }
    }
]