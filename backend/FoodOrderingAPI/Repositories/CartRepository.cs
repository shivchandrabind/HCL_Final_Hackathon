using FoodOrderingAPI.Data;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodOrderingAPI.Repositories;

public class CartRepository : ICartRepository
{
    private readonly AppDbContext _context;

    public CartRepository(AppDbContext context) => _context = context;

    public async Task<Cart?> GetByCustomerIdAsync(int customerId) =>
        await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.MenuItem)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

    public async Task<Cart> CreateCartAsync(int customerId)
    {
        var cart = new Cart { CustomerId = customerId };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();
        return cart;
    }

    public async Task<CartItem?> GetCartItemAsync(int cartId, int menuItemId) =>
        await _context.CartItems.FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.MenuItemId == menuItemId);

    public async Task<CartItem> AddCartItemAsync(CartItem cartItem)
    {
        _context.CartItems.Add(cartItem);
        await _context.SaveChangesAsync();
        return cartItem;
    }

    public async Task UpdateCartItemAsync(CartItem cartItem)
    {
        _context.CartItems.Update(cartItem);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveCartItemAsync(int cartItemId)
    {
        var item = await _context.CartItems.FindAsync(cartItemId);
        if (item != null)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ClearCartAsync(int cartId)
    {
        var items = await _context.CartItems.Where(ci => ci.CartId == cartId).ToListAsync();
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
    }
}
