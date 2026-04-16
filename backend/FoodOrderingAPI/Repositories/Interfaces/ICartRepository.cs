using FoodOrderingAPI.Entities;

namespace FoodOrderingAPI.Repositories.Interfaces;

public interface ICartRepository
{
    Task<Cart?> GetByCustomerIdAsync(int customerId);
    Task<Cart> CreateCartAsync(int customerId);
    Task<CartItem?> GetCartItemAsync(int cartId, int menuItemId);
    Task<CartItem> AddCartItemAsync(CartItem cartItem);
    Task UpdateCartItemAsync(CartItem cartItem);
    Task RemoveCartItemAsync(int cartItemId);
    Task ClearCartAsync(int cartId);
}
