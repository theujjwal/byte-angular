import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { ProfileService } from '../../services/profile.service';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { ProfileSidebarComponent } from './components/profile-sidebar/profile-sidebar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ChatSidebarComponent, ChatWindowComponent, ProfileSidebarComponent],
  template: `
    <div class="chat-layout">
      <div class="col-left"><app-chat-sidebar /></div>
      <div class="col-main"><app-chat-window /></div>
      <div class="col-right"><app-profile-sidebar /></div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }
    .chat-layout { display: grid; grid-template-columns: 240px 1fr 220px; height: 100vh; overflow: hidden; }
    .col-left, .col-right { height: 100vh; overflow: hidden; }
    .col-main { height: 100vh; overflow: hidden; min-width: 0; }
    @media(max-width: 768px) {
      .chat-layout { grid-template-columns: 1fr; }
      .col-left, .col-right { display: none; }
    }
  `]
})
export class ChatComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private auth    = inject(AuthService);
  private chat    = inject(ChatService);
  private profile = inject(ProfileService);

  async ngOnInit(): Promise<void> {
    // Restore session if needed
    if (!this.auth.isAuthed()) return;

    // Load profile if not loaded
    if (!this.profile.profile()) {
      const data = await this.auth.restoreSession();
      if (data) {
        this.chat.setChats(data.chats);
        this.profile.setProfile(data.profile);
        this.profile.setProgression(data.progression);
      }
    }

    // Load specific chat from route param
    const chatId = this.route.snapshot.paramMap.get('id');
    if (chatId) {
      await this.chat.loadChat(chatId);
    }
  }
}
