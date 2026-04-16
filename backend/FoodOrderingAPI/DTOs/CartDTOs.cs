using System.ComponentModel.DataAnnotations;

namespace FoodOrderingAPI.DTOs;

public class CartDto
{
    public int CartId { get; set; }
    public int CustomerId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
}

public class CartItemDto
{
    public int CartItemId { get; set; }
    public int MenuItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}

public class AddToCartDto
{
    [Required]
    public int MenuItemId { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemDto
{
    [Required, Range(1, 100)]
    public int Quantity { get; set; }
}
