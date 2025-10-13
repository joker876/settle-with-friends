import { computed, effect, inject, Injectable, RendererFactory2, ResourceStatus, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HttpService } from '@common/services/http-service';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { IAuthRegisterRequestDto } from '@shared/contracts/auth/register';
import { IAuthStatusResponseDto } from '@shared/contracts/auth/status';
import { SnackbarController } from './snackbar-controller.service';

export const LogoutReason = {
  LoggedOut: 'LOGGED_OUT',
  RegistrationUnavailable: 'REGISTRATION_UNAVAILABLE',
  SessionExpired: 'SESSION_EXPIRED',
} as const;
export type LogoutReason = (typeof LogoutReason)[keyof typeof LogoutReason];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _http = inject(HttpService);
  private readonly _router = inject(Router);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly _snackbarController = inject(SnackbarController);

  private readonly _authStatus = rxResource({
    loader: () => this._http.get<IAuthStatusResponseDto>('/auth/status'),
  });

  public readonly isSafeToRedirect = computed<boolean>(() => !!this._authStatus.value());
  public readonly isLoggedIn = computed<boolean>(() => !!this._authStatus.value()?.loggedIn);
  public readonly isRegistered = computed<boolean>(() => !!this._authStatus.value()?.isRegistered);

  public readonly userData = computed(() => this._authStatus.value()?.user ?? null);

  public readonly sessionExpiryDate = computed(() => {
    const timestamp = this._authStatus.value()?.expiresAt;
    if (!timestamp) return null;
    return new Date(timestamp);
  });

  private readonly _logoutReason = signal<LogoutReason | null>(null);
  public readonly logoutReason = this._logoutReason.asReadonly();

  private _redirectToLoginTimeout: any = null;
  private unlistenWindowFocus?: () => void;
  constructor() {
    const renderer = this.rendererFactory.createRenderer(null, null);
    this.unlistenWindowFocus = renderer.listen('window', 'focus', () => this._checkLoginStatusOnWindowFocus());

    effect(() => {
      this._destroyRedirectToLoginTimeout();

      const sessExpiryDate = this.sessionExpiryDate();
      if (!sessExpiryDate) return;

      this._redirectToLoginTimeout = setTimeout(() => {
        this.navigateToLoginOnSessionExpired();
      }, sessExpiryDate.valueOf() - Date.now());
    });
    effect(() => {
      if (this.isSafeToRedirect() && !this.isLoggedIn() && !window.location.href.includes('register-impossible')) {
        this.navigateToLogin();
      }
    });
    effect(() => {
      if (this.isLoggedIn() && !this.isRegistered()) {
        this.navigateToRegister();
      }
    });
  }

  private _checkLoginStatusOnWindowFocus() {
    const sessExpiryDate = this.sessionExpiryDate();
    if (!sessExpiryDate) return;

    if (Date.now() >= sessExpiryDate.valueOf()) {
      this.navigateToLoginOnSessionExpired();
    }
  }

  private _destroyRedirectToLoginTimeout() {
    if (!this._redirectToLoginTimeout) return;

    clearTimeout(this._redirectToLoginTimeout);
  }
  private _destroyWindowFocusListener() {
    if (this.unlistenWindowFocus) {
      this.unlistenWindowFocus();
      this.unlistenWindowFocus = undefined;
    }
  }

  ngOnDestroy(): void {
    this._destroyRedirectToLoginTimeout();
    this._destroyWindowFocusListener();
  }

  //! navigation
  navigateToLoginOnSessionExpired() {
    this._authStatus.set(undefined);
    this._logoutReason.set(LogoutReason.SessionExpired);
    this.navigateToLogin();
  }
  navigateToLogin() {
    this._router.navigateByUrl('/login');
  }
  navigateToRegister() {
    this._router.navigateByUrl('/login/register');
  }
  navigateToMainPage() {
    this._router.navigateByUrl('/');
  }

  //! login
  private readonly _isLoginLoading = signal<boolean>(false);
  public readonly isLoginLoading = this._isLoginLoading.asReadonly();

  login(): void {
    this._isLoginLoading.set(true);

    window.location.href = this._http.apiUrl + `auth/google/login`;
  }

  //! logout
  logout(): void {
    this._http.post('/auth/logout', null).subscribe({
      next: () => {
        this._authStatus.set(undefined);
        this._logoutReason.set(LogoutReason.LoggedOut);
        this.navigateToLogin();
      },
      error: error => {
        console.error('Logout failed:', error);
      },
    });
  }
  logoutBecauseRegistrationUnavailable(): void {
    this._authStatus.set(undefined);
    this._logoutReason.set(LogoutReason.RegistrationUnavailable);
    this.navigateToLogin();
  }

  //! register
  private readonly _registerStatus = signal<ResourceStatus>(ResourceStatus.Idle);
  public readonly registerStatus = this._registerStatus.asReadonly();

  public register(registerData: IAuthRegisterRequestDto) {
    if (this._registerStatus() === ResourceStatus.Loading) return;

    this._registerStatus.set(ResourceStatus.Loading);

    this._http
      .post<IAuthRegisterRequestDto>('/auth/register', registerData)
      .pipe(setResourceStatusAfterLoaded(this._registerStatus))
      .subscribe({
        next: () => {
          this._authStatus.update(v => ({ ...v!, user: { ...v!.user!, ...registerData }, isRegistered: true }));

          this._snackbarController.openSuccess($localize`:@@register.snackbar.success:Zapisano!`);
        },
        error: () => {
          this._snackbarController.openError(
            $localize`:@@register.snackbar.error:Nie udało się zapisać danych. Spróbuj ponownie za chwilę.`
          );
        },
      });
  }
}
