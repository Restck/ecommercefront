import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  PRIMARY_OUTLET,
  Router,
  UrlSegment,
  RouterLink
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductBreadcrumbService } from '../../core/product-breadcrumb.service';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breadcrumbService: ProductBreadcrumbService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
      });

    this.breadcrumbService.nombre$.subscribe(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    });

    this.breadcrumbService.categoria$.subscribe(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    for (const child of children) {
      if (child.outlet !== PRIMARY_OUTLET) continue;

      const routeSnapshot = child.snapshot;
      const routeURL: string = routeSnapshot.url.map((segment: UrlSegment) => segment.path).join('/');
      if (routeURL) {
        url += `/${routeURL}`;
      }

      let label = routeSnapshot.data['breadcrumb'];
      const path = routeSnapshot.routeConfig?.path;

      // Si es ruta dinámica y sin breadcrumb, intenta obtenerlo del servicio
      if ((label === undefined || label === null)) {
        switch (path) {
          case 'productos/:id':
            label = this.breadcrumbService.getNombre() || 'Detalle';

            // ⚠️ Insertar manualmente 'Productos' y la categoría si existen
            breadcrumbs.push({ label: 'Productos', url: '/productos' });

            const categoria = this.breadcrumbService.getCategoria();
            if (categoria) {
              breadcrumbs.push({
                label: categoria,
                url: `/categoria/${categoria.toLowerCase()}`
              });
            }

            break;

          case 'categoria/:nombre':
            label = this.breadcrumbService.getCategoria() || 'Categoría';
            break;

          case 'pedido/:id':
            label = this.breadcrumbService.getNombre() || 'Pedido';
            break;
        }
      }

      if (label !== null && label !== undefined) {
        breadcrumbs.push({ label, url });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
