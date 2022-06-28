import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';
import { DataService } from '../data.service';
import { DragDropService } from '../drag-drop.service';
import { UploadTemplateComponent } from '../upload-template/upload-template.component';

@Component({
  selector: 'app-template-selection',
  templateUrl: './template-selection.component.html',
  styleUrls: ['./template-selection.component.css']
})
export class TemplateSelectionComponent implements OnInit {

  constructor(
    @Inject(MatBottomSheet) private _bottomSheet: MatBottomSheet,
   @Inject(DragDropService) public service: DragDropService,
   @Inject(DataService) public _dataService: DataService,
   @Inject(MatBottomSheetRef) private _bottomSheetRef: MatBottomSheetRef<TemplateSelectionComponent>) {}


  ngOnInit() { 
    console.log(this._dataService)
  }

  openLink(event: MouseEvent, item): void {
    this._bottomSheetRef.dismiss();
    this.service.template = item
    event.preventDefault();
  }

  uploadTemplate(event: MouseEvent) {
    this._bottomSheetRef.dismiss(); 
    event.preventDefault();
    this._bottomSheet.open(UploadTemplateComponent)
  }
}
