using System.ComponentModel.DataAnnotations;

namespace FoodOrderingAPI.DTOs;

public class OrderDto
{
    public int OrderId { get; set; }
    public int CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CouponCode { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int OrderItemId { get; set; }
    public int MenuItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Subtotal { get; set; }
}

public class PlaceOrderDto
{
    [MaxLength(500)]
    public string? DeliveryAddress { get; set; }

    [MaxLength(50)]
    public string? CouponCode { get; set; }
}

public class UpdateOrderStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
