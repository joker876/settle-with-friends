import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@common/components/header/header.component';
import { TitleService } from '@common/services/title.service';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as plStrings } from 'ngx-timeago/language-strings/pl.js';
import { filter, map, mergeMap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly _titleService = inject(TitleService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this._activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap(route => route.data)
      )
      .subscribe(data => {
        this._titleService.currentBaseTitle.set(data['title'] ?? null);
      });
  }

  private readonly _intl = inject(TimeagoIntl);
  constructor() {
    this._intl.strings = plStrings;
    this._intl.changes.next();
  }
}
