using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FoodOrderingAPI.Entities;
using Microsoft.IdentityModel.Tokens;

namespace FoodOrderingAPI.Helpers;

public class JwtHelper
{
    private readonly IConfiguration _config;

    public JwtHelper(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(Customer customer)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("CustomerId", customer.CustomerId.ToString()),
            new Claim(ClaimTypes.Email, customer.Email),
            new Claim(ClaimTypes.Role, customer.Role),
            new Claim(ClaimTypes.Name, customer.Name)
        };

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["JwtSettings:ExpiryMinutes"]!)),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
