import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ThinkingProfile, ProgressionData } from '../core/models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = inject(ApiService);

  profile     = signal<ThinkingProfile | null>(null);
  progression = signal<ProgressionData | null>(null);

  setProfile(p: ThinkingProfile): void { this.profile.set(p); }
  setProgression(p: ProgressionData): void { this.progression.set(p); }

  getProgression(): ProgressionData | null {
    return this.progression() as ProgressionData | null;
  }

  async refresh(): Promise<void> {
    const data = await this.api.get<{ profile: ThinkingProfile; progression: ProgressionData }>('/profile', { skipLoader: true });
    this.profile.set(data.profile);
    this.progression.set(data.progression);
  }
}
