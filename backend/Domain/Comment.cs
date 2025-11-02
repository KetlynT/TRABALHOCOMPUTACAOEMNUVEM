using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain
{
    public class Comment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Required]
        public string AuthorId { get; set; } = string.Empty;
        public ApplicationUser? Author { get; set; }
        public Guid TaskItemId { get; set; }
        public TaskItem? TaskItem { get; set; }
    }
}