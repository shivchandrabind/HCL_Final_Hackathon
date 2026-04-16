using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrderingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService) => _orderService = orderService;

    private int GetCustomerId() => int.Parse(User.FindFirst("CustomerId")!.Value);

    [HttpPost]
    public async Task<ActionResult<OrderDto>> PlaceOrder([FromBody] PlaceOrderDto dto)
    {
        var order = await _orderService.PlaceOrderAsync(GetCustomerId(), dto);
        return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, order);
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetCustomerOrders()
    {
        var orders = await _orderService.GetCustomerOrdersAsync(GetCustomerId());
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPost("{id}/reorder")]
    public async Task<ActionResult<OrderDto>> Reorder(int id)
    {
        var order = await _orderService.ReorderAsync(GetCustomerId(), id);
        return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, order);
    }
}
