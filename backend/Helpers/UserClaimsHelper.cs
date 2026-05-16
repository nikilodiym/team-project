using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FormBuilderAPI.Helpers;

public static class UserClaimsHelper
{
    public static Guid? GetUserId(ClaimsPrincipal user)
    {
        var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return Guid.TryParse(id, out var userId) ? userId : null;
    }
}
