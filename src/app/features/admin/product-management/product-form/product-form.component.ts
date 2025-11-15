import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ProductoService, Producto } from '../../../../core/product.service';
import { CategoriaService, Categoria } from '../../../../core/categoria.service';
import { ConfirmDialogComponent } from '../../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule
  ],
  animations: [
    trigger('categoriaAnimada', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})

export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private dialog = inject(MatDialog);

  form: FormGroup;
  selectedFile: File | null = null;
  imagenPreviewUrl: string | null = null;
  productoId: string | null = null;
  editMode = false;

  categorias: Categoria[] = [];
  nuevaCategoria = '';
  producto?: Producto;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        this.productoId = id;
        this.editMode = !!id;

        const categorias$ = this.categoriaService.getCategorias();
        const producto$ = id ? this.productoService.getProducto(id) : of(null);

        return combineLatest([categorias$, producto$]);
      })
    ).subscribe(([cats, producto]) => {
      this.categorias = cats;

      if (producto) {
        this.producto = producto;
        const categoriaId = typeof producto.categoria === 'string'
          ? producto.categoria
          : producto.categoria?._id;

        if (!this.categorias.some(cat => cat._id === categoriaId)) {
          this.categorias.push({ _id: categoriaId, nombre: 'Categoría desconocida' });
        }

        this.form.patchValue({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          stock: producto.stock,
          categoria: categoriaId
        });

        this.imagenPreviewUrl = producto.imagen || null;
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  imagenPreview(): string | null {
    return this.imagenPreviewUrl;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, descripcion, precio, stock, categoria } = this.form.value;
    const categoriaId = typeof categoria === 'string' ? categoria : categoria?._id;

    if (!categoriaId) {
      alert('⚠️ Debes seleccionar una categoría válida.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', precio.toString());
    formData.append('stock', stock.toString());
    formData.append('categoria', categoriaId);

    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    } else if (!this.editMode) {
      alert('⚠️ Debes seleccionar una imagen para el nuevo producto.');
      return;
    }

    this.productoService.guardarProducto(this.productoId, formData).subscribe({
      next: () => {
        alert(this.editMode ? '✅ Producto actualizado' : '✅ Producto creado');
        this.router.navigate(['/admin/productos']);
      },
      error: err => {
        console.error('❌ Error al guardar producto:', err);
        alert(err.error?.mensaje || '❌ Error al guardar el producto');
      }
    });
  }

  agregarCategoria(): void {
    const nueva = this.nuevaCategoria.trim().toLowerCase();
    if (nueva && !this.categorias.some(cat => cat.nombre.toLowerCase() === nueva)) {
      this.categoriaService.crearCategoria(nueva).subscribe({
        next: cat => {
          this.categorias.push(cat);
          this.nuevaCategoria = '';
        },
        error: err => {
          alert(err.error?.mensaje || 'Error al agregar categoría');
        }
      });
    }
  }

  eliminarCategoria(id: string): void {
    const seleccionada = this.form.value.categoria;
    if (seleccionada === id) {
      alert('No puedes eliminar una categoría que está en uso.');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { mensaje: '¿Deseas eliminar esta categoría?' }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.categoriaService.eliminarCategoria(id).subscribe({
          next: () => {
            this.categorias = this.categorias.filter(cat => cat._id !== id);
          },
          error: err => {
            alert(err.error?.mensaje || 'Error al eliminar categoría');
          }
        });
      }
    });
  }
}
 