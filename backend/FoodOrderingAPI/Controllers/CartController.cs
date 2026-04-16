using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrderingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer,Admin")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService) => _cartService = cartService;

    private int GetCustomerId() => int.Parse(User.FindFirst("CustomerId")!.Value);

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var cart = await _cartService.GetCartAsync(GetCustomerId());
        return Ok(cart);
    }

    [HttpPost]
    public async Task<ActionResult<CartDto>> AddToCart([FromBody] AddToCartDto dto)
    {
        var cart = await _cartService.AddToCartAsync(GetCustomerId(), dto);
        return Ok(cart);
    }

    [HttpPut("{cartItemId}")]
    public async Task<ActionResult<CartDto>> UpdateCartItem(int cartItemId, [FromBody] UpdateCartItemDto dto)
    {
        var cart = await _cartService.UpdateCartItemAsync(GetCustomerId(), cartItemId, dto);
        return Ok(cart);
    }

    [HttpDelete("{cartItemId}")]
    public async Task<ActionResult<CartDto>> RemoveCartItem(int cartItemId)
    {
        var cart = await _cartService.RemoveCartItemAsync(GetCustomerId(), cartItemId);
        return Ok(cart);
    }
}
