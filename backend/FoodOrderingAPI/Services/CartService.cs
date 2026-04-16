using AutoMapper;
using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using FoodOrderingAPI.Services.Interfaces;

namespace FoodOrderingAPI.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepo;
    private readonly IMenuItemRepository _menuRepo;
    private readonly IMapper _mapper;

    public CartService(ICartRepository cartRepo, IMenuItemRepository menuRepo, IMapper mapper)
    {
        _cartRepo = cartRepo;
        _menuRepo = menuRepo;
        _mapper = mapper;
    }

    public async Task<CartDto> GetCartAsync(int customerId)
    {
        var cart = await _cartRepo.GetByCustomerIdAsync(customerId);
        if (cart == null)
        {
            cart = await _cartRepo.CreateCartAsync(customerId);
            cart = await _cartRepo.GetByCustomerIdAsync(customerId);
        }
        return _mapper.Map<CartDto>(cart);
    }

    public async Task<CartDto> AddToCartAsync(int customerId, AddToCartDto dto)
    {
        var menuItem = await _menuRepo.GetByIdAsync(dto.MenuItemId);
        if (menuItem == null)
            throw new KeyNotFoundException("Menu item not found.");

        if (!menuItem.IsAvailable || menuItem.StockQuantity < dto.Quantity)
            throw new InvalidOperationException("Item is not available or insufficient stock.");

        var cart = await _cartRepo.GetByCustomerIdAsync(customerId);
        if (cart == null)
            cart = await _cartRepo.CreateCartAsync(customerId);

        var existingItem = await _cartRepo.GetCartItemAsync(cart.CartId, dto.MenuItemId);
        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
            await _cartRepo.UpdateCartItemAsync(existingItem);
        }
        else
        {
            var cartItem = new CartItem
            {
                CartId = cart.CartId,
                MenuItemId = dto.MenuItemId,
                Quantity = dto.Quantity
            };
            await _cartRepo.AddCartItemAsync(cartItem);
        }

        return await GetCartAsync(customerId);
    }

    public async Task<CartDto> UpdateCartItemAsync(int customerId, int cartItemId, UpdateCartItemDto dto)
    {
        var cart = await _cartRepo.GetByCustomerIdAsync(customerId);
        if (cart == null)
            throw new KeyNotFoundException("Cart not found.");

        var cartItem = cart.CartItems.FirstOrDefault(ci => ci.CartItemId == cartItemId);
        if (cartItem == null)
            throw new KeyNotFoundException("Cart item not found.");

        cartItem.Quantity = dto.Quantity;
        await _cartRepo.UpdateCartItemAsync(cartItem);

        return await GetCartAsync(customerId);
    }

    public async Task<CartDto> RemoveCartItemAsync(int customerId, int cartItemId)
    {
        var cart = await _cartRepo.GetByCustomerIdAsync(customerId);
        if (cart == null)
            throw new KeyNotFoundException("Cart not found.");

        var cartItem = cart.CartItems.FirstOrDefault(ci => ci.CartItemId == cartItemId);
        if (cartItem == null)
            throw new KeyNotFoundException("Cart item not found.");

        await _cartRepo.RemoveCartItemAsync(cartItemId);

        return await GetCartAsync(customerId);
    }
}
