import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models';
import { map, distinctUntilChanged } from 'rxjs/operators';


@Injectable()
export class UserService {
    private currentUserSubject = new BehaviorSubject<User>({} as User);
    public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

    private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
    public isAuthenticated = this.isAuthenticatedSubject.asObservable();
    private currentRoleSubject = new BehaviorSubject<string>('');
    public currentRole = this.currentRoleSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private http: HttpClient,
        private jwtService: JwtService,
        private cookieService: CookieService
    ) { }

    // Verify JWT in localstorage with server & load user's info.
    // This runs once on application startup.
    populate() {
        // If JWT detected, attempt to get & store user's info
        if (this.jwtService.getToken()) {
            this.setAuth(this.cookieService.get('gcsession'));
        } else {
            // Remove any potential remnants of previous auth states
            this.purgeAuth();
        }
    }

    setAuth(token: string) {
        // Save JWT sent from server in localstorage
        let user: User = JSON.parse(this.cookieService.get('gcuser'));
        this.jwtService.saveToken(token);
        // Set current user data into observable
        this.currentUserSubject.next(user);
        // Set isAuthenticated to true
        this.isAuthenticatedSubject.next(true);

        this.currentRoleSubject.next(user.role);
    }

    purgeAuth() {
        this.apiService.post('auth/logout').subscribe();
        this.jwtService.destroyToken();
        // Set current user to an empty object
        this.currentUserSubject.next({} as User);
        // Set auth status to false
        this.isAuthenticatedSubject.next(false);

        this.currentRoleSubject.next('');
    }

    attemptAuth(type: String, credentials: Object): Observable<User> {
        const route = (type === 'login') ? '/login' : '';
        return this.apiService.post('auth' + route, credentials)
            .pipe(map(
                data => {
                    console.log(data)
                    this.setAuth(data.access);
                    return data;
                }
            ));
    }

    getCurrentUser(): User {
        return this.currentUserSubject.value;
    }

    // Update the user on the server (email, pass, etc)
    update(user: User): Observable<User> {
        return this.apiService
            .put('/user', { user })
            .pipe(map(data => {
                // Update the currentUser observable
                this.currentUserSubject.next(data.user);
                return data.user;
            }));
    }

}
