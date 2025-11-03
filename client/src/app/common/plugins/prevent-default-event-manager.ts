import { EventManagerPlugin } from '@angular/platform-browser';

type Parsed = { baseName: string; prevent: boolean; stop: boolean };

function parseEventName(eventName: string): Parsed {
  const [baseName, ...mods] = eventName.split('.');
  return {
    baseName,
    prevent: mods.includes('prevent'),
    stop: mods.includes('stop')
  };
}

export class PreventAndStopPlugin extends EventManagerPlugin {
  supports(eventName: string): boolean {
    return eventName.includes('.prevent') || eventName.includes('.stop');
  }

  addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: (event: Event) => void
  ): () => void {
    const { baseName, prevent, stop } = parseEventName(eventName);

    return this.manager.getZone().runOutsideAngular(() => {
      const wrapped = (event: Event) => {
        if (prevent && event.cancelable) {
          try { event.preventDefault(); } catch {}
        }
        if (stop) {
          try { event.stopPropagation(); } catch {}
        }
        this.manager.getZone().runGuarded(() => handler(event));
      };

      const options = prevent ? { passive: false } : undefined;

      element.addEventListener(baseName, wrapped as EventListener, options as any);
      return () => {
        element.removeEventListener(baseName, wrapped as EventListener, options as any);
      };
    });
  }

  addGlobalEventListener(
    target: 'window' | 'document' | 'body',
    eventName: string,
    handler: (event: Event) => void
  ): () => void {
    const { baseName, prevent, stop } = parseEventName(eventName);
    const targetObj: any =
      target === 'window' ? window : target === 'document' ? document : document.body;

    return this.manager.getZone().runOutsideAngular(() => {
      const wrapped = (event: Event) => {
        if (prevent && event.cancelable) {
          try { event.preventDefault(); } catch {}
        }
        if (stop) {
          try { event.stopPropagation(); } catch {}
        }
        this.manager.getZone().runGuarded(() => handler(event));
      };

      const options = prevent ? { passive: false } : undefined;

      targetObj.addEventListener(baseName, wrapped as EventListener, options as any);
      return () => {
        targetObj.removeEventListener(baseName, wrapped as EventListener, options as any);
      };
    });
  }
}
