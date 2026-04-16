using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodOrderingAPI.Entities;

[Table("OrderItems")]
public class OrderItem
{
    [Key]
    public int OrderItemId { get; set; }

    public int OrderId { get; set; }

    public int MenuItemId { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }

    [ForeignKey("OrderId")]
    public Order Order { get; set; } = null!;

    [ForeignKey("MenuItemId")]
    public MenuItem MenuItem { get; set; } = null!;
}
