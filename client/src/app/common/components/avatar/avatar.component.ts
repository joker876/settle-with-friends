import { Component, input } from '@angular/core';
import { coerceBooleanProperty } from '@ardium-ui/devkit';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly photo = input<string | undefined, string | undefined>(undefined, {
    transform: v => v && `data:image/png;base64,${v}`,
  });

  readonly showName = input<boolean, any>(false, { transform: v => coerceBooleanProperty(v) });
  readonly withStatus = input<boolean, any>(false, { transform: v => coerceBooleanProperty(v) });
}
