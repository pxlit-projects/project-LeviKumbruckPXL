import { Routes } from '@angular/router';
import { LoginComponent } from './core/login/login.component';
import { AddPostComponent } from './core/add-post/add-post.component';
import { AuthGuard } from './guards/auth.guard';
import { PostsComponent } from './core/posts/posts.component';
import { isRedactorGuard } from './guards/role.guard';
import { UnderReviewComponent } from './core/under-review/under-review.component';
import { PostCommentsComponent } from './core/post-comments/post-comments.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'addPost', component: AddPostComponent, canActivate : [AuthGuard, isRedactorGuard] },
    { path: 'posts', component: PostsComponent, canActivate : [AuthGuard] },
    { path: 'under-review', component: UnderReviewComponent, canActivate: [AuthGuard, isRedactorGuard] },
    { path: 'comments/:postId', component: PostCommentsComponent, canActivate: [AuthGuard] },
];
