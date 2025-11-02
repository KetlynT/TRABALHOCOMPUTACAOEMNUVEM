using Microsoft.AspNetCore.Identity;

namespace ProjectManagement.Api.Domain;
public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
}
