import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent {
  public hue: string;
  @Input("color")
  public color: string;
  @Output()
  selectedColor: EventEmitter<string> = new EventEmitter(true);

  onChangeColor(color){
    this.color = color;
    this.selectedColor.emit(color); 
  }
}
