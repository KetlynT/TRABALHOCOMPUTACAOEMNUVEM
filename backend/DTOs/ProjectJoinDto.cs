using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.DTOs
{
    public class ProjectJoinDto
    {
        [Required]
        public string InviteCode { get; set; } = string.Empty;
    }
}