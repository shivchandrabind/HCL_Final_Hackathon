using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Helpers;
using FoodOrderingAPI.Repositories.Interfaces;
using FoodOrderingAPI.Services.Interfaces;

namespace FoodOrderingAPI.Services;

public class AuthService : IAuthService
{
    private readonly ICustomerRepository _customerRepo;
    private readonly JwtHelper _jwtHelper;

    public AuthService(ICustomerRepository customerRepo, JwtHelper jwtHelper)
    {
        _customerRepo = customerRepo;
        _jwtHelper = jwtHelper;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await _customerRepo.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new InvalidOperationException("Email already registered.");

        var customer = new Customer
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            Address = dto.Address,
            Role = "Customer"
        };

        await _customerRepo.CreateAsync(customer);
        var token = _jwtHelper.GenerateToken(customer);

        return new AuthResponseDto
        {
            Token = token,
            Role = customer.Role,
            Name = customer.Name,
            CustomerId = customer.CustomerId,
            Email = customer.Email,
            LoyaltyPoints = customer.LoyaltyPoints
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var customer = await _customerRepo.GetByEmailAsync(dto.Email);
        if (customer == null || !BCrypt.Net.BCrypt.Verify(dto.Password, customer.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        var token = _jwtHelper.GenerateToken(customer);

        return new AuthResponseDto
        {
            Token = token,
            Role = customer.Role,
            Name = customer.Name,
            CustomerId = customer.CustomerId,
            Email = customer.Email,
            LoyaltyPoints = customer.LoyaltyPoints
        };
    }

    public async Task<CustomerProfileDto> GetProfileAsync(int customerId)
    {
        var customer = await _customerRepo.GetByIdAsync(customerId);
        if (customer == null)
            throw new KeyNotFoundException("Customer not found.");

        return new CustomerProfileDto
        {
            CustomerId = customer.CustomerId,
            Name = customer.Name,
            Email = customer.Email,
            Phone = customer.Phone,
            Address = customer.Address,
            LoyaltyPoints = customer.LoyaltyPoints,
            CreatedAt = customer.CreatedAt
        };
    }
}
