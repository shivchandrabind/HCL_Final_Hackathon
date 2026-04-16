using FoodOrderingAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodOrderingAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasOne(e => e.Cart)
                  .WithOne(c => c.Customer)
                  .HasForeignKey<Cart>(c => c.CustomerId);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(e => e.Name).IsUnique();
        });

        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.HasOne(e => e.Category)
                  .WithMany(c => c.MenuItems)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => e.CategoryId);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasOne(e => e.Customer)
                  .WithMany(c => c.Orders)
                  .HasForeignKey(e => e.CustomerId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => e.CustomerId);
            entity.HasIndex(e => e.Status);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasOne(e => e.Order)
                  .WithMany(o => o.OrderItems)
                  .HasForeignKey(e => e.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.MenuItem)
                  .WithMany()
                  .HasForeignKey(e => e.MenuItemId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => e.OrderId);
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.ToTable("Cart");
            entity.HasIndex(e => e.CustomerId).IsUnique();
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasOne(e => e.Cart)
                  .WithMany(c => c.CartItems)
                  .HasForeignKey(e => e.CartId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.MenuItem)
                  .WithMany()
                  .HasForeignKey(e => e.MenuItemId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => e.CartId);
            entity.HasIndex(e => new { e.CartId, e.MenuItemId }).IsUnique();
        });

        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
        });
    }
}
