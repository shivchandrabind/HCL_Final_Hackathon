using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodOrderingAPI.Entities;

[Table("CartItems")]
public class CartItem
{
    [Key]
    public int CartItemId { get; set; }

    public int CartId { get; set; }

    public int MenuItemId { get; set; }

    public int Quantity { get; set; } = 1;

    [ForeignKey("CartId")]
    public Cart Cart { get; set; } = null!;

    [ForeignKey("MenuItemId")]
    public MenuItem MenuItem { get; set; } = null!;
}
