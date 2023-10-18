import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UrlReaderService {

  constructor(private http: HttpClient) { }

  getDataFromPublicURL(url: string) {
    return this.http.get(url);
  }
}
