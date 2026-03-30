import { Component, inject } from '@angular/core';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-loader',
  template: `
    @if (loader.visible()) {
      <div class="loader-overlay">
        <div class="loader-spinner">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    }
  `,
  styles: `
    .loader-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(8, 11, 20, 0.6);
      backdrop-filter: blur(2px);
    }

    .loader-spinner {
      display: flex;
      gap: 8px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent);
      animation: bounce 1.2s ease-in-out infinite;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30%            { transform: translateY(-12px); opacity: 1; }
    }
  `,
})
export class LoaderComponent {
  protected loader = inject(LoaderService);
}
