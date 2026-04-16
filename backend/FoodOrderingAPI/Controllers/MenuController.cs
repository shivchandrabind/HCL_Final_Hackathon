using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrderingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly IMenuService _menuService;

    public MenuController(IMenuService menuService) => _menuService = menuService;

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] int? categoryId = null)
    {
        var (items, totalCount) = await _menuService.GetAllAsync(page, pageSize, categoryId);
        return Ok(new { Items = items, TotalCount = totalCount, Page = page, PageSize = pageSize });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MenuItemDto>> GetById(int id)
    {
        var item = await _menuService.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MenuItemDto>> Create([FromBody] CreateMenuItemDto dto)
    {
        var item = await _menuService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.MenuItemId }, item);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MenuItemDto>> Update(int id, [FromBody] UpdateMenuItemDto dto)
    {
        var item = await _menuService.UpdateAsync(id, dto);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _menuService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
