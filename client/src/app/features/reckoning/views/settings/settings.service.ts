import { inject, Injectable } from '@angular/core';
import { HttpService } from '@common/services/http-service';
import { UsersService } from '@features/reckoning/services/users.service';

@Injectable()
export class SettingsService {
  private readonly _http = inject(HttpService);
  private readonly _usersService = inject(UsersService);

  public readonly users = this._usersService.users;
}
