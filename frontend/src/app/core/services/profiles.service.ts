import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Profile, Game, Thumbnail } from '../models';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class ProfilesService {
    constructor(
        private apiService: ApiService
    ) { }

    get(user: string): Observable<Profile> {
        return this.apiService.get('profiles/' + user)
            .pipe(map((data: Profile ) => data));
    }

    follow(user: string): Observable<Profile> {
        return this.apiService.post('profiles/' + user + '/follow');
    }

    unfollow(user: string): Observable<Profile> {
        return this.apiService.delete('profiles/' + user + '/follow');
    }

    query(user: string, type: string): Observable<{
        games: Game[];
        gamesCounts: {
            playing: number,
            pending: number,
            finished: number,
        }
    }> {
        return this.apiService.get('profiles/' + user + '/games', new HttpParams({ fromObject: { type: type } }))
            .pipe(
                map((data) => {
                    return data;
                })
            );
    }

    searchUsers(query: string, limit: number): Observable<Thumbnail[]> {
        let arr: Thumbnail[] = [];
        return this.apiService.get('profiles/search', new HttpParams({ fromObject: { query: query, limit: limit } }))
        .pipe(
            map((data) => {
                arr = data.results;
                return arr;
        })
        );
    }
}
