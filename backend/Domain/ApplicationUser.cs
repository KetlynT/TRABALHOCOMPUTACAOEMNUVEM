using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain
{
    public class ApplicationUser : IdentityUser
    {
        [MaxLength(100)]
        public string? FullName { get; set; }
        
        public List<ProjectMember> ProjectMemberships { get; set; } = new();
    }
}