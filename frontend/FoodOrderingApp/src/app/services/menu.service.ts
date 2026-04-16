import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MenuItem, MenuItemPagedResponse } from '../models/menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private apiUrl = 'http://localhost:5000/api/menu';

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, pageSize: number = 12, categoryId?: number): Observable<MenuItemPagedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get<MenuItemPagedResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
  }

  create(item: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, item);
  }

  update(id: number, item: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
