using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain
{
    public class TaskItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Position { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DueDate { get; set; }
        public Guid BoardId { get; set; }
        public Board? Board { get; set; }
        public string? AssigneeId { get; set; }
        public ApplicationUser? Assignee { get; set; }
        public List<Comment> Comments { get; set; } = new();
        public List<TaskAttachment> Attachments { get; set; } = new();
        public DateTime? DeletedAt { get; set; }
    }
}