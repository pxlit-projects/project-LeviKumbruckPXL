import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './core/login/login.component';
import { AddPostComponent } from './core/add-post/add-post.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent, AddPostComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'newsblog-app';
}
