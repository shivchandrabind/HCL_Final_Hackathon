# FoodieExpress - Architecture & Concepts Guide

A complete explanation of every concept, pattern, and technology used in this Full Stack Retail Food Ordering System, with real examples from the codebase showing how files connect to each other.

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [DTOs (Data Transfer Objects)](#2-dtos-data-transfer-objects)
3. [Entities (Domain Models)](#3-entities-domain-models)
4. [Repository Pattern](#4-repository-pattern)
5. [Service Layer](#5-service-layer)
6. [Controllers (API Layer)](#6-controllers-api-layer)
7. [Dependency Injection (DI)](#7-dependency-injection-di)
8. [AutoMapper & MappingProfile](#8-automapper--mappingprofile)
9. [DbContext (Entity Framework Core)](#9-dbcontext-entity-framework-core)
10. [Middleware (ExceptionMiddleware)](#10-middleware-exceptionmiddleware)
11. [JWT Authentication](#11-jwt-authentication)
12. [BCrypt Password Hashing](#12-bcrypt-password-hashing)
13. [Rate Limiting](#13-rate-limiting)
14. [CORS (Cross-Origin Resource Sharing)](#14-cors-cross-origin-resource-sharing)
15. [Angular Standalone Components](#15-angular-standalone-components)
16. [Angular Services (Frontend)](#16-angular-services-frontend)
17. [HTTP Interceptor](#17-http-interceptor)
18. [Route Guards](#18-route-guards)
19. [Angular Models/Interfaces](#19-angular-modelsinterfaces)
20. [Reactive Forms & Validation](#20-reactive-forms--validation)
21. [Lazy Loading & Routing](#21-lazy-loading--routing)
22. [Complete Request Flow (End-to-End)](#22-complete-request-flow-end-to-end)

---

## 1. Project Architecture Overview

The project follows a **layered architecture** with clear separation of concerns:

```
FRONTEND (Angular 19)                       BACKEND (.NET 10 Web API)
========================                    ===========================
                                            
Component (.ts)                             Controller
    |                                           |
    v                                           v
Angular Service ---- HTTP Request ---->     Service Layer
    |                                           |
    v                                           v
Model/Interface                             Repository Layer
                                                |
                                                v
                                            DbContext (EF Core)
                                                |
                                                v
                                            MySQL Database
```

**Why layered?** Each layer has a single responsibility. If you want to change the database from MySQL to PostgreSQL, you only modify the DbContext config — controllers and services don't change. If you want to add caching, you modify the service layer — controllers don't care.

---

## 2. DTOs (Data Transfer Objects)

### What is a DTO?
A DTO is a simple class that carries data between layers. It defines **what data the API sends/receives** — nothing more, nothing less. It has no business logic, no database behavior.

### Why do we need DTOs?
The `Customer` entity in the database has a `PasswordHash` field. If we returned the entity directly from the API, the password hash would be exposed to the frontend. DTOs solve this by controlling exactly which fields are visible.

### Real Example from the Project

**Entity (what's in the database)** — `backend/Entities/Customer.cs`:
```csharp
public class Customer
{
    public int CustomerId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }    // SENSITIVE - must never leave the server
    public string Role { get; set; }
    public int LoyaltyPoints { get; set; }
    // ... more fields
}
```

**Request DTO (what the frontend SENDS)** — `backend/DTOs/AuthDTOs.cs`:
```csharp
public class RegisterDto
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }   // Plain text password (will be hashed by service)
    public string? Phone { get; set; }
    public string? Address { get; set; }
}
```

**Response DTO (what the API RETURNS)** — `backend/DTOs/AuthDTOs.cs`:
```csharp
public class AuthResponseDto
{
    public string Token { get; set; }       // JWT token
    public string Role { get; set; }
    public string Name { get; set; }
    public int CustomerId { get; set; }
    // NOTE: No PasswordHash here! The frontend never sees it.
}
```

### How DTOs Connect to Other Files

```
AuthDTOs.cs (defines the shape)
    |
    +--> AuthController.cs    (receives RegisterDto from HTTP request, returns AuthResponseDto)
    |
    +--> AuthService.cs       (takes RegisterDto, creates Customer entity, returns AuthResponseDto)
    |
    +--> MappingProfile.cs    (AutoMapper maps between Customer <--> DTOs)
    |
    +--> auth.service.ts      (Angular service sends/receives these shapes via HTTP)
    |
    +--> customer.model.ts    (Angular interface mirrors the DTO structure)
```

### All DTO Files and Their Purpose

| File | Request DTOs | Response DTOs | Used By |
|------|-------------|---------------|---------|
| `AuthDTOs.cs` | RegisterDto, LoginDto | AuthResponseDto, CustomerProfileDto | AuthController, AuthService |
| `CartDTOs.cs` | AddToCartDto, UpdateCartDto | CartDto, CartItemDto | CartController, CartService |
| `MenuDTOs.cs` | CreateMenuItemDto, UpdateMenuItemDto | MenuItemDto, MenuItemPagedResponse | MenuController, MenuService |
| `OrderDTOs.cs` | PlaceOrderDto | OrderDto, OrderItemDto | OrdersController, OrderService |
| `CategoryDTOs.cs` | CreateCategoryDto | CategoryDto | CategoriesController, CategoryService |
| `CouponDTOs.cs` | CreateCouponDto, ApplyCouponRequest | CouponDto | CouponsController, CouponService |

---

## 3. Entities (Domain Models)

### What is an Entity?
An Entity represents a **database table as a C# class**. Each property maps to a column. Entity Framework Core uses these classes to generate SQL queries.

### Real Example — `backend/Entities/Customer.cs`:
```csharp
[Table("Customers")]                     // Maps to "Customers" table in MySQL
public class Customer
{
    [Key]                                // Primary Key
    public int CustomerId { get; set; }

    [Required, MaxLength(100)]           // NOT NULL, VARCHAR(100)
    public string Name { get; set; }

    public ICollection<Order> Orders { get; set; }  // Navigation property (one-to-many)
    public Cart? Cart { get; set; }                 // Navigation property (one-to-one)
}
```

### How Entities Connect to Other Files

```
Customer.cs (Entity)
    |
    +--> AppDbContext.cs          (registers DbSet<Customer> so EF Core knows about the table)
    |
    +--> CustomerRepository.cs   (uses _context.Customers to query the database)
    |
    +--> AuthService.cs          (creates new Customer objects, passes to repository)
    |
    +--> MappingProfile.cs       (AutoMapper maps Customer <--> AuthResponseDto)
    |
    +--> schema.sql              (the actual SQL CREATE TABLE that matches this entity)
```

### Entity vs DTO — Key Difference

| Aspect | Entity | DTO |
|--------|--------|-----|
| Purpose | Represents database table | Represents API request/response |
| Contains | All columns + navigation properties | Only the fields the client needs |
| Has logic? | No (just data) | No (just data) |
| Used by | Repository, DbContext | Controller, Service |
| Has PasswordHash? | YES | NO (security) |

---

## 4. Repository Pattern

### What is a Repository?
A Repository is a class that **handles all database operations** (CRUD) for a specific entity. It wraps Entity Framework Core calls so the rest of the app doesn't interact with the database directly.

### Why use Repositories?
- **Separation**: Services don't know about EF Core or SQL
- **Testability**: You can mock the repository in unit tests
- **Reusability**: Multiple services can use the same repository

### Real Example — `backend/Repositories/CustomerRepository.cs`:
```csharp
public class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _context;       // Injected by DI

    public async Task<Customer?> GetByIdAsync(int id) =>
        await _context.Customers.FindAsync(id);   // EF Core generates: SELECT * FROM Customers WHERE CustomerId = @id

    public async Task<Customer?> GetByEmailAsync(string email) =>
        await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);

    public async Task<Customer> CreateAsync(Customer customer)
    {
        _context.Customers.Add(customer);          // Track the new entity
        await _context.SaveChangesAsync();         // Execute INSERT INTO Customers ...
        return customer;
    }
}
```

### Interface — `backend/Repositories/Interfaces/ICustomerRepository.cs`:
```csharp
public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(int id);
    Task<Customer?> GetByEmailAsync(string email);
    Task<Customer> CreateAsync(Customer customer);
    Task UpdateAsync(Customer customer);
}
```

### Why Interfaces?
The service depends on `ICustomerRepository` (interface), NOT `CustomerRepository` (implementation). This means:
- You can swap the implementation without changing the service
- You can create a mock/fake repository for testing

### How Repositories Connect to Other Files

```
ICustomerRepository.cs (interface - defines the contract)
    |
    +--> CustomerRepository.cs   (implements the interface, talks to AppDbContext)
    |
    +--> AuthService.cs          (depends on ICustomerRepository, calls GetByEmailAsync, CreateAsync)
    |
    +--> Program.cs              (registers: services.AddScoped<ICustomerRepository, CustomerRepository>())
```

---

## 5. Service Layer

### What is a Service?
A Service contains the **business logic** of the application. It sits between the Controller and Repository, orchestrating operations.

### Why a separate Service layer?
Controllers should only handle HTTP concerns (request/response). Services handle the "thinking" — validation, hashing passwords, generating tokens, calculating totals.

### Real Example — `backend/Services/AuthService.cs`:
```csharp
public class AuthService : IAuthService
{
    private readonly ICustomerRepository _customerRepo;  // Database access
    private readonly JwtHelper _jwtHelper;               // Token generation

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // 1. Business rule: check if email already exists
        var existing = await _customerRepo.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new InvalidOperationException("Email already registered.");

        // 2. Business logic: hash the password
        var customer = new Customer
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        };

        // 3. Save to database via repository
        await _customerRepo.CreateAsync(customer);

        // 4. Generate JWT token
        var token = _jwtHelper.GenerateToken(customer);

        // 5. Return DTO (not the entity!)
        return new AuthResponseDto { Token = token, Name = customer.Name, ... };
    }
}
```

### How Services Connect to Other Files

```
IAuthService.cs (interface)
    |
    +--> AuthService.cs          (implementation with business logic)
    |       |
    |       +--> ICustomerRepository  (database calls)
    |       +--> JwtHelper            (token generation)
    |       +--> BCrypt               (password hashing)
    |       +--> RegisterDto          (input shape)
    |       +--> AuthResponseDto      (output shape)
    |
    +--> AuthController.cs       (calls _authService.RegisterAsync())
    |
    +--> Program.cs              (registers: services.AddScoped<IAuthService, AuthService>())
```

---

## 6. Controllers (API Layer)

### What is a Controller?
A Controller defines **API endpoints** (URLs). It receives HTTP requests, passes them to services, and returns HTTP responses. It should contain NO business logic.

### Real Example — `backend/Controllers/AuthController.cs`:
```csharp
[ApiController]                              // Enables automatic model validation
[Route("api/[controller]")]                  // Base URL: /api/auth
[EnableRateLimiting("fixed")]                // Rate limiting policy
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    [HttpPost("register")]                   // POST /api/auth/register
    [EnableRateLimiting("auth")]             // Stricter rate limit (10/min)
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);   // Delegate to service
        return CreatedAtAction(nameof(Register), result);     // Return 201 Created
    }

    [HttpPost("login")]                      // POST /api/auth/login
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);                                    // Return 200 OK
    }

    [HttpGet("profile")]                     // GET /api/auth/profile
    [Authorize]                              // Requires JWT token
    public async Task<ActionResult<CustomerProfileDto>> GetProfile()
    {
        var customerId = int.Parse(User.FindFirst("CustomerId")!.Value);  // Extract from JWT
        var profile = await _authService.GetProfileAsync(customerId);
        return Ok(profile);
    }
}
```

### How Controllers Connect to Other Files

```
AuthController.cs
    |
    +--> IAuthService           (calls business logic methods)
    +--> RegisterDto, LoginDto  (receives these from HTTP request body)
    +--> AuthResponseDto        (returns this in HTTP response)
    +--> [Authorize]            (JWT middleware validates the token)
    +--> [EnableRateLimiting]   (rate limiting middleware checks request count)
    |
    Frontend calls this via:
    +--> auth.service.ts        (Angular HttpClient sends POST /api/auth/login)
```

---

## 7. Dependency Injection (DI)

### What is DI?
Instead of a class creating its own dependencies (`new CustomerRepository()`), the framework **injects** them through the constructor. This is configured in `Program.cs`.

### Real Example — `backend/Program.cs`:
```csharp
// "Whenever someone asks for ICustomerRepository, give them a CustomerRepository"
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<JwtHelper>();
```

### Lifetime Types

| Lifetime | Meaning | Used For |
|----------|---------|----------|
| `AddScoped` | One instance per HTTP request | Repositories, Services (tied to a DB transaction) |
| `AddSingleton` | One instance for the entire app lifetime | JwtHelper, config objects |
| `AddTransient` | New instance every time it's requested | Lightweight stateless services |

### The Chain of Injection

```
Program.cs registers everything
    |
    v
AuthController needs IAuthService --> DI creates AuthService
    |
    AuthService needs ICustomerRepository --> DI creates CustomerRepository
        |
        CustomerRepository needs AppDbContext --> DI creates AppDbContext
            |
            AppDbContext needs connection string --> DI reads from appsettings.json
```

All of this happens automatically. You never write `new AuthService(new CustomerRepository(...))`.

---

## 8. AutoMapper & MappingProfile

### What is AutoMapper?
AutoMapper automatically copies matching properties from one object to another (Entity to DTO and vice versa), so you don't write repetitive mapping code.

### Real Example — `backend/Helpers/MappingProfile.cs`:
```csharp
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Simple mapping: matching property names copied automatically
        CreateMap<Customer, AuthResponseDto>();
        CreateMap<RegisterDto, Customer>();

        // Custom mapping: CategoryName doesn't exist on MenuItem, so we tell AutoMapper where to find it
        CreateMap<MenuItem, MenuItemDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name));

        // Computed mapping: Subtotal = Price * Quantity
        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(d => d.Subtotal, opt => opt.MapFrom(s => s.Price * s.Quantity));
    }
}
```

### Without AutoMapper (manual mapping):
```csharp
// You'd have to write this everywhere:
var dto = new MenuItemDto
{
    MenuItemId = entity.MenuItemId,
    Name = entity.Name,
    Price = entity.Price,
    Description = entity.Description,
    CategoryName = entity.Category.Name,
    // ... 10 more properties
};
```

### With AutoMapper:
```csharp
var dto = _mapper.Map<MenuItemDto>(entity);  // One line!
```

### How MappingProfile Connects

```
MappingProfile.cs (defines all mappings)
    |
    +--> Program.cs              (registered: AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>()))
    |
    +--> MenuService.cs          (calls _mapper.Map<MenuItemDto>(menuItem))
    +--> OrderService.cs         (calls _mapper.Map<OrderDto>(order))
    +--> CartService.cs          (calls _mapper.Map<CartDto>(cart))
    |
    +--> Entities/*.cs           (source objects)
    +--> DTOs/*.cs               (destination objects)
```

---

## 9. DbContext (Entity Framework Core)

### What is DbContext?
DbContext is the **bridge between C# and MySQL**. It translates LINQ queries into SQL and manages database connections.

### Real Example — `backend/Data/AppDbContext.cs`:
```csharp
public class AppDbContext : DbContext
{
    // Each DbSet = one table in MySQL
    public DbSet<Customer> Customers => Set<Customer>();    // "Customers" table
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();    // "MenuItems" table
    public DbSet<Order> Orders => Set<Order>();             // "Orders" table

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Define relationships
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();       // Unique email constraint
            entity.HasOne(e => e.Cart)                      // One customer has one cart
                  .WithOne(c => c.Customer)
                  .HasForeignKey<Cart>(c => c.CustomerId);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasOne(e => e.Customer)                  // One customer has many orders
                  .WithMany(c => c.Orders)
                  .HasForeignKey(e => e.CustomerId)
                  .OnDelete(DeleteBehavior.Restrict);       // Don't delete customer if they have orders
        });
    }
}
```

### How DbContext Connects

```
appsettings.json (connection string: Server=localhost;Database=FoodOrderingDB)
    |
    v
Program.cs (registers: AddDbContext<AppDbContext>(options => options.UseMySql(...)))
    |
    v
AppDbContext.cs (defines DbSets + relationships)
    |
    v
All Repositories (inject AppDbContext, use _context.Customers, _context.Orders, etc.)
    |
    v
MySQL Database (schema.sql defines the actual tables)
```

---

## 10. Middleware (ExceptionMiddleware)

### What is Middleware?
Middleware is code that runs on **every HTTP request** before it reaches the controller, and on the response going back. Think of it as a pipeline.

### Request Pipeline in this Project:
```
HTTP Request
    |
    v
ExceptionMiddleware   --> Catches any unhandled exceptions
    |
    v
CORS Middleware       --> Allows Angular (port 4200) to call the API (port 5000)
    |
    v
Rate Limiter          --> Blocks if too many requests
    |
    v
Authentication        --> Validates JWT token
    |
    v
Authorization         --> Checks if user has the right role
    |
    v
Controller            --> Handles the request
    |
    v
Response goes back through the same pipeline in reverse
```

### Real Example — `backend/Middleware/ExceptionMiddleware.cs`:
```csharp
public async Task InvokeAsync(HttpContext context)
{
    try
    {
        await _next(context);    // Pass to the next middleware/controller
    }
    catch (Exception ex)
    {
        // If ANY unhandled exception occurs anywhere in the pipeline:
        await HandleExceptionAsync(context, ex);
    }
}

// Maps exception types to HTTP status codes:
// UnauthorizedAccessException  --> 401 Unauthorized
// KeyNotFoundException         --> 404 Not Found
// InvalidOperationException    --> 400 Bad Request
// Everything else              --> 500 Internal Server Error
```

### Why?
Without this middleware, an unhandled exception would crash the API or return an ugly error page. This ensures the API always returns clean JSON error responses.

---

## 11. JWT Authentication

### What is JWT?
JWT (JSON Web Token) is a way to prove "I am user X" without sending username/password on every request. After login, the server returns a signed token. The frontend stores it and sends it with every subsequent request.

### How It Works in This Project:

```
1. User logs in
   Frontend: POST /api/auth/login { email, password }
   
2. Server verifies credentials and creates a JWT
   AuthService.cs --> JwtHelper.cs generates token containing:
   {
     "CustomerId": 1,
     "email": "user@email.com",
     "role": "Customer",
     "exp": 1234567890
   }
   Signed with secret key from appsettings.json

3. Frontend stores the token
   auth.service.ts --> localStorage.setItem('token', token)

4. Every future request includes the token
   auth.interceptor.ts --> Adds header: Authorization: Bearer <token>

5. Server validates the token on protected endpoints
   [Authorize] attribute --> JWT middleware checks signature & expiry
   [Authorize(Roles = "Admin")] --> Also checks the role claim
```

### Files Involved:
```
appsettings.json         --> JwtSettings: Key, Issuer, Audience, ExpiryMinutes
JwtHelper.cs             --> GenerateToken(customer) creates the JWT
AuthService.cs           --> Calls JwtHelper after successful login
AuthController.cs        --> Returns token to frontend
Program.cs               --> Configures JWT validation middleware
auth.service.ts          --> Stores token in localStorage
auth.interceptor.ts      --> Attaches token to every HTTP request
auth.guard.ts            --> Checks if token exists before allowing route access
admin.guard.ts           --> Checks if token has Admin role
```

---

## 12. BCrypt Password Hashing

### What is it?
BCrypt is a one-way hashing algorithm. When a user registers, we hash their password before storing it. When they login, we hash the input and compare.

### Why not store plain passwords?
If the database is compromised, attackers would have everyone's password. With BCrypt, they only get hashes which are practically impossible to reverse.

### Real Usage in `AuthService.cs`:
```csharp
// Registration - hash the password
PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
// Input:  "Admin@123"
// Stored: "$2a$11$xnCkdwNKz42C2dALbueP9OYPjnybQH9LmIK/kvtWBt.rSSmNTHto6"

// Login - verify the password
BCrypt.Net.BCrypt.Verify(dto.Password, customer.PasswordHash)
// Compares "Admin@123" against the hash, returns true/false
```

---

## 13. Rate Limiting

### What is it?
Rate limiting restricts how many API requests a client can make in a given time window, protecting against brute force attacks and abuse.

### Configuration in `Program.cs`:
```csharp
// General: 100 requests per minute per IP
options.AddPolicy("fixed", context =>
    RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString(),
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1)
        }));

// Auth endpoints: 10 requests per minute per IP (stricter)
options.AddPolicy("auth", ...PermitLimit = 10...);
```

When exceeded, the API returns `429 Too Many Requests`.

---

## 14. CORS (Cross-Origin Resource Sharing)

### What is it?
Browsers block requests from one origin (localhost:4200) to another (localhost:5000) by default. CORS tells the browser "it's okay, allow requests from Angular."

### Configuration in `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")   // Angular's URL
              .AllowAnyHeader()                        // Allow Authorization header
              .AllowAnyMethod()                        // Allow GET, POST, PUT, DELETE
              .AllowCredentials();                     // Allow cookies/tokens
    });
});
```

---

## 15. Angular Standalone Components

### What are they?
In Angular 19, components can declare their own imports directly instead of needing an NgModule. Each component is self-contained.

### Real Example — any component in the project:
```typescript
@Component({
  selector: 'app-menu-list',
  standalone: true,                          // No NgModule needed
  imports: [                                 // Declare what this component uses
    MatCardModule, MatButtonModule,
    CurrencyPipe, SlicePipe, AsyncPipe
  ],
  template: `...`,
  styles: [`...`]
})
export class MenuListComponent { ... }
```

### Angular 19 Control Flow:
Instead of `*ngIf` and `*ngFor`, this project uses the new syntax:
```html
@if (isLoggedIn$ | async) {
  <a routerLink="/orders">Orders</a>
}
@for (item of menuItems; track item.menuItemId) {
  <mat-card>{{ item.name }}</mat-card>
}
```

---

## 16. Angular Services (Frontend)

### What are they?
Angular services call the backend API using `HttpClient`. They are injectable singletons shared across components.

### Real Example — `frontend/services/auth.service.ts`:
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto);
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, dto);
  }
}
```

### How Frontend Services Connect to Backend Controllers:

```
auth.service.ts     POST /api/auth/login     -->  AuthController.Login()
menu.service.ts     GET  /api/menu           -->  MenuController.GetAll()
cart.service.ts     POST /api/cart            -->  CartController.AddToCart()
order.service.ts    POST /api/orders          -->  OrdersController.PlaceOrder()
coupon.service.ts   GET  /api/coupons         -->  CouponsController.GetActive()
```

---

## 17. HTTP Interceptor

### What is it?
An interceptor sits between Angular's HttpClient and the network. It modifies every outgoing request — in this case, attaching the JWT token.

### Real Example — `frontend/interceptors/auth.interceptor.ts`:
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);    // Send request with token
  }
  return next(req);         // Send request without token
};
```

### Without Interceptor:
You'd have to manually add the token to every single HTTP call in every service:
```typescript
this.http.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
```

### With Interceptor:
Just call normally — the token is added automatically:
```typescript
this.http.get('/api/orders')   // Interceptor adds the header
```

---

## 18. Route Guards

### What are they?
Guards protect routes from unauthorized access. They run before navigation and can allow or deny it.

### `auth.guard.ts` — Protects logged-in-only pages:
```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated()) {
    return true;           // Allow navigation
  }
  router.navigate(['/login']);  // Redirect to login
  return false;            // Block navigation
};
```

### `admin.guard.ts` — Protects admin-only pages:
Checks both authentication AND that the user's role is "Admin".

### Usage in `app.routes.ts`:
```typescript
{ path: 'cart', component: CartComponent, canActivate: [authGuard] },        // Any logged-in user
{ path: 'admin', component: AdminDashboard, canActivate: [adminGuard] },     // Admin only
{ path: 'login', component: LoginComponent },                                 // No guard (public)
```

---

## 19. Angular Models/Interfaces

### What are they?
TypeScript interfaces that define the shape of data on the frontend — they mirror the backend DTOs.

### Real Example — `frontend/models/coupon.model.ts`:
```typescript
// Mirrors CouponDto from backend/DTOs/CouponDTOs.cs
export interface Coupon {
  couponId: number;
  code: string;
  discountPercent: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
}
```

### Why?
TypeScript interfaces provide compile-time type checking. If the backend returns `discountPercent` but your code tries to access `discountPercentage`, TypeScript catches the error before runtime.

---

## 20. Reactive Forms & Validation

### What are they?
Angular Reactive Forms let you define form controls and validation rules in TypeScript code (not the template).

### Real Example — Registration form validation:
```typescript
this.form = this.fb.group({
  name: ['', [Validators.required]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])/)
    // Must have: lowercase + uppercase + number + special character
  ]],
  phone: ['', [Validators.required]],
  address: ['', [Validators.required]]
});
```

The submit button is disabled until all validations pass:
```html
<button [disabled]="form.invalid">Register</button>
```

---

## 21. Lazy Loading & Routing

### What is Lazy Loading?
Components are loaded only when the user navigates to their route, not at app startup. This makes the initial page load faster.

### Real Example — `frontend/app.routes.ts`:
```typescript
export const routes: Routes = [
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart/cart.component')  // Loaded on demand
      .then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'rewards',
    loadComponent: () => import('./pages/rewards/rewards.component')
      .then(m => m.RewardsComponent),
    canActivate: [authGuard]
  }
];
```

---

## 22. Complete Request Flow (End-to-End)

Here's what happens when a user clicks "Add to Cart":

```
1. FRONTEND: CartComponent calls cartService.addToCart({ menuItemId: 5, quantity: 2 })

2. ANGULAR SERVICE: cart.service.ts makes HTTP POST to http://localhost:5000/api/cart
   with body: { menuItemId: 5, quantity: 2 }

3. INTERCEPTOR: auth.interceptor.ts clones the request and adds:
   Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

4. CORS: Browser sends OPTIONS preflight → server responds "4200 is allowed"

5. RATE LIMITER: Checks if this IP has made < 100 requests this minute

6. EXCEPTION MIDDLEWARE: Wraps everything in try-catch

7. JWT MIDDLEWARE: Validates the token signature, extracts CustomerId from claims

8. CONTROLLER: CartController.AddToCart() receives AddToCartDto
   Extracts CustomerId from JWT claims

9. SERVICE: CartService.AddToCartAsync() runs business logic:
   - Checks if menu item exists and is in stock
   - Finds or creates the customer's cart
   - Adds the item or increases quantity

10. REPOSITORY: CartRepository calls _context.CartItems.Add(...)
    Then _context.SaveChangesAsync()

11. DBCONTEXT: Entity Framework translates to SQL:
    INSERT INTO CartItems (CartId, MenuItemId, Quantity) VALUES (1, 5, 2)

12. MYSQL: Executes the SQL, returns success

13. RESPONSE flows back: Repository → Service → Controller → JSON response
    CartDto is returned with the updated cart contents

14. FRONTEND: cart.component.ts receives the response, updates the UI
    Snackbar shows "Item added to cart!"
```

---

## File Connection Map (Complete)

```
appsettings.json
    |- Connection String --> Program.cs --> AppDbContext.cs --> All Repositories
    |- JWT Settings      --> Program.cs --> JwtHelper.cs --> AuthService.cs
    |- CORS Origins      --> Program.cs --> Middleware Pipeline

Program.cs (wires everything together via DI)
    |- Registers: Repositories, Services, Helpers, Middleware, Auth, CORS, Rate Limiting

schema.sql --> MySQL Tables --> AppDbContext.cs --> Entities/*.cs

Entities/*.cs <-- mapped by --> MappingProfile.cs --> DTOs/*.cs

DTOs/*.cs <-- used by --> Controllers/*.cs <-- calls --> Services/*.cs <-- calls --> Repositories/*.cs

Frontend:
  app.routes.ts --> loads pages lazily, applies guards
  guards/*.ts --> check auth.service.ts for login/admin status
  interceptors/auth.interceptor.ts --> attaches token from localStorage
  services/*.ts --> HTTP calls to backend controllers
  models/*.ts --> TypeScript interfaces matching backend DTOs
  pages/**/*.component.ts --> UI components using services + models
  shared/navbar/navbar.component.ts --> shared navigation across all pages
```

---

## Summary Table

| Concept | Purpose | Backend File(s) | Frontend File(s) |
|---------|---------|-----------------|-------------------|
| DTO | Shape API data | DTOs/*.cs | models/*.ts |
| Entity | Map database tables | Entities/*.cs | - |
| Repository | Database access | Repositories/*.cs | - |
| Service | Business logic | Services/*.cs | services/*.ts |
| Controller | API endpoints | Controllers/*.cs | - |
| DbContext | EF Core DB bridge | Data/AppDbContext.cs | - |
| AutoMapper | Entity-DTO conversion | Helpers/MappingProfile.cs | - |
| JWT | Authentication tokens | Helpers/JwtHelper.cs | auth.service.ts, auth.interceptor.ts |
| Middleware | Request pipeline | Middleware/*.cs | - |
| Guard | Route protection | - | guards/*.ts |
| Interceptor | Modify HTTP requests | - | interceptors/*.ts |
| Rate Limiting | Abuse prevention | Program.cs | - |
| CORS | Cross-origin access | Program.cs | - |
| Reactive Forms | Form validation | - | register.component.ts |
| Lazy Loading | On-demand loading | - | app.routes.ts |
