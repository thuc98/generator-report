import { ChangeDetectorRef, Component, Inject, NgZone, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-upload-template',
  templateUrl: './upload-template.component.html',
  styleUrls: ['./upload-template.component.css']
})
export class UploadTemplateComponent implements OnInit {

  error: String = null;
  name:String = "";
  file: any;
  constructor( 
    @Inject(ChangeDetectorRef)  private ref: ChangeDetectorRef,

       @Inject(NgZone) public ngZone: NgZone,
     @Inject(DataService) public _dataService: DataService,) { }

  ngOnInit() {
  }

  handleFileInput(files) {
      this.file = files[0]
  }

  uploadTemplate() {
    this.error = "upload loading"
     this._dataService.uploadTemplate(this.name, this.file ).subscribe((data)=>{
      console.log("upload ed")
      if ( data["message"] == false) {
        this._dataService.getTemplates()
      }
      
      this.ngZone.run( () => {
       
        this.error = data["message"]
        this.ref.detectChanges()
     });
     })
  }
}
