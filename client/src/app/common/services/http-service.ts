import { Injectable } from '@angular/core';
import { createHttpService } from '@ardium-ui/devkit';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpService extends createHttpService(environment.apiUrl, { withCredentials: true }) {}
