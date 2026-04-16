using FoodOrderingAPI.DTOs;

namespace FoodOrderingAPI.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<CustomerProfileDto> GetProfileAsync(int customerId);
}
