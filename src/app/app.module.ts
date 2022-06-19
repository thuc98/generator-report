import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
 import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { ColumnComponent, DefaultComponent, LabelComponent } from './components/input-components';
import { DisplayBuilderComponent, AdDirective } from './components/display-builder-component';
import { InputDragDropsComponent } from './input-drag-drops/input-drag-drops.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { MatListModule } from '@angular/material/list'
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { DragDropService } from './drag-drop.service';
import { ColorPickerModule } from './color-picker/color-picker.module';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { HttpClient, HttpClientModule } from '@angular/common/http';


import {
  MatSidenavModule,
} from '@angular/material';
import { TargetAttributeComponent } from './target-attribute/target-attribute.component';
import { DataService } from './data.service';
@NgModule({ 
  providers: [
    DragDropService,
    DataService,
    HttpClient
  ],
  imports:      [ 
    BrowserModule, 
    FormsModule, 
    DragDropModule,
    BrowserAnimationsModule, 
    MatButtonModule, 
    MatSidenavModule, 
    MatListModule, 
    MatIconModule, 
    MatExpansionModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    ColorPickerModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    HttpClientModule
  ],
  declarations: [ AdDirective, AppComponent, HelloComponent , ColumnComponent ,LabelComponent,DefaultComponent, DisplayBuilderComponent, InputDragDropsComponent, TargetAttributeComponent],
  entryComponents: [ColumnComponent, DefaultComponent, LabelComponent],
  exports:[MatSidenavModule, MatListModule  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
