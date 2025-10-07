import { createHttpService } from '@ardium-ui/devkit';
import { environment } from 'src/environments/environment';

export class HttpService extends createHttpService(environment.apiUrl, {
  withCredentials: true,
}) {}
