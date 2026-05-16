using System.ComponentModel.DataAnnotations;

namespace FormBuilderAPI.Models.DTOs.Auth;

public class RefreshTokenDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
