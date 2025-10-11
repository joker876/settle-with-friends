import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@common/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly isMenuOpen = signal<boolean>(false);

  // current language for the language selector ("pl" or "en")
  readonly currentLang = signal<string>(this.detectCurrentLang());

  private detectCurrentLang(): string {
    const path = window.location?.pathname ?? '/';
    const m = path.match(/^\/(pl|en|de|uk)(?:\/|$)/i);
    const lang = (m?.[1] ?? 'pl').toLowerCase();
    return lang;
  }

  onLanguageChange(lang: string) {
    if (!lang || lang === this.currentLang()) return;

    const path = window.location.pathname;
    const search = window.location.search ?? '';
    const hash = window.location.hash ?? '';

    const newPath = path.replace(/^\/(pl|en|de|uk)(?=\/|$)/i, '/' + lang);

    window.location.href = newPath + search + hash;
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
  }

  login() {
    this.authService.login();
    this.closeMenu();
  }
}
