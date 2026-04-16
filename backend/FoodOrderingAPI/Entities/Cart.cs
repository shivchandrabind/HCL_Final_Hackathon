using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodOrderingAPI.Entities;

[Table("Cart")]
public class Cart
{
    [Key]
    public int CartId { get; set; }

    public int CustomerId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; } = null!;

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
