using System;
using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain
{
    public class ProjectMember
    {

        [Required]
        public Guid ProjectId { get; set; }
        public Project? Project { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}