using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrderingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminController(IOrderService orderService) => _orderService = orderService;

    [HttpGet("orders")]
    public async Task<ActionResult<List<OrderDto>>> GetAllOrders([FromQuery] string? status = null)
    {
        var orders = await _orderService.GetAllOrdersAsync(status);
        return Ok(orders);
    }

    [HttpPut("orders/{id}/status")]
    public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _orderService.UpdateOrderStatusAsync(id, dto);
        if (order == null) return NotFound();
        return Ok(order);
    }
}
