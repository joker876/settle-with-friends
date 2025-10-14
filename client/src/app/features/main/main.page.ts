import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReckoningsService } from './services/reckonings.service';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet],
  templateUrl: './main.page.html',
  styleUrl: './main.page.scss',
  providers: [ReckoningsService],
})
export class MainPage {}
