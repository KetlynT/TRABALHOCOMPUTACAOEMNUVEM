using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain
{
    public class ActivityLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        [Required]
        public string UserId { get; set; }
        public ApplicationUser? User { get; set; }
        public Guid? ProjectId { get; set; }
        public Project? Project { get; set; }
        public Guid? TaskItemId { get; set; }
        public TaskItem? TaskItem { get; set; }
    }
}