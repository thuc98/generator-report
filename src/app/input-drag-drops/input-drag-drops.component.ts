import { debounce } from '@agentepsilon/decko';
import { CdkDragExit, CdkDragMove, CdkDragRelease } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { Component, ContentChild, Inject, OnInit, TemplateRef } from '@angular/core';
import { DataService } from '../data.service';
import { DragDropService } from '../drag-drop.service';
import { ConponentConfig, inputTargets } from '../models/component-build';

@Component({
  selector: 'app-input-drag-drops',
  templateUrl: './input-drag-drops.component.html',
  styleUrls: ['./input-drag-drops.component.css']
})
export class InputDragDropsComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(DragDropService) public service: DragDropService,
    @Inject(DataService) private _dataService: DataService,
  ) { }

  targets: ConponentConfig[] = inputTargets;
  
  ngOnInit() {
  }

 
  @ContentChild('input', {static: true}) itemRef!: TemplateRef<any>;

  public addItem(config) {
   console.log(config);
  }

  public cleanupTmeporaryInputs() {
    console.log("ok")
  }

  public addTemporaryInput(event: CdkDragExit<any>) {
      console.log(event)
  }

  _alwaysPreventDropPredicate() {
    return false;
  }

 

  @debounce(50)
  dragMoved(event: CdkDragMove<any>) {
      let e = this.document.elementFromPoint(event.pointerPosition.x,event.pointerPosition.y);

     
      if (!e) {
          this.clearDragInfo();
          return;
      }
      let container = e.classList.contains("node-item") ? e : e.closest(".node-item");
      
      if (!container) {
          this.clearDragInfo();
          return;
      }
      
      const targetRect = container.getBoundingClientRect();
      this.service.dragMoved(event, container.getAttribute("data-id"), targetRect)
      this.showDragInfo();
  }

  dragReleased(event: CdkDragRelease) {
    
  }

  showDragInfo() {
    this.clearDragInfo();
    if (this.service.dropActionTodo) {
        this.document.getElementById("node-" + this.service.dropActionTodo.targetId).classList.add("drop-" + this.service.dropActionTodo.action);
    }
}

clearDragInfo(dropped = false) {
    if (dropped) {
        this.service.dropActionTodo = null;
    }
    this.document
        .querySelectorAll(".drop-before")
        .forEach(element => element.classList.remove("drop-before"));
    this.document
        .querySelectorAll(".drop-after")
        .forEach(element => element.classList.remove("drop-after"));
    this.document
        .querySelectorAll(".drop-inside")
        .forEach(element => element.classList.remove("drop-inside"));
}

saveData() {
  this._dataService.save(this.service.nodes)
}

}
