import { CdkDragMove } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { demoData, DropInfo, TreeNode } from 'src/data';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  constructor() { }

  nodes: TreeNode[] = demoData;
  dropTargetIds = [];
  nodeLookup = {};
  dropActionTodo: DropInfo = null;
  selectedNode: TreeNode;
  totalCreate = 0;
  


  prepareDragDrop(nodes: TreeNode[]) {
    nodes.forEach(node => { 
        this.dropTargetIds.push(node.id);
        this.nodeLookup[node.id] = node;
        this.prepareDragDrop(node.children);
    }); 
}

deleteItemInTree(node:TreeNode, treeRoot: TreeNode[]) {
  var index = treeRoot.indexOf(node);
  if (index >= 0){ 
    console.log("deleted")
    treeRoot.splice(index,1) 
  }
  else {
    treeRoot.forEach(root => {  
      this.deleteItemInTree(node,root.children);
    });
  }
 
}

deleteCurrentSelected(){
  var node = this.selectedNode;
  if (node == null){
    return;
  }
  this.selectedNode = null;
  delete this.nodeLookup[node.id] 
  this.deleteItemInTree(node, this.nodes);
 
}

  dragMoved(event: CdkDragMove<TreeNode>, targetId, targetRect) {
   
    this.dropActionTodo = {
        targetId: targetId
    };
 
    const oneThird = targetRect.height / 3;

    if (event.pointerPosition.y - targetRect.top < oneThird) {
        this.dropActionTodo["action"] = "before";
    } else if (event.pointerPosition.y - targetRect.top > 2 * oneThird) {
        this.dropActionTodo["action"] = "after";
    } else {
        var destItem = this.nodeLookup[this.dropActionTodo.targetId];
        if (!destItem.isContainer) { 
            this.dropActionTodo["action"] = "after";
        } else {
            this.dropActionTodo["action"] = "inside";
        }
       
    }
  }

}
