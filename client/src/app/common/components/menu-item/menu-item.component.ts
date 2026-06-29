import { Component, input } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';

@Component({
  selector: 'app-menu-item',
  imports: [MatMenuModule, MatTooltipModule],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {
  readonly disabled = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly disabledTooltip = input<string | null, string | null>(null, { transform: v => v || null });
}
