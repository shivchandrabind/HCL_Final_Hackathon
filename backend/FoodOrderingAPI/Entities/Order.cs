using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodOrderingAPI.Entities;

[Table("Orders")]
public class Order
{
    [Key]
    public int OrderId { get; set; }

    public int CustomerId { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(10,2)")]
    public decimal TotalAmount { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [MaxLength(50)]
    public string? CouponCode { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    [MaxLength(500)]
    public string? DeliveryAddress { get; set; }

    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; } = null!;

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
