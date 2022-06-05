import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { DragDropService } from '../drag-drop.service';
import { ComponentBuild, LabelComponentBuild } from '../models/component-build';

@Component({
  selector: 'app-target-attribute',
  templateUrl: './target-attribute.component.html',
  styleUrls: ['./target-attribute.component.css']
})
export class TargetAttributeComponent implements OnInit {
  
  
  node: ComponentBuild;
  fontSize: any;
  lastId = "";
  constructor(
    @Inject(ChangeDetectorRef) private cdr: ChangeDetectorRef,
  @Inject(DragDropService) public service: DragDropService,) { 
    
  }

  ngOnChanges()
  {
    console.log("123123")
    var node =   this.getComponentBuilNode() ;
    this.node = node;
  }

  ngOnInit() {
  }

  getName(){

    var node =   this.getComponentBuilNode() ;
    
    if ( node != null) { 
      this.lastId = node.id
      return node.getName()
    } 
    return "node ";
  }
   
  changeAttribute(name,value) { 
    this.node.attributes[name] = value;
  }
  getAttribute(name) {
    var node =   this.getComponentBuilNode() ;
    if (node == null || node.attributes == null){
      return 
    }
    return node.attributes[name]
  }

  setColor(color){ 
    var node =   this.getComponentBuilNode() ;
    if (node == null){
      return
    }
    console.log("set color", color);
  
    node.attributes["color"] = color
  }

  getComponentBuilNode() : ComponentBuild | null {
    var node =  this.service.selectedNode;
   
    if (node == null) {
      return;
    }
    if ( node instanceof ComponentBuild) {
      this.node = node;
      return node
    }
    return null;
  }

  isTextNode(){
    return this.node instanceof LabelComponentBuild
  }
  isLayout() {
    return this.node.isContainer;
  }
}
