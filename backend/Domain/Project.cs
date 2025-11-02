using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain
{
    public class Project
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public string OwnerId { get; set; } = string.Empty;
        public ApplicationUser? Owner { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Board> Boards { get; set; } = new();
    }
}