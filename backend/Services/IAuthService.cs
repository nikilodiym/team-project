using FormBuilderAPI.Models.DTOs.Auth;

namespace FormBuilderAPI.Services;

public interface IAuthService
{
    Task<TokenDto> RegisterAsync(RegisterDto dto);
    Task<TokenDto> LoginAsync(LoginDto dto);
    Task<TokenDto> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(Guid userId);
}
