import { Routes } from '@angular/router';

// COMPONENTES DE LA TIENDA
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';
import { ProductCategoryComponent } from './features/products/product-category/product-category.component';

// CARRITO
import { CartComponent } from './features/cart/cart/cart.component';
import { CheckoutComponent } from './features/cart/checkout/checkout.component';
import { PaymentComponent } from './features/cart/payment/payment.component';
import { ReceiptFormComponent } from './features/cart/receipt-form/receipt-form.component';

// CLIENTE
import { UserLayoutComponent } from './features/user/user-layout/user-layout.component';
import { ProfileComponent } from './features/user/profile/profile.component';
import { OrderListComponent } from './features/user/order-list/order-list.component';
import { OrderDetailComponent } from './features/user/order-detail/order-detail.component';

// ADMIN
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { OrderManagementComponent } from './features/admin/order-management/order-management.component';
import { ProductListComponent as AdminProductListComponent } from './features/admin/product-management/product-list/product-list.component';
import { ProductFormComponent } from './features/admin/product-management/product-form/product-form.component';

// CONTROL DE MERCANCÍA (ADMIN)
import { ControlMercanciaComponent } from './features/admin/control-mercancia/control-mercancia/control-mercancia.component';
import { RegistroMercanciaComponent } from './features/admin/control-mercancia/registro-mercancia/registro-mercancia.component';
import { MercanciaRegistroComponent } from './features/admin/control-mercancia/mercancia-registro/mercancia-registro.component';

// VENDEDOR
// VENDEDOR
import { VendedorLayoutComponent } from './features/vendedor/vendedor-layout/vendedor-layout.component';
import { UserDashboardComponent } from './features/vendedor/user-dashboard/user-dashboard.component';
import { ArmarPedidoComponent } from './features/vendedor/armar-pedido/armar-pedido.component';
import { PedidosEnEsperaComponent } from './features/vendedor/pedidos-en-espera/pedidos-en-espera.component';


// 404
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';

// AUTENTICACIÓN (Lazy Load)
const LoginComponent = () => import('./features/auth/login/login.component').then(m => m.LoginComponent);
const RegisterComponent = () => import('./features/auth/register/register.component').then(m => m.RegisterComponent);
const ForgotPasswordComponent = () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent);

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },

  // TIENDA
  { path: 'productos', component: ProductListComponent },
  { path: 'productos/:id', component: ProductDetailComponent },
  { path: 'categoria/:nombre', component: ProductCategoryComponent },

  // CARRITO
  { path: 'carrito', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'pago', component: PaymentComponent },
  { path: 'subir-recibo', component: ReceiptFormComponent },

  // CLIENTE
  {
    path: 'cliente',
    component: UserLayoutComponent,
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      { path: 'perfil', component: ProfileComponent },
      { path: 'mis-pedidos', component: OrderListComponent },
      { path: 'pedido/:id', component: OrderDetailComponent }
    ]
  },

// ADMIN
{
  path: 'admin',
  component: AdminLayoutComponent,
  children: [
    { path: '', component: AdminDashboardComponent },
    { path: 'usuarios', component: UserManagementComponent },
    { path: 'pedidos', component: OrderManagementComponent },
    { path: 'productos', component: AdminProductListComponent },
    { path: 'productos/nuevo', component: ProductFormComponent },
    { path: 'productos/editar/:id', component: ProductFormComponent },

    // CONTROL DE MERCANCÍA como dashboard propio
    {
      path: 'control-mercancia',
      component: ControlMercanciaComponent,
      children: [
        { path: '', redirectTo: 'registro', pathMatch: 'full' },
        { path: 'registro', component: RegistroMercanciaComponent },
        { path: 'crear', component: MercanciaRegistroComponent }
      ]
    }
  ]
},

// VENDEDOR
{
  path: 'vendedor',
  component: VendedorLayoutComponent,
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: UserDashboardComponent }, 
    { path: 'armar-pedido', component: ArmarPedidoComponent }, 
    { path: 'pedidos-en-espera', component: PedidosEnEsperaComponent },
  ]
},



  // AUTENTICACIÓN
  { path: 'login', loadComponent: LoginComponent },
  { path: 'registro', loadComponent: RegisterComponent },
  { path: 'recuperar', loadComponent: ForgotPasswordComponent },

  // 404
  { path: '**', component: PageNotFoundComponent }
];
