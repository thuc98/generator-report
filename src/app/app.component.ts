import { ChangeDetectorRef, Component, HostListener, Inject, ViewEncapsulation } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { demoData, TreeNode, DropInfo } from "../data";
import { debounce } from "@agentepsilon/decko";
import { CdkDragMove } from "@angular/cdk/drag-drop";
import { DragDropService } from "./drag-drop.service";
import { ComponentBuild } from "./models/component-build";
import { MatSnackBar } from "@angular/material";
import XmlUtils from "./models/xml-utils";
import { DataService } from "./data.service";
import { Observable } from "rxjs";

@Component({ 
    selector: "my-app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
 

    constructor(
        @Inject(DataService) private _dataService: DataService,
        @Inject(MatSnackBar) private _snackBar: MatSnackBar,
        @Inject(ChangeDetectorRef) private cdr: ChangeDetectorRef,
        @Inject(DragDropService) public service: DragDropService,
        @Inject(DOCUMENT) private document: Document
        ) { 
            this._dataService.getVul();
            this._dataService.restore().then((data)=>{
                console.log("restore",data)
                this.service.nodes =  data ||[ ];
                this.service.prepareDragDrop(this.service.nodes);
            })
            this._dataService.registDataChange((obs)=>this.service.onChangeObx = obs)
            
       
            
       
    }

    @HostListener('document:keydown.delete', ['$event'])
    onDeleteComponent(event: KeyboardEvent) {
        this.service.deleteCurrentSelected()
    }

   


    @debounce(50)
    dragMoved(event: CdkDragMove<TreeNode>) {
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


    drop(event) {
        var draggedItemId = event.item.data;
        var draggedItem = null;

        if (!this.service.dropActionTodo ) {
            this.clearDragInfo(true)
            if (this.service.nodes.length == 0 && draggedItemId instanceof ComponentBuild  && draggedItemId.isContainer) {
                this.service.nodes.push(draggedItemId)
                this.service.prepareDragDrop(this.service.nodes)
            }
            return;
        };
        if (event.item.data == null) { 
            this._snackBar.open("Chức năng này: chưa có trên bản demo", "Đã hiểu")
            return
        }
       
        var needRemove = false
        if ( draggedItemId instanceof ComponentBuild ) {
            draggedItem = draggedItemId
            draggedItemId = draggedItem.id
            needRemove = false
            this.service.nodeLookup[draggedItemId ] = draggedItem
        } else {
         draggedItem = this.service.nodeLookup[draggedItemId];
         needRemove = true
        }
        const parentItemId = event.previousContainer.id;
        const targetListId = this.getParentNodeId(this.service.dropActionTodo.targetId, this.service.nodes, 'main');
        const newContainer = targetListId != 'main' ? this.service.nodeLookup[targetListId].children : this.service.nodes;
       
        try {
            if (needRemove) {
                const oldItemContainer = parentItemId != 'main' ? this.service.nodeLookup[parentItemId].children : this.service.nodes;
                let i = oldItemContainer.findIndex(c => c.id === draggedItemId);
                oldItemContainer.splice(i, 1); 
            }
        }catch(e){

        } 
        switch (this.service.dropActionTodo.action) {
            case 'before':
            case 'after':
                if (this.service.nodes == newContainer && !draggedItem.isContainer) {
                    this.clearDragInfo(true)
                    return
                }
                const targetIndex = newContainer.findIndex(c => c.id === this.service.dropActionTodo.targetId);
                if (this.service.dropActionTodo.action == 'before') {
                    newContainer.splice(targetIndex, 0, draggedItem);
                } else {
                    newContainer.splice(targetIndex + 1, 0, draggedItem);
                }
                
                break;

            case 'inside':
                if (this.service.nodeLookup[this.service.dropActionTodo.targetId] && !this.service.nodeLookup[this.service.dropActionTodo.targetId].isContainer) {
                    this.clearDragInfo(true)
                    return
                }
                var parentNode = this.service.nodeLookup[this.service.dropActionTodo.targetId];
                if (parentNode.type == draggedItem.type) {
                    this.clearDragInfo(true)
                    return
                }
                this.service.nodeLookup[this.service.dropActionTodo.targetId].children.push(draggedItem) 
                break;
        }
        this.service.droped()
        this.clearDragInfo(true)
    }
    getParentNodeId(id: string, nodesToSearch: TreeNode[], parentId: string): string {
        for (let node of nodesToSearch) {
            if (node.id == id) return parentId;
            let ret = this.getParentNodeId(id, node.children, node.id);
            if (ret) return ret;
        }
        return null;
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

    onSelecNode(event,node){ 
        event.stopPropagation(); 
        this.service.selectedNode = node
      //  this.cdr.detectChanges();
    }

    getNodeClass(node) {
        if (this.service.selectedNode != null && node.id == this.service.selectedNode.id) {
            return 'node-item selected' 
        }
       return  'node-item' 
    }
    getNodeFlex(node){ 
        var flex =  node.attributes["flex"] 
        return flex 
    }

    exportdata() {
       (new  XmlUtils()).test(this.service.nodes)
    }
}
