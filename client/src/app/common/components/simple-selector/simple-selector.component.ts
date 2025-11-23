import { AfterContentInit, Component, input, model } from '@angular/core';

export interface ISimpleSelectorOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-simple-selector',
  imports: [],
  templateUrl: './simple-selector.component.html',
  styleUrl: './simple-selector.component.scss',
})
export class SimpleSelectorComponent implements AfterContentInit {
  readonly options = input.required<ISimpleSelectorOption[]>();

  readonly value = model<any>(null);

  ngAfterContentInit(): void {
    if (this.value() === null) {
      this.value.set(this.options()[0].value);
    }
  }
}
