using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FoodOrderingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("fixed")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return CreatedAtAction(nameof(Register), result);
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<CustomerProfileDto>> GetProfile()
    {
        var customerId = int.Parse(User.FindFirst("CustomerId")!.Value);
        var profile = await _authService.GetProfileAsync(customerId);
        return Ok(profile);
    }
}
