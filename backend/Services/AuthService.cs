using Microsoft.EntityFrameworkCore;
using FormBuilderAPI.Data;
using FormBuilderAPI.Models.Entities;
using FormBuilderAPI.Models.DTOs.Auth;
using FormBuilderAPI.Helpers;

namespace FormBuilderAPI.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly JwtHelper _jwtHelper;

    public AuthService(AppDbContext context, JwtHelper jwtHelper)
    {
        _context = context;
        _jwtHelper = jwtHelper;
    }

    public async Task<TokenDto> RegisterAsync(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        var user = new User
        {
            Email = dto.Email,
            DisplayName = dto.DisplayName,
            PasswordHash = PasswordHelper.HashPassword(dto.Password),
            RefreshToken = _jwtHelper.GenerateRefreshToken(),
            RefreshTokenExpiryTime = _jwtHelper.GetRefreshTokenExpiry()
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return GenerateTokenDto(user);
    }

    public async Task<TokenDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !PasswordHelper.VerifyPassword(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        user.RefreshToken = _jwtHelper.GenerateRefreshToken();
        user.RefreshTokenExpiryTime = _jwtHelper.GetRefreshTokenExpiry();
        await _context.SaveChangesAsync();

        return GenerateTokenDto(user);
    }

    public async Task<TokenDto> RefreshTokenAsync(string refreshToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        user.RefreshToken = _jwtHelper.GenerateRefreshToken();
        user.RefreshTokenExpiryTime = _jwtHelper.GetRefreshTokenExpiry();
        await _context.SaveChangesAsync();

        return GenerateTokenDto(user);
    }

    public async Task LogoutAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _context.SaveChangesAsync();
        }
    }

    private TokenDto GenerateTokenDto(User user)
    {
        var accessToken = _jwtHelper.GenerateAccessToken(user.Id, user.Email);
        var expirationMinutes = int.Parse(_jwtHelper.GetType().GetProperty("_configuration")?.GetValue(_jwtHelper)?.ToString() ?? "15");

        return new TokenDto
        {
            AccessToken = accessToken,
            RefreshToken = user.RefreshToken!,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                PhotoUrl = user.PhotoUrl
            }
        };
    }
}
