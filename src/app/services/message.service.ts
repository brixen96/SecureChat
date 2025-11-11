import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://' + environment.apiurl;

  constructor(private http: HttpClient) { }

  getMessageHistory(username: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}chat/messages/${username}`);
  }
}