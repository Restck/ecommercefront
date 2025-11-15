import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProductoService, Producto, Proveedor } from '../../../../core/product.service';
import { CategoriaService, Categoria } from '../../../../core/categoria.service';

@Component({
  selector: 'app-registro-mercancia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './registro-mercancia.component.html',
  styleUrls: ['./registro-mercancia.component.scss']
})
export class RegistroMercanciaComponent implements OnInit {
  @Output() registroCompleto = new EventEmitter<void>();
  @ViewChild('dialogCategoria') dialogCategoria!: TemplateRef<any>;
  @ViewChild('dialogProveedor') dialogProveedor!: TemplateRef<any>;

  productoForm!: FormGroup;
  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];

  imagenSeleccionada: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;

  nuevaCategoria: string = '';
  nuevoProveedor: Partial<Proveedor> = {
    nombre: '',
    telefono: '',
    direccion: ''
  };

  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.crearFormulario();
    this.cargarCategorias();
    this.cargarProveedores();
  }

  private crearFormulario() {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.min(0)]],
      cantidadBodega: [0, [Validators.min(0)]],
      categoria: ['', Validators.required],
      proveedor: ['', Validators.required],
      destino: ['stock', Validators.required],
      imagen: [null]
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => console.error('❌ Error cargando categorías', err)
    });
  }

  cargarProveedores() {
    this.productoService.getProveedores().subscribe({
      next: (data) => (this.proveedores = data),
      error: (err) => console.error('❌ Error cargando proveedores', err)
    });
  }

  onDestinoChange(destino: string) {
    if (destino === 'stock') {
      this.productoForm.get('stock')?.setValidators([Validators.required, Validators.min(1)]);
      this.productoForm.get('cantidadBodega')?.clearValidators();
      this.productoForm.patchValue({ cantidadBodega: 0 });
    } else {
      this.productoForm.get('cantidadBodega')?.setValidators([Validators.required, Validators.min(1)]);
      this.productoForm.get('stock')?.clearValidators();
      this.productoForm.patchValue({ stock: 0 });
    }
    this.productoForm.get('stock')?.updateValueAndValidity();
    this.productoForm.get('cantidadBodega')?.updateValueAndValidity();
  }

  onImagenSeleccionada(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (file) {
      this.imagenSeleccionada = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagenPreview = reader.result);
      reader.readAsDataURL(file);
    } else {
      this.imagenSeleccionada = null;
      this.imagenPreview = null;
    }
  }

  registrarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      alert('⚠️ Completa todos los campos requeridos.');
      return;
    }

    const formValue = this.productoForm.value;
    formValue.destino = formValue.destino || 'stock';

    if (formValue.destino === 'stock') {
      formValue.stock = formValue.stock && formValue.stock > 0 ? formValue.stock : 1;
      formValue.cantidadBodega = 0;
    } else {
      formValue.cantidadBodega = formValue.cantidadBodega && formValue.cantidadBodega > 0 ? formValue.cantidadBodega : 1;
      formValue.stock = 0;
    }

    const nuevoProducto: Producto = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      precio: formValue.precio,
      stock: formValue.stock,
      cantidadBodega: formValue.cantidadBodega,
      categoria: { _id: formValue.categoria, nombre: '' },
      proveedor: { _id: formValue.proveedor, nombre: '' },
      destino: formValue.destino,
      movimientos: [
        {
          tipo: 'entrada',
          cantidad: formValue.destino === 'stock' ? formValue.stock : formValue.cantidadBodega,
          observaciones: 'Registro inicial'
        }
      ]
    };

    this.productoService.crearProductoConImagen(nuevoProducto, this.imagenSeleccionada || undefined).subscribe({
      next: () => {
        alert('✅ Producto registrado correctamente.');
        this.resetFormulario();
        this.registroCompleto.emit();
      },
      error: (err) => {
        console.error('❌ Error al registrar producto:', err);
        alert(err.error?.message || '❌ Error al registrar el producto.');
      }
    });
  }

  private resetFormulario() {
    this.productoForm.reset({
      nombre: '',
      descripcion: '',
      precio: null,
      stock: 0,
      cantidadBodega: 0,
      categoria: '',
      proveedor: '',
      destino: 'stock',
      imagen: null
    });
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
  }

  // ---- CATEGORÍA ----
  abrirDialogCategoria() {
    const dialogRef = this.dialog.open(this.dialogCategoria);
    dialogRef.afterClosed().subscribe(() => {
      this.nuevaCategoria = '';
      this.cargarCategorias();
    });
  }

  guardarCategoria() {
    if (!this.nuevaCategoria.trim()) {
      alert('⚠️ Ingresa un nombre válido para la categoría.');
      return;
    }

    this.categoriaService.crearCategoria(this.nuevaCategoria).subscribe({
      next: () => {
        alert('✅ Categoría creada con éxito.');
        this.dialog.closeAll();
        this.cargarCategorias();
      },
      error: (err) => {
        console.error('❌ Error al crear categoría:', err);
        alert('❌ No se pudo crear la categoría.');
      }
    });
  }

  // ---- PROVEEDOR ----
  abrirDialogProveedor() {
    const dialogRef = this.dialog.open(this.dialogProveedor);
    dialogRef.afterClosed().subscribe(() => {
      this.nuevoProveedor = { nombre: '', telefono: '', direccion: '' };
      this.cargarProveedores();
    });
  }

  guardarProveedor() {
    const { nombre, telefono, direccion } = this.nuevoProveedor;

    if (!nombre?.trim()) {
      alert('⚠️ El nombre del proveedor es obligatorio.');
      return;
    }

    const proveedorData = {
      nombre: nombre.trim(),
      telefono: telefono?.trim() || '',
      direccion: direccion?.trim() || ''
    };

    this.productoService.crearProveedor(proveedorData as Proveedor).subscribe({
      next: () => {
        alert('✅ Proveedor creado con éxito.');
        this.dialog.closeAll();
        this.cargarProveedores();
      },
      error: (err) => {
        console.error('❌ Error al crear proveedor:', err);
        alert('❌ No se pudo crear el proveedor.');
      }
    });
  }
}
