import { Component, inject } from '@angular/core';
import { ReckoningsService } from '@features/main/services/reckonings.service';

@Component({
  selector: 'app-reckoning-list',
  imports: [],
  templateUrl: './reckoning-list.view.html',
  styleUrl: './reckoning-list.view.scss',
})
export class ReckoningListView {
  readonly reckoningsService = inject(ReckoningsService);
}
