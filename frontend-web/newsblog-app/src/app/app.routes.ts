import { Routes } from '@angular/router';
import { LoginComponent } from './core/login/login.component';
import { AddPostComponent } from './core/post/add-post/add-post.component';
import { authGuard } from './guards/auth.guard';
import { isRedactorGuard } from './guards/role.guard';
import { PostListComponent } from './core/post/post-list/post-list.component';
import { CommentListComponent } from './core/comment/comment-list/comment-list.component';
import { UnderReviewListComponent } from './core/review/under-review-list/under-review-list.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'addPost', component: AddPostComponent, canActivate : [authGuard, isRedactorGuard] },
    { path: 'posts', component: PostListComponent, canActivate : [authGuard] },
    { path: 'under-review', component: UnderReviewListComponent, canActivate: [authGuard, isRedactorGuard] },
    { path: 'posts/:postId/comments', component: CommentListComponent, canActivate: [authGuard] },
];