import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductBreadcrumbService {
  private nombreSubject = new BehaviorSubject<string>('');
  private categoriaSubject = new BehaviorSubject<string>('');

  nombre$ = this.nombreSubject.asObservable();
  categoria$ = this.categoriaSubject.asObservable();

  setNombre(nombre: string): void {
    this.nombreSubject.next(nombre);
  }

  setCategoria(categoria: string): void {
    this.categoriaSubject.next(categoria);
  }

  getNombre(): string {
    return this.nombreSubject.getValue();
  }

  getCategoria(): string {
    return this.categoriaSubject.getValue();
  }
}
