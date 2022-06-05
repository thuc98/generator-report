import { Template } from "@angular/compiler/src/render3/r3_ast";
import { Component, ComponentFactoryResolver, ContentChild, Directive, ElementRef, Inject, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { DragDropService } from "../drag-drop.service";
import { ComponentBuild } from "../models/component-build";

  
@Directive({
selector: '[ad-host]',
})
export class AdDirective {
constructor(@Inject(ViewContainerRef) public viewContainerRef: ViewContainerRef) { }
} 
 
export interface IDisplayComponent {
  data: any;
  index: number;
  build: ComponentBuild
}

@Component({
  selector: 'display-dynamic-builder',
  template: ` <div>
    <ng-template  ad-host></ng-template>
    <ng-template #template><ng-content></ng-content></ng-template>
  </div>
  `
})
export class DisplayBuilderComponent implements OnInit, OnDestroy {
   
    @Input("component")
    component: ComponentBuild;
 
    @ViewChild(AdDirective, {static: true}) adHost!: AdDirective;
   
    @ViewChild('template',{static: true}) template!: TemplateRef<any>;


    constructor(
      @Inject(DragDropService) public service: DragDropService,
      @Inject(ComponentFactoryResolver) private _factoryResolver: ComponentFactoryResolver) {

    }
    ngOnInit(): void {
      this.loadComponent();
   
    }
  
    ngOnDestroy() {
    
    }
  
    loadComponent() { 
      if (this.component.view == null){
        return
      } 
      const viewContainerRef = this.adHost.viewContainerRef;
      const viewRef = this.template.createEmbeddedView(null);

      viewContainerRef.clear();
      const factory = this._factoryResolver.resolveComponentFactory<IDisplayComponent>(this.component.view);
      const component = factory.create(viewContainerRef.parentInjector,[viewRef.rootNodes]);
      const componentRef = viewContainerRef.insert(component.hostView); 
      if (  this.component.index   == null) {
        this.component.index =this.service.totalCreate++ ;
       
      }

      component.instance.build = this.component;
      component.instance.index =  this.component.index 
      component.instance.data = this.component.content
  
    }
  
  }


